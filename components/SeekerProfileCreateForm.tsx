"use client";

import { useState, useMemo, useRef } from "react";
import { CategorySlug, CATEGORY_LABELS, WageType, ShiftType } from "@/types";

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
  userName: string;
  userPhone: string;
  onSuccess?: (profileId: string) => void;
};

export default function SeekerProfileCreateForm({
  userName,
  userPhone,
  onSuccess,
}: Props) {
  // 필수 필드
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState(userPhone);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // 거점 주소
  const [postalCode, setPostalCode] = useState("");
  const [roadAddress, setRoadAddress] = useState("");
  const [baseAddressDong, setBaseAddressDong] = useState("");
  const [baseLat, setBaseLat] = useState<number | null>(null);
  const [baseLng, setBaseLng] = useState<number | null>(null);
  const [searchRadiusKm, setSearchRadiusKm] = useState("10");

  // 주 직종/기술
  const [mainCategory, setMainCategory] =
    useState<CategorySlug>("rebar_form_concrete");
  const [detailedSkills, setDetailedSkills] = useState("");

  // 경력
  const [totalExperienceYears, setTotalExperienceYears] = useState("");
  const [recentWorkHistory, setRecentWorkHistory] = useState([
    { period: "", site_name: "", company_name: "", role: "", main_tasks: "" },
    { period: "", site_name: "", company_name: "", role: "", main_tasks: "" },
    { period: "", site_name: "", company_name: "", role: "", main_tasks: "" },
  ]);

  // 희망 임금
  const [desiredWageType, setDesiredWageType] = useState<WageType>("day");
  const [desiredWageAmount, setDesiredWageAmount] = useState("");

  // 가능 일정/시간대
  const [availableStartDate, setAvailableStartDate] = useState("");
  const [availableNow, setAvailableNow] = useState(false);
  const [availableShift, setAvailableShift] = useState({
    day: true,
    night: false,
  });

  // 선택 사항
  const [profilePhoto, setProfilePhoto] = useState("");
  const [ownedEquipment, setOwnedEquipment] = useState("");
  const [licenses, setLicenses] = useState("");
  const [certificates, setCertificates] = useState<string[]>([]);
  const [introduction, setIntroduction] = useState("");

  // 알림 설정
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notificationRadiusKm, setNotificationRadiusKm] = useState("10");
  const [notificationStartDateFilters, setNotificationStartDateFilters] =
    useState({
      today: true,
      tomorrow: true,
    });
  const [notificationCategoryFilters, setNotificationCategoryFilters] =
    useState({
      rebar_form_concrete: true,
      interior_finish: false,
      mep: false,
    });
  const [notificationWageMin, setNotificationWageMin] = useState("");

  // UI 상태
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refs = {
    displayName: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    addrBtn: useRef<HTMLButtonElement>(null),
  };

  // 유효성 검사
  const phoneValid = useMemo(() => {
    const d = phone.replace(/\D/g, "");
    return d.length >= 10 && d.length <= 11;
  }, [phone]);

  const addressValid = useMemo(
    () =>
      !!roadAddress &&
      !!baseAddressDong &&
      Number.isFinite(Number(baseLat)) &&
      Number.isFinite(Number(baseLng)),
    [roadAddress, baseAddressDong, baseLat, baseLng]
  );

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

          // 동 추출
          const dongMatch = addr.match(/([가-힣]+동|[가-힣]+읍|[가-힣]+면)/);
          if (dongMatch) {
            setBaseAddressDong(dongMatch[1]);
          }

          try {
            const r = await fetch(
              `/api/geocode?query=${encodeURIComponent(addr)}`,
              { cache: "no-store" }
            );
            const j = await r.json();
            if (!r.ok) throw new Error(j?.error || "좌표 조회 실패");
            setBaseLat(j.lat);
            setBaseLng(j.lng);
          } catch (e: any) {
            setBaseLat(null);
            setBaseLng(null);
            setMsg(e?.message ?? "좌표 변환 중 오류");
          }
        },
      }).open();
    } catch (e: any) {
      setMsg(e?.message ?? "우편번호 모듈 로딩 실패");
    }
  }

  // 전화번호 인증 (데모)
  const demoVerifyPhone = () => {
    if (!phoneValid) {
      setMsg("유효한 전화번호를 입력해주세요.");
      return;
    }
    setPhoneVerified(true);
    setMsg("전화번호가 인증되었습니다. (데모)");
  };

  // 빠른 날짜 선택
  const setQuickAvailableDate = () => {
    setAvailableNow(true);
    setAvailableStartDate("");
  };

  // 경력 입력 핸들러
  const updateWorkHistory = (index: number, field: string, value: string) => {
    const updated = [...recentWorkHistory];
    updated[index] = { ...updated[index], [field]: value };
    setRecentWorkHistory(updated);
  };

  // 제출
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const fail = (message: string, focus?: keyof typeof refs) => {
      setMsg(message);
      if (focus && refs[focus]?.current) refs[focus].current!.focus();
    };

    if (!displayName.trim())
      return fail("표시명(닉네임)을 입력해주세요.", "displayName");
    if (!phoneValid)
      return fail("전화번호를 정확히 입력해주세요.", "phone");
    if (!phoneVerified)
      return fail("전화번호 인증이 필요합니다.", "phone");
    if (!addressValid)
      return fail("거점 주소를 입력하고 좌표를 확인해주세요.", "addrBtn");

    setSaving(true);
    try {
      const res = await fetch("/api/me/seeker-profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: userName,
          display_name: displayName.trim(),
          phone,
          base_address_dong: baseAddressDong,
          base_lat: baseLat,
          base_lng: baseLng,
          search_radius_km: parseFloat(searchRadiusKm),
          main_category: mainCategory,
          detailed_skills: detailedSkills
            ? detailedSkills.split(",").map((s) => s.trim())
            : undefined,
          total_experience_years: totalExperienceYears
            ? parseFloat(totalExperienceYears)
            : undefined,
          recent_work_history: recentWorkHistory.filter((h) => h.period),
          desired_wage_type: desiredWageType,
          desired_wage_amount: desiredWageAmount
            ? parseFloat(desiredWageAmount)
            : undefined,
          available_start_date: availableNow ? "즉시" : availableStartDate,
          available_shift: Object.entries(availableShift)
            .filter(([_, v]) => v)
            .map(([k]) => k),
          profile_photo: profilePhoto,
          owned_equipment: ownedEquipment
            ? ownedEquipment.split(",").map((s) => s.trim())
            : undefined,
          licenses: licenses ? licenses.split(",").map((s) => s.trim()) : undefined,
          certificates: certificates,
          introduction: introduction,
          notification_settings: {
            enabled: notificationEnabled,
            radius_km: parseFloat(notificationRadiusKm),
            start_date_filters: Object.entries(notificationStartDateFilters)
              .filter(([_, v]) => v)
              .map(([k]) => k),
            category_filters: Object.entries(notificationCategoryFilters)
              .filter(([_, v]) => v)
              .map(([k]) => k) as CategorySlug[],
            wage_min: notificationWageMin
              ? parseFloat(notificationWageMin)
              : undefined,
          },
        }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        return fail(j?.error || "프로필 등록에 실패했습니다.");
      }

      setMsg("프로필이 등록되었습니다!");
      setTimeout(() => {
        if (onSuccess) onSuccess(j.profile_id);
        else window.location.href = "/mypage";
      }, 800);
    } catch {
      fail("네트워크 오류로 등록에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h3 className="card-title">기본 정보</h3>
      <div className="detail-grid" style={{ marginBottom: 16 }}>
        <div className="kv">
          <label className="kv-key">이름</label>
          <div className="kv-val">{userName}</div>
        </div>

        <div className="kv">
          <label className="kv-key">표시명(닉네임) <span style={{ color: "#dc2626" }}>*</span></label>
          <input
            ref={refs.displayName}
            type="text"
            className="kv-val"
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="예) 철근왕"
            maxLength={20}
            required
          />
        </div>

        <div className="kv">
          <label className="kv-key">휴대폰 <span style={{ color: "#dc2626" }}>*</span></label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              ref={refs.phone}
              type="tel"
              style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", flex: 1 }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
            />
            <button
              type="button"
              className="btn"
              onClick={demoVerifyPhone}
              disabled={!phoneValid || phoneVerified}
            >
              {phoneVerified ? "인증됨" : "인증"}
            </button>
          </div>
          {phoneVerified && (
            <div style={{ color: "#16a34a", fontSize: 12, marginTop: 4 }}>
              ✓ 전화번호가 인증되었습니다.
            </div>
          )}
        </div>
      </div>

      <h3 className="card-title" style={{ marginTop: 24 }}>거점 주소</h3>
      <div className="detail-grid" style={{ marginBottom: 16 }}>
        <div className="kv">
          <label className="kv-key">우편번호 <span style={{ color: "#dc2626" }}>*</span></label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: 140 }}
              placeholder="우편번호"
              value={postalCode}
              readOnly
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
        </div>

        <div className="kv">
          <label className="kv-key">도로명 주소</label>
          <input
            type="text"
            className="kv-val"
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            placeholder="주소 찾기 버튼을 클릭하세요"
            value={roadAddress}
            readOnly
          />
        </div>

        <div className="kv">
          <label className="kv-key">동/읍/면</label>
          <input
            type="text"
            className="kv-val"
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            placeholder="자동 추출"
            value={baseAddressDong}
            onChange={(e) => setBaseAddressDong(e.target.value)}
          />
        </div>

        <div className="kv">
          <label className="kv-key">좌표</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", flex: 1 }}
              placeholder="위도"
              value={baseLat ?? ""}
              readOnly
            />
            <input
              type="text"
              style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", flex: 1 }}
              placeholder="경도"
              value={baseLng ?? ""}
              readOnly
            />
          </div>
        </div>

        <div className="kv">
          <label className="kv-key">검색 반경 (km) <span style={{ color: "#dc2626" }}>*</span></label>
          <input
            type="number"
            className="kv-val"
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            value={searchRadiusKm}
            onChange={(e) => setSearchRadiusKm(e.target.value)}
            placeholder="예) 10"
            min="1"
            max="100"
          />
        </div>
      </div>
      {!addressValid && roadAddress && (
        <div className="notice" style={{ marginBottom: 16, color: "#dc2626" }}>
          주소 선택 후 위/경도가 자동 입력되어야 합니다.
        </div>
      )}

      <h3 className="card-title" style={{ marginTop: 24 }}>직종 및 기술</h3>
      <div className="detail-grid" style={{ marginBottom: 16 }}>
        <div className="kv">
          <label className="kv-key">주 직종 <span style={{ color: "#dc2626" }}>*</span></label>
          <select
            className="kv-val"
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            value={mainCategory}
            onChange={(e) => setMainCategory(e.target.value as CategorySlug)}
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="kv">
          <label className="kv-key">세부 스킬 (쉼표로 구분)</label>
          <input
            type="text"
            className="kv-val"
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            value={detailedSkills}
            onChange={(e) => setDetailedSkills(e.target.value)}
            placeholder="예) 형틀, 미장, 전기배선"
          />
        </div>
      </div>

      <h3 className="card-title" style={{ marginTop: 24 }}>경력</h3>
      <div className="detail-grid" style={{ marginBottom: 16 }}>
        <div className="kv">
          <label className="kv-key">총 경력 (년)</label>
          <input
            type="number"
            className="kv-val"
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            value={totalExperienceYears}
            onChange={(e) => setTotalExperienceYears(e.target.value)}
            placeholder="예) 5"
            min="0"
            step="0.5"
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          최근 작업 이력 (최대 3건)
        </h4>
        {recentWorkHistory.map((history, idx) => (
          <div
            key={idx}
            style={{
              display: "grid",
              gap: 8,
              marginBottom: 12,
              padding: 12,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              backgroundColor: "#f9fafb",
            }}
          >
            <input
              type="text"
              style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", width: "100%", backgroundColor: "#fff" }}
              placeholder="기간 (예: 2024.01 - 2024.06)"
              value={history.period}
              onChange={(e) =>
                updateWorkHistory(idx, "period", e.target.value)
              }
            />
            <input
              type="text"
              style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", width: "100%", backgroundColor: "#fff" }}
              placeholder="현장명"
              value={history.site_name}
              onChange={(e) =>
                updateWorkHistory(idx, "site_name", e.target.value)
              }
            />
            <input
              type="text"
              style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", width: "100%", backgroundColor: "#fff" }}
              placeholder="업체명"
              value={history.company_name}
              onChange={(e) =>
                updateWorkHistory(idx, "company_name", e.target.value)
              }
            />
            <input
              type="text"
              style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", width: "100%", backgroundColor: "#fff" }}
              placeholder="역할"
              value={history.role}
              onChange={(e) =>
                updateWorkHistory(idx, "role", e.target.value)
              }
            />
            <input
              type="text"
              style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", width: "100%", backgroundColor: "#fff" }}
              placeholder="주요 작업"
              value={history.main_tasks}
              onChange={(e) =>
                updateWorkHistory(idx, "main_tasks", e.target.value)
              }
            />
          </div>
        ))}
      </div>

      <h3 className="card-title" style={{ marginTop: 24 }}>희망 임금</h3>
      <div className="detail-grid" style={{ marginBottom: 16 }}>
        <div className="kv">
          <label className="kv-key">임금 형태</label>
          <select
            className="kv-val"
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            value={desiredWageType}
            onChange={(e) => setDesiredWageType(e.target.value as WageType)}
          >
            <option value="day">일급</option>
            <option value="hour">시급</option>
          </select>
        </div>

        <div className="kv">
          <label className="kv-key">희망 금액</label>
          <input
            type="number"
            className="kv-val"
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            value={desiredWageAmount}
            onChange={(e) => setDesiredWageAmount(e.target.value)}
            placeholder={
              desiredWageType === "hour" ? "예) 15000" : "예) 180000"
            }
            min="0"
          />
        </div>
      </div>

      <h3 className="card-title" style={{ marginTop: 24 }}>근무 가능 일정</h3>
      <div className="detail-grid" style={{ marginBottom: 16 }}>
        <div className="kv">
          <label className="kv-key">가능 시작일</label>
          <div>
            <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={availableNow}
                onChange={(e) => {
                  setAvailableNow(e.target.checked);
                  if (e.target.checked) setAvailableStartDate("");
                }}
              />
              <span>즉시 가능</span>
            </label>
            {!availableNow && (
              <input
                type="date"
                style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
                value={availableStartDate}
                onChange={(e) => setAvailableStartDate(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="kv">
          <label className="kv-key">가능 시간대</label>
          <div>
            <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <input
                type="checkbox"
                checked={availableShift.day}
                onChange={(e) =>
                  setAvailableShift({ ...availableShift, day: e.target.checked })
                }
              />
              <span>주간</span>
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={availableShift.night}
                onChange={(e) =>
                  setAvailableShift({
                    ...availableShift,
                    night: e.target.checked,
                  })
                }
              />
              <span>야간</span>
            </label>
          </div>
        </div>
      </div>

      <h3 className="card-title" style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #e5e7eb" }}>
        선택 사항 (권장)
      </h3>
      <div className="detail-grid" style={{ marginBottom: 16 }}>
        <div className="kv">
          <label className="kv-key">프로필 사진 URL</label>
          <input
            type="text"
            className="kv-val"
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            value={profilePhoto}
            onChange={(e) => setProfilePhoto(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="kv">
          <label className="kv-key">보유 장비/면허</label>
          <input
            type="text"
            className="kv-val"
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            value={ownedEquipment}
            onChange={(e) => setOwnedEquipment(e.target.value)}
            placeholder="예) 안전모, 안전화, 1종 운전면허 (쉼표로 구분)"
          />
        </div>

        <div className="kv">
          <label className="kv-key">자격증/교육</label>
          <input
            type="text"
            className="kv-val"
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            value={licenses}
            onChange={(e) => setLicenses(e.target.value)}
            placeholder="예) 안전교육 수료, 전기기능사 (쉼표로 구분)"
          />
        </div>

        <div className="kv">
          <label className="kv-key">한 줄 소개</label>
          <input
            type="text"
            className="kv-val"
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
            placeholder="예) 꼼꼼하고 성실한 작업자입니다"
            maxLength={100}
          />
        </div>
      </div>

      <h3 className="card-title" style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #e5e7eb" }}>
        알림 설정
      </h3>

      <label
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <input
          type="checkbox"
          checked={notificationEnabled}
          onChange={(e) => setNotificationEnabled(e.target.checked)}
        />
        <span>새 공고 알림 받기</span>
      </label>

      {notificationEnabled && (
        <div style={{ marginBottom: 16 }}>
          <div className="detail-grid" style={{ marginBottom: 16 }}>
            <div className="kv">
              <label className="kv-key">알림 반경 (km)</label>
              <input
                type="number"
                className="kv-val"
                style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
                value={notificationRadiusKm}
                onChange={(e) => setNotificationRadiusKm(e.target.value)}
                placeholder="예) 10"
                min="1"
                max="100"
              />
            </div>

            <div className="kv">
              <label className="kv-key">최소 임금 (일급 기준)</label>
              <input
                type="number"
                className="kv-val"
                style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
                value={notificationWageMin}
                onChange={(e) => setNotificationWageMin(e.target.value)}
                placeholder="예) 150000"
                min="0"
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              시작일 필터
            </h4>
            <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={notificationStartDateFilters.today}
                onChange={(e) =>
                  setNotificationStartDateFilters({
                    ...notificationStartDateFilters,
                    today: e.target.checked,
                  })
                }
              />
              <span>오늘 시작</span>
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={notificationStartDateFilters.tomorrow}
                onChange={(e) =>
                  setNotificationStartDateFilters({
                    ...notificationStartDateFilters,
                    tomorrow: e.target.checked,
                  })
                }
              />
              <span>내일 시작</span>
            </label>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              카테고리 필터
            </h4>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <label
                key={key}
                style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}
              >
                <input
                  type="checkbox"
                  checked={
                    notificationCategoryFilters[key as CategorySlug] || false
                  }
                  onChange={(e) =>
                    setNotificationCategoryFilters({
                      ...notificationCategoryFilters,
                      [key]: e.target.checked,
                    })
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {msg && (
        <div
          className="notice"
          style={{
            marginTop: 16,
            marginBottom: 16,
            color: msg.includes("등록") ? "#16a34a" : "#dc2626"
          }}
        >
          {msg}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 24, paddingTop: 24, borderTop: "1px solid #e5e7eb" }}>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "등록 중…" : "프로필 등록"}
        </button>
        <a href="/mypage" className="btn">
          취소
        </a>
      </div>
    </form>
  );
}
