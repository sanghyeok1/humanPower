"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/types";

type Resume = {
  id: string;
  title: string;
  name: string;
  phone: string;
  main_category: "rebar_form_concrete" | "interior_finish" | "mep";
  skills: string[];
  experience_years?: number;
};

type Props = {
  postingId: string;
  onClose: () => void;
};

export default function ResumeSelectModal({ postingId, onClose }: Props) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json();
      if (data.ok) {
        setResumes(data.resumes);
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!selectedResumeId) {
      alert("이력서를 선택해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          posting_id: postingId,
          resume_id: selectedResumeId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        alert("지원이 완료되었습니다!");
        onClose();
      } else {
        alert(data.error || "지원에 실패했습니다.");
      }
    } catch (error) {
      alert("오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          maxWidth: 600,
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
          지원할 이력서 선택
        </h2>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
            로딩 중...
          </div>
        ) : resumes.length === 0 ? (
          <div>
            <div
              className="notice"
              style={{ marginBottom: 16, background: "#fef3c7" }}
            >
              <p>등록된 이력서가 없습니다.</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>
                먼저 이력서를 작성해주세요.
              </p>
            </div>
            <Link href="/resumes/new" className="btn btn-primary">
              이력서 작성하러 가기
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
              {resumes.map((resume) => (
                <label
                  key={resume.id}
                  style={{
                    border:
                      selectedResumeId === resume.id
                        ? "2px solid #3b82f6"
                        : "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 16,
                    cursor: "pointer",
                    display: "block",
                    transition: "all 0.2s",
                    background:
                      selectedResumeId === resume.id ? "#eff6ff" : "#fff",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <input
                      type="radio"
                      name="resume"
                      value={resume.id}
                      checked={selectedResumeId === resume.id}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      style={{ marginTop: 4, marginRight: 12 }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          marginBottom: 8,
                        }}
                      >
                        {resume.title}
                      </h4>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#6b7280",
                          marginBottom: 4,
                        }}
                      >
                        {resume.name} · {resume.phone}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#6b7280",
                          marginBottom: 8,
                        }}
                      >
                        {CATEGORY_LABELS[resume.main_category]}
                        {resume.experience_years &&
                          ` · 경력 ${resume.experience_years}년`}
                      </div>
                      {resume.skills && resume.skills.length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {resume.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: 12,
                                padding: "2px 8px",
                                borderRadius: 4,
                                background: "#f3f4f6",
                                color: "#374151",
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                          {resume.skills.length > 3 && (
                            <span
                              style={{
                                fontSize: 12,
                                color: "#6b7280",
                              }}
                            >
                              +{resume.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!selectedResumeId || submitting}
                style={{ flex: 1 }}
              >
                {submitting ? "지원 중..." : "지원하기"}
              </button>
              <button
                className="btn"
                onClick={onClose}
                disabled={submitting}
                style={{ flex: 1 }}
              >
                취소
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
