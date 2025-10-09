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
  created_at: string;
  updated_at: string;
};

export default function ResumeManager() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function handleDelete(id: string) {
    if (!confirm("이력서를 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("이력서가 삭제되었습니다.");
        fetchResumes();
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (error) {
      alert("오류가 발생했습니다.");
    }
  }

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 className="card-title">내 이력서</h3>
        <Link href="/resumes/new" className="btn btn-primary">
          새 이력서 작성
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="notice">
          <p>등록된 이력서가 없습니다.</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            이력서를 등록하면 공고에 빠르게 지원할 수 있습니다.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {resumes.map((resume) => (
            <div
              key={resume.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                  {resume.title}
                </h4>
                <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>
                  {resume.name} · {resume.phone}
                </div>
                <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
                  {CATEGORY_LABELS[resume.main_category]}
                  {resume.experience_years && ` · 경력 ${resume.experience_years}년`}
                </div>
                {resume.skills && resume.skills.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {resume.skills.map((skill, idx) => (
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
                  </div>
                )}
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
                  등록일: {new Date(resume.created_at).toLocaleDateString("ko-KR")}
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, marginLeft: 12 }}>
                <Link href={`/resumes/${resume.id}/edit`} className="btn">
                  수정
                </Link>
                <button
                  className="btn"
                  onClick={() => handleDelete(resume.id)}
                  style={{ color: "#ef4444" }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
