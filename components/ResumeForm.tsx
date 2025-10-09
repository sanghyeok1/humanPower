"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CategorySlug, CATEGORY_LABELS, WageType } from "@/types";

type Props = {
  userName: string;
  userPhone: string;
  resumeData?: any;
};

export default function ResumeForm({ userName, userPhone, resumeData }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(resumeData?.title || "");
  const [name, setName] = useState(resumeData?.name || userName);
  const [phone, setPhone] = useState(resumeData?.phone || userPhone);
  const [mainCategory, setMainCategory] = useState<CategorySlug>(
    resumeData?.main_category || "rebar_form_concrete"
  );
  const [skills, setSkills] = useState(resumeData?.skills?.join(", ") || "");
  const [experienceYears, setExperienceYears] = useState(
    resumeData?.experience_years?.toString() || ""
  );
  const [recentWorkHistory, setRecentWorkHistory] = useState(
    resumeData?.recent_work_history || [
      { period: "", site_name: "", company_name: "", role: "", main_tasks: "" },
    ]
  );
  const [equipment, setEquipment] = useState(
    resumeData?.equipment?.join(", ") || ""
  );
  const [licenses, setLicenses] = useState(
    resumeData?.licenses?.join(", ") || ""
  );
  const [introduction, setIntroduction] = useState(
    resumeData?.introduction || ""
  );
  const [desiredWageType, setDesiredWageType] = useState<WageType>(
    resumeData?.desired_wage_type || "day"
  );
  const [desiredWageAmount, setDesiredWageAmount] = useState(
    resumeData?.desired_wage_amount?.toString() || ""
  );
  const [availableShift, setAvailableShift] = useState({
    day: resumeData?.available_shift?.includes("day") ?? true,
    night: resumeData?.available_shift?.includes("night") ?? false,
  });
  const [availableStartDate, setAvailableStartDate] = useState(
    resumeData?.available_start_date || ""
  );
  const [availableNow, setAvailableNow] = useState(
    resumeData?.available_start_date === "즉시" || false
  );

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const updateWorkHistory = (index: number, field: string, value: string) => {
    const updated = [...recentWorkHistory];
    updated[index] = { ...updated[index], [field]: value };
    setRecentWorkHistory(updated);
  };

  const addWorkHistory = () => {
    setRecentWorkHistory([
      ...recentWorkHistory,
      { period: "", site_name: "", company_name: "", role: "", main_tasks: "" },
    ]);
  };

  const removeWorkHistory = (index: number) => {
    setRecentWorkHistory(recentWorkHistory.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!title.trim()) {
      setMsg("이력서 제목을 입력해주세요.");
      return;
    }

    if (!name.trim()) {
      setMsg("이름을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const url = resumeData
        ? `/api/resumes/${resumeData.id}`
        : "/api/resumes";
      const method = resumeData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          name: name.trim(),
          phone,
          main_category: mainCategory,
          skills: skills ? skills.split(",").map((s) => s.trim()) : [],
          experience_years: experienceYears
            ? parseFloat(experienceYears)
            : undefined,
          recent_work_history: recentWorkHistory.filter((h) => h.period),
          equipment: equipment
            ? equipment.split(",").map((s) => s.trim())
            : undefined,
          licenses: licenses
            ? licenses.split(",").map((s) => s.trim())
            : undefined,
          introduction,
          desired_wage_type: desiredWageType,
          desired_wage_amount: desiredWageAmount
            ? parseFloat(desiredWageAmount)
            : undefined,
          available_shift: Object.entries(availableShift)
            .filter(([_, v]) => v)
            .map(([k]) => k),
          available_start_date: availableNow ? "즉시" : availableStartDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data?.error || "저장에 실패했습니다.");
        return;
      }

      setMsg("이력서가 저장되었습니다!");
      setTimeout(() => {
        router.push("/mypage?tab=resumes");
      }, 800);
    } catch (error) {
      setMsg("네트워크 오류로 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="card-title">기본 정보</h3>
      <div className="detail-grid" style={{ marginBottom: 16 }}>
        <div className="kv">
          <label className="kv-key">
            이력서 제목 <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="text"
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
            }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예) 철근 경력 5년 이력서"
            required
          />
        </div>

        <div className="kv">
          <label className="kv-key">
            이름 <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="text"
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
            }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="kv">
          <label className="kv-key">전화번호</label>
          <input
            type="tel"
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
            }}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
          />
        </div>
      </div>

      <h3 className="card-title" style={{ marginTop: 24 }}>
        직종 및 기술
      </h3>
      <div className="detail-grid" style={{ marginBottom: 16 }}>
        <div className="kv">
          <label className="kv-key">
            주 직종 <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <select
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
            }}
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
          <label className="kv-key">보유 기술 (쉼표로 구분)</label>
          <input
            type="text"
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
            }}
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="예) 철근 배근, 형틀 조립, 콘크리트 타설"
          />
        </div>

        <div className="kv">
          <label className="kv-key">경력 (년)</label>
          <input
            type="number"
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
            }}
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            placeholder="예) 5"
            min="0"
            step="0.5"
          />
        </div>
      </div>

      <h3 className="card-title" style={{ marginTop: 24 }}>
        작업 이력
      </h3>
      <div style={{ marginBottom: 16 }}>
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
              position: "relative",
            }}
          >
            {recentWorkHistory.length > 1 && (
              <button
                type="button"
                onClick={() => removeWorkHistory(idx)}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "4px 8px",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                삭제
              </button>
            )}
            <input
              type="text"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "8px 10px",
                width: "100%",
                backgroundColor: "#fff",
              }}
              placeholder="기간 (예: 2024.01 - 2024.06)"
              value={history.period}
              onChange={(e) => updateWorkHistory(idx, "period", e.target.value)}
            />
            <input
              type="text"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "8px 10px",
                width: "100%",
                backgroundColor: "#fff",
              }}
              placeholder="현장명"
              value={history.site_name}
              onChange={(e) =>
                updateWorkHistory(idx, "site_name", e.target.value)
              }
            />
            <input
              type="text"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "8px 10px",
                width: "100%",
                backgroundColor: "#fff",
              }}
              placeholder="업체명"
              value={history.company_name}
              onChange={(e) =>
                updateWorkHistory(idx, "company_name", e.target.value)
              }
            />
            <input
              type="text"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "8px 10px",
                width: "100%",
                backgroundColor: "#fff",
              }}
              placeholder="역할"
              value={history.role}
              onChange={(e) => updateWorkHistory(idx, "role", e.target.value)}
            />
            <input
              type="text"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "8px 10px",
                width: "100%",
                backgroundColor: "#fff",
              }}
              placeholder="주요 작업"
              value={history.main_tasks}
              onChange={(e) =>
                updateWorkHistory(idx, "main_tasks", e.target.value)
              }
            />
          </div>
        ))}
        <button
          type="button"
          className="btn"
          onClick={addWorkHistory}
          style={{ width: "100%" }}
        >
          + 작업 이력 추가
        </button>
      </div>

      <h3 className="card-title" style={{ marginTop: 24 }}>
        추가 정보
      </h3>
      <div className="detail-grid" style={{ marginBottom: 16 }}>
        <div className="kv">
          <label className="kv-key">보유 장비 (쉼표로 구분)</label>
          <input
            type="text"
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
            }}
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            placeholder="예) 안전모, 안전화, 용접기"
          />
        </div>

        <div className="kv">
          <label className="kv-key">자격증/면허 (쉼표로 구분)</label>
          <input
            type="text"
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
            }}
            value={licenses}
            onChange={(e) => setLicenses(e.target.value)}
            placeholder="예) 안전교육 수료, 용접기능사"
          />
        </div>

        <div className="kv">
          <label className="kv-key">자기소개</label>
          <textarea
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
              minHeight: 80,
            }}
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
            placeholder="간단한 자기소개를 입력해주세요"
            maxLength={200}
          />
        </div>
      </div>

      <h3 className="card-title" style={{ marginTop: 24 }}>
        희망 조건
      </h3>
      <div className="detail-grid" style={{ marginBottom: 16 }}>
        <div className="kv">
          <label className="kv-key">희망 임금 형태</label>
          <select
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
            }}
            value={desiredWageType}
            onChange={(e) => setDesiredWageType(e.target.value as WageType)}
          >
            <option value="day">일급</option>
            <option value="hour">시급</option>
          </select>
        </div>

        <div className="kv">
          <label className="kv-key">희망 임금 금액</label>
          <input
            type="number"
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
            }}
            value={desiredWageAmount}
            onChange={(e) => setDesiredWageAmount(e.target.value)}
            placeholder={
              desiredWageType === "hour" ? "예) 15000" : "예) 180000"
            }
            min="0"
          />
        </div>

        <div className="kv">
          <label className="kv-key">가능 시작일</label>
          <div>
            <label
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
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
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "8px 10px",
                  width: "100%",
                }}
                value={availableStartDate}
                onChange={(e) => setAvailableStartDate(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="kv">
          <label className="kv-key">가능 시간대</label>
          <div>
            <label
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <input
                type="checkbox"
                checked={availableShift.day}
                onChange={(e) =>
                  setAvailableShift({ ...availableShift, day: e.target.checked })
                }
              />
              <span>주간</span>
            </label>
            <label
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
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

      {msg && (
        <div
          className="notice"
          style={{
            marginTop: 16,
            marginBottom: 16,
            color: msg.includes("저장") ? "#16a34a" : "#dc2626",
          }}
        >
          {msg}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 24,
          paddingTop: 24,
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "저장 중…" : resumeData ? "수정 완료" : "이력서 등록"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => router.push("/mypage?tab=resumes")}
        >
          취소
        </button>
      </div>
    </form>
  );
}
