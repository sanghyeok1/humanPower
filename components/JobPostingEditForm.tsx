"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CategorySlug, CATEGORY_LABELS, WageType, ShiftType } from "@/types";
import type { JobPosting } from "@/lib/mockdb";

declare global {
  interface Window {
    daum: any;
  }
}

const DAUM_POSTCODE_SDK =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

function loadScriptOnce(src: string) {
  return new Promise<void>((resolve, reject) => {
    const exist = Array.from(document.scripts).some((s) => s.src === src);
    if (exist) return resolve();
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("script load error: " + src));
    document.head.appendChild(el);
  });
}

async function waitUntil(test: () => boolean, timeoutMs = 8000, step = 50) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (test()) return;
    await new Promise((r) => setTimeout(r, step));
  }
  throw new Error("timeout");
}

type Props = {
  employerName: string;
  posting: JobPosting;
};

export default function JobPostingEditForm({ employerName, posting }: Props) {
  const router = useRouter();

  // 필수 필드 - 기존 데이터로 초기화
  const [title, setTitle] = useState(posting.title);
  const [category, setCategory] = useState<CategorySlug>(posting.category);
  const [startDate, setStartDate] = useState(posting.start_date);
  const [durationDays, setDurationDays] = useState(posting.duration_days?.toString() || "");
  const [shiftType, setShiftType] = useState<ShiftType>(posting.shift_type);
  const [workHours, setWorkHours] = useState(posting.work_hours || "08:00-17:00");
  const [wageType, setWageType] = useState<WageType>(posting.wage_type);
  const [wageAmount, setWageAmount] = useState(posting.wage_amount.toString());
  const [wageNotes, setWageNotes] = useState(posting.wage_notes || "");

  // 주소
  const [postalCode, setPostalCode] = useState("");
  const [roadAddress, setRoadAddress] = useState(posting.address_detail);
  const [addressDong, setAddressDong] = useState(posting.address_dong);
  const [addressDetail, setAddressDetail] = useState(posting.address_detail);
  const [lat, setLat] = useState<number | null>(posting.lat);
  const [lng, setLng] = useState<number | null>(posting.lng);

  // 연락처
  const [contactName, setContactName] = useState(posting.contact_name);
  const [contactPhone, setContactPhone] = useState(posting.contact_phone);
  const [contactHours, setContactHours] = useState(posting.contact_hours || "");

  // 필요 인원
  const [requiredPositions, setRequiredPositions] = useState(posting.required_positions);

  // 선택 사항
  const [mealProvided, setMealProvided] = useState(posting.meal_provided || false);
  const [lodgingProvided, setLodgingProvided] = useState(posting.lodging_provided || false);
  const [equipmentProvided, setEquipmentProvided] = useState(posting.equipment_provided || false);
  const [preferredExperienceYears, setPreferredExperienceYears] = useState(posting.preferred_experience_years?.toString() || "");
  const [preferredCertificates, setPreferredCertificates] = useState(posting.preferred_certificates?.join(", ") || "");
  const [preferredDriverLicense, setPreferredDriverLicense] = useState(posting.preferred_driver_license || false);
  const [additionalNotes, setAdditionalNotes] = useState(posting.additional_notes || "");
  const [deadline, setDeadline] = useState(posting.deadline || "");
  const [paymentMethod, setPaymentMethod] = useState(posting.payment_method || "");

  // UI 상태
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refs = {
    title: useRef<HTMLInputElement>(null),
    contactPhone: useRef<HTMLInputElement>(null),
    addrBtn: useRef<HTMLButtonElement>(null),
  };

  // 유효성 검사
  const titleValid = useMemo(() => {
    const len = title.trim().length;
    return len >= 10 && len <= 60;
  }, [title]);

  const phoneValid = useMemo(() => {
    const d = contactPhone.replace(/\D/g, "");
    return d.length >= 10 && d.length <= 11;
  }, [contactPhone]);

  const addressValid = useMemo(
    () =>
      !!addressDong &&
      Number.isFinite(Number(lat)) &&
      Number.isFinite(Number(lng)),
    [addressDong, lat, lng]
  );

  const wageAmountValid = useMemo(() => {
    const amount = parseFloat(wageAmount);
    if (wageType === "hour") return amount >= 10000;
    if (wageType === "day") return amount >= 80000;
    if (wageType === "month") return amount >= 2000000;
    return false;
  }, [wageType, wageAmount]);

  const startDateValid = useMemo(() => {
    if (!startDate) return false;
    return true; // 수정 시에는 과거 날짜도 허용
  }, [startDate]);

  // 빠른 날짜 선택
  const setQuickDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setStartDate(date.toISOString().split("T")[0]);
  };

  // 우편번호 찾기
  async function openPostcode() {
    setMsg(null);
    try {
      await loadScriptOnce(DAUM_POSTCODE_SDK);
      await waitUntil(() => !!window.daum?.Postcode);
      new window.daum.Postcode({
        oncomplete: async (data: any) => {
          const addr = data.roadAddress || data.address || "";
          setPostalCode(data.zonecode || "");
          setRoadAddress(addr);

          const dongMatch = addr.match(/([가-힣]+동|[가-힣]+읍|[가-힣]+면)/);
          if (dongMatch) {
            setAddressDong(dongMatch[1]);
          }

          try {
            const r = await fetch(
              `/api/geocode?query=${encodeURIComponent(addr)}`,
              { cache: "no-store" }
            );
            const j = await r.json();
            if (!r.ok) throw new Error(j?.error || "좌표 조회 실패");
            setLat(j.lat);
            setLng(j.lng);
          } catch (e: any) {
            setLat(null);
            setLng(null);
            setMsg(e?.message ?? "좌표 변환 중 오류");
          }
        },
      }).open();
    } catch (e: any) {
      setMsg(e?.message ?? "우편번호 모듈 로딩 실패");
    }
  }

  // 제출
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const fail = (message: string, focus?: keyof typeof refs) => {
      setMsg(message);
      if (focus && refs[focus]?.current) refs[focus].current!.focus();
    };

    if (!titleValid) return fail("제목을 10~60자로 입력해주세요.", "title");
    if (!startDateValid) return fail("시작일을 입력해주세요.");
    if (!wageAmountValid) return fail("임금이 최저기준 이상이어야 합니다.");
    if (!addressValid) return fail("주소를 입력하고 좌표를 확인해주세요.", "addrBtn");
    if (!phoneValid) return fail("연락처를 정확히 입력해주세요.", "contactPhone");
    if (!requiredPositions.trim()) return fail("필요 인원/역할을 입력해주세요.");

    setSaving(true);
    try {
      const res = await fetch(`/api/my-postings/${posting.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          start_date: startDate,
          duration_days: durationDays ? parseInt(durationDays) : undefined,
          shift_type: shiftType,
          work_hours: workHours,
          wage_type: wageType,
          wage_amount: parseFloat(wageAmount),
          wage_notes: wageNotes,
          address_dong: addressDong,
          address_detail: addressDetail,
          lat,
          lng,
          required_positions: requiredPositions,
          contact_name: contactName || employerName,
          contact_phone: contactPhone,
          contact_hours: contactHours,
          meal_provided: mealProvided,
          lodging_provided: lodgingProvided,
          equipment_provided: equipmentProvided,
          preferred_experience_years: preferredExperienceYears
            ? parseInt(preferredExperienceYears)
            : undefined,
          preferred_certificates: preferredCertificates
            ? preferredCertificates.split(",").map((s) => s.trim())
            : undefined,
          preferred_driver_license: preferredDriverLicense,
          additional_notes: additionalNotes,
          deadline: deadline || undefined,
          payment_method: paymentMethod,
        }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        return fail(j?.error || "공고 수정에 실패했습니다.");
      }

      setMsg("공고가 수정되었습니다!");
      setTimeout(() => {
        router.push(`/post/${posting.id}`);
      }, 800);
    } catch {
      fail("네트워크 오류로 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
      {/* 제목 */}
      <label>
        제목 <span style={{ color: "#dc2626" }}>*</span>
        <input
          ref={refs.title}
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예) 내부마감 보조 2명"
          maxLength={60}
        />
        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
          {title.length}/60자 (최소 10자)
        </div>
      </label>

      {/* 카테고리 */}
      <label>
        카테고리 <span style={{ color: "#dc2626" }}>*</span>
        <select
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value as CategorySlug)}
        >
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {/* 작업 시작일 */}
      <div>
        <label>
          작업 시작일 <span style={{ color: "#dc2626" }}>*</span>
          <input
            className="input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="btn"
            style={{ fontSize: 12, padding: "6px 12px" }}
            onClick={() => setQuickDate(0)}
          >
            오늘
          </button>
          <button
            type="button"
            className="btn"
            style={{ fontSize: 12, padding: "6px 12px" }}
            onClick={() => setQuickDate(1)}
          >
            내일
          </button>
          <button
            type="button"
            className="btn"
            style={{ fontSize: 12, padding: "6px 12px" }}
            onClick={() => setQuickDate(2)}
          >
            모레
          </button>
        </div>
      </div>

      {/* 기간 */}
      <label>
        작업 기간 (일수)
        <input
          className="input"
          type="number"
          value={durationDays}
          onChange={(e) => setDurationDays(e.target.value)}
          placeholder="예) 7"
          min="1"
        />
      </label>

      {/* 근무시간/교대 */}
      <div style={{ display: "grid", gap: 8 }}>
        <label>
          교대 <span style={{ color: "#dc2626" }}>*</span>
          <select
            className="input"
            value={shiftType}
            onChange={(e) => setShiftType(e.target.value as ShiftType)}
          >
            <option value="day">주간</option>
            <option value="night">야간</option>
          </select>
        </label>
        <label>
          근무시간
          <input
            className="input"
            value={workHours}
            onChange={(e) => setWorkHours(e.target.value)}
            placeholder="예) 08:00-17:00"
          />
        </label>
      </div>

      {/* 임금 */}
      <div style={{ display: "grid", gap: 8 }}>
        <label>
          임금 형태 <span style={{ color: "#dc2626" }}>*</span>
          <select
            className="input"
            value={wageType}
            onChange={(e) => setWageType(e.target.value as WageType)}
          >
            <option value="day">일급</option>
            <option value="hour">시급</option>
            <option value="month">월급</option>
          </select>
        </label>
        <label>
          임금 금액 <span style={{ color: "#dc2626" }}>*</span>
          <input
            className="input"
            type="number"
            value={wageAmount}
            onChange={(e) => setWageAmount(e.target.value)}
            placeholder={
              wageType === "hour"
                ? "예) 15000"
                : wageType === "day"
                ? "예) 180000"
                : "예) 3000000"
            }
            min="0"
          />
        </label>
        <label>
          임금 비고 (세전/식대포함 등)
          <input
            className="input"
            value={wageNotes}
            onChange={(e) => setWageNotes(e.target.value)}
            placeholder="예) 세전, 식대 포함"
          />
        </label>
      </div>

      {/* 주소 */}
      <div style={{ display: "grid", gap: 8 }}>
        <label>
          주소 (동 단위) <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            placeholder="우편번호"
            value={postalCode}
            readOnly
            style={{ width: 140 }}
          />
          <button
            ref={refs.addrBtn}
            type="button"
            className="btn"
            onClick={openPostcode}
          >
            주소 찾기
          </button>
        </div>
        <input
          className="input"
          placeholder="도로명 주소"
          value={roadAddress}
          readOnly
        />
        <input
          className="input"
          placeholder="동 (자동 추출)"
          value={addressDong}
          onChange={(e) => setAddressDong(e.target.value)}
        />
        <input
          className="input"
          placeholder="상세 주소"
          value={addressDetail}
          onChange={(e) => setAddressDetail(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            placeholder="위도"
            value={lat ?? ""}
            readOnly
          />
          <input
            className="input"
            placeholder="경도"
            value={lng ?? ""}
            readOnly
          />
        </div>
        {!addressValid && roadAddress && (
          <div style={{ color: "#dc2626", fontSize: 12 }}>
            주소 선택 후 위/경도가 자동 입력되어야 합니다.
          </div>
        )}
      </div>

      {/* 필요 인원/역할 */}
      <label>
        필요 인원/역할 <span style={{ color: "#dc2626" }}>*</span>
        <input
          className="input"
          value={requiredPositions}
          onChange={(e) => setRequiredPositions(e.target.value)}
          placeholder="예) 형틀 2, 타설 1"
        />
      </label>

      {/* 연락 수단 */}
      <div style={{ display: "grid", gap: 8 }}>
        <label>
          담당자명
          <input
            className="input"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder={`기본값: ${employerName}`}
          />
        </label>
        <label>
          휴대폰 <span style={{ color: "#dc2626" }}>*</span>
          <input
            ref={refs.contactPhone}
            className="input"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="010-0000-0000"
          />
        </label>
        <label>
          통화 가능 시간
          <input
            className="input"
            value={contactHours}
            onChange={(e) => setContactHours(e.target.value)}
            placeholder="예) 09:00-18:00"
          />
        </label>
      </div>

      {/* 선택 사항 */}
      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          paddingTop: 16,
          marginTop: 8,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          선택 사항 (권장)
        </h3>

        {/* 제공 사항 */}
        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={mealProvided}
              onChange={(e) => setMealProvided(e.target.checked)}
            />
            <span>식대 제공</span>
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={lodgingProvided}
              onChange={(e) => setLodgingProvided(e.target.checked)}
            />
            <span>숙소 제공</span>
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={equipmentProvided}
              onChange={(e) => setEquipmentProvided(e.target.checked)}
            />
            <span>장비 제공</span>
          </label>
        </div>

        {/* 우대 조건 */}
        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          <label>
            경력 년수 (우대)
            <input
              className="input"
              type="number"
              value={preferredExperienceYears}
              onChange={(e) => setPreferredExperienceYears(e.target.value)}
              placeholder="예) 3"
              min="0"
            />
          </label>
          <label>
            자격증 (우대, 쉼표로 구분)
            <input
              className="input"
              value={preferredCertificates}
              onChange={(e) => setPreferredCertificates(e.target.value)}
              placeholder="예) 전기기능사, 안전교육 수료"
            />
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={preferredDriverLicense}
              onChange={(e) => setPreferredDriverLicense(e.target.checked)}
            />
            <span>운전 가능 우대</span>
          </label>
        </div>

        {/* 추가 정보 */}
        <label style={{ marginBottom: 12, display: "block" }}>
          추가 메모 (안전수칙, 집결장소, 준비물 등)
          <textarea
            className="input"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="예) 안전모, 안전화 필수 지참"
            rows={4}
          />
        </label>

        <label style={{ marginBottom: 12, display: "block" }}>
          마감일
          <input
            className="input"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>

        <label style={{ marginBottom: 12, display: "block" }}>
          결제/정산 방식
          <input
            className="input"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            placeholder="예) 당일 현금, 주급 계좌이체"
          />
        </label>
      </div>

      {msg && (
        <div
          className="notice"
          style={{ color: msg.includes("수정") ? "#16a34a" : "#dc2626" }}
        >
          {msg}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "수정 중…" : "공고 수정"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => router.back()}
        >
          취소
        </button>
      </div>
    </form>
  );
}
