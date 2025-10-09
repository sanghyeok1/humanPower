"use client";

import { useState, useEffect } from "react";

type Resume = {
  id: string;
  title: string;
  name: string;
  phone: string;
  main_category: string;
  skills: string[];
  experience_years: number;
  recent_work: string;
  equipment: string[];
  licenses: string[];
  work_hours: "day" | "night" | "both";
  desired_wage_type: "daily" | "hourly";
  desired_wage_amount: string;
  available_immediately: boolean;
  available_from: string;
  work_history: { company: string; period: string; role: string }[];
};

export default function ResumeViewModal({
  resumeId,
  applicantId,
  onClose,
  onStatusChange,
}: {
  resumeId: string;
  applicantId: string;
  onClose: () => void;
  onStatusChange: (status: "accepted" | "rejected") => void;
}) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResume();
  }, [resumeId]);

  const loadResume = async () => {
    try {
      const res = await fetch(`/api/resumes/${resumeId}`);
      if (res.ok) {
        const data = await res.json();
        setResume(data.resume);
      } else {
        alert("이력서를 불러올 수 없습니다");
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (confirm("이 지원자를 수락하시겠습니까?")) {
      onStatusChange("accepted");
    }
  };

  const handleReject = () => {
    if (confirm("이 지원자를 거절하시겠습니까?")) {
      onStatusChange("rejected");
    }
  };

  const workHoursLabel = (hours: string) => {
    const labels: Record<string, string> = {
      day: "주간",
      night: "야간",
      both: "주야간",
    };
    return labels[hours] || hours;
  };

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            maxWidth: 600,
            width: "90%",
          }}
        >
          로딩 중...
        </div>
      </div>
    );
  }

  if (!resume) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        overflow: "auto",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          maxWidth: 800,
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>{resume.title}</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        </div>

        {/* 기본 정보 */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="card-title">기본 정보</h3>
          <div className="detail-grid">
            <div className="kv">
              <span className="kv-key">이름</span>
              <span className="kv-val">{resume.name}</span>
            </div>
            <div className="kv">
              <span className="kv-key">연락처</span>
              <span className="kv-val">{resume.phone}</span>
            </div>
            <div className="kv">
              <span className="kv-key">주요 직종</span>
              <span className="kv-val">{resume.main_category}</span>
            </div>
            <div className="kv">
              <span className="kv-key">경력</span>
              <span className="kv-val">{resume.experience_years}년</span>
            </div>
          </div>
        </div>

        {/* 보유 기술 */}
        {resume.skills && resume.skills.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 className="card-title">보유 기술</h3>
            <div className="tags">
              {resume.skills.map((skill) => (
                <span key={skill} className="tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 보유 장비 */}
        {resume.equipment && resume.equipment.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 className="card-title">보유 장비</h3>
            <div className="tags">
              {resume.equipment.map((eq) => (
                <span key={eq} className="tag">
                  {eq}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 자격증 */}
        {resume.licenses && resume.licenses.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 className="card-title">자격증/면허</h3>
            <div className="tags">
              {resume.licenses.map((lic) => (
                <span key={lic} className="tag">
                  {lic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 최근 작업 */}
        {resume.recent_work && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 className="card-title">최근 작업</h3>
            <p style={{ fontSize: 14, color: "#4b5563" }}>{resume.recent_work}</p>
          </div>
        )}

        {/* 근무 조건 */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="card-title">근무 조건</h3>
          <div className="detail-grid">
            <div className="kv">
              <span className="kv-key">근무 시간대</span>
              <span className="kv-val">{workHoursLabel(resume.work_hours)}</span>
            </div>
            <div className="kv">
              <span className="kv-key">희망 임금</span>
              <span className="kv-val">
                {resume.desired_wage_type === "daily" ? "일급" : "시급"}{" "}
                {resume.desired_wage_amount}
              </span>
            </div>
            <div className="kv">
              <span className="kv-key">가능 일정</span>
              <span className="kv-val">
                {resume.available_immediately
                  ? "즉시 가능"
                  : `${resume.available_from}부터`}
              </span>
            </div>
          </div>
        </div>

        {/* 경력 사항 */}
        {resume.work_history && resume.work_history.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 className="card-title">경력 사항</h3>
            {resume.work_history.map((work, idx) => (
              <div
                key={idx}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: "#f9fafb",
                  marginBottom: 8,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {work.company}
                </div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>
                  {work.period} · {work.role}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 액션 버튼 */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={handleAccept}
            style={{ flex: 1 }}
          >
            ✓ 수락
          </button>
          <button className="btn" onClick={handleReject} style={{ flex: 1 }}>
            ✕ 거절
          </button>
          <button className="btn" onClick={onClose} style={{ minWidth: 80 }}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
