"use client";

import { useState, useEffect } from "react";

type Application = {
  id: number;
  posting_id: number;
  posting_title: string;
  posting_category: string;
  posting_pay: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  applied_at: string;
  type: "applied" | "invited";
};

export default function ApplicationsManager() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<"all" | "applied" | "invited">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: Application["status"]) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
        alert("상태가 변경되었습니다.");
      } else {
        alert("상태 변경 실패");
      }
    } catch (err) {
      alert("오류가 발생했습니다");
    }
  };

  const filteredApps = applications.filter((a) => {
    if (filter === "all") return true;
    return a.type === filter;
  });

  const statusLabel = (s: Application["status"]) => {
    if (s === "pending") return "대기 중";
    if (s === "accepted") return "수락됨";
    if (s === "rejected") return "거절됨";
    return "취소됨";
  };

  const statusColor = (s: Application["status"]) => {
    if (s === "pending") return "#f59e0b";
    if (s === "accepted") return "#10b981";
    if (s === "rejected") return "#ef4444";
    return "#6b7280";
  };

  return (
    <div>
      <h3 className="card-title">지원 현황</h3>
      <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
        내가 지원한 공고와 받은 초대를 확인하고 관리하세요.
      </p>

      <div className="chips" style={{ marginBottom: 16 }}>
        <button
          className={`chip ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          전체 ({applications.length})
        </button>
        <button
          className={`chip ${filter === "applied" ? "active" : ""}`}
          onClick={() => setFilter("applied")}
        >
          내가 지원 ({applications.filter((a) => a.type === "applied").length})
        </button>
        <button
          className={`chip ${filter === "invited" ? "active" : ""}`}
          onClick={() => setFilter("invited")}
        >
          받은 초대 ({applications.filter((a) => a.type === "invited").length})
        </button>
      </div>

      {loading ? (
        <div className="notice">로딩 중...</div>
      ) : filteredApps.length === 0 ? (
        <div className="notice">조건에 맞는 지원 내역이 없습니다.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="card"
              style={{ padding: 16, border: "1px solid #e5e7eb" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                    {app.posting_category} · {app.type === "applied" ? "내가 지원" : "초대받음"}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                    {app.posting_title}
                  </div>
                  <div style={{ fontSize: 14, color: "#374151" }}>
                    {app.posting_pay}
                  </div>
                </div>
                <span
                  className="badge"
                  style={{ background: statusColor(app.status), color: "#fff" }}
                >
                  {statusLabel(app.status)}
                </span>
              </div>

              <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
                {app.type === "applied" ? "지원일" : "초대일"}: {app.applied_at}
              </div>

              {app.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  {app.type === "invited" && (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={() => updateStatus(app.id, "accepted")}
                      >
                        수락
                      </button>
                      <button
                        className="btn"
                        onClick={() => updateStatus(app.id, "rejected")}
                      >
                        거절
                      </button>
                    </>
                  )}
                  {app.type === "applied" && (
                    <button
                      className="btn"
                      onClick={() => updateStatus(app.id, "withdrawn")}
                    >
                      지원 취소
                    </button>
                  )}
                  <a href={`/post/${app.posting_id}`} className="btn">
                    공고 보기
                  </a>
                </div>
              )}

              {app.status !== "pending" && (
                <a href={`/post/${app.posting_id}`} className="btn">
                  공고 보기
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
