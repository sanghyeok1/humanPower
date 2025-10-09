"use client";

import { useState, useEffect } from "react";

type Applicant = {
  id: string;
  posting_id: string;
  posting_title: string;
  applicant_name: string;
  applicant_phone: string;
  status: "applied" | "invited" | "accepted" | "pending" | "rejected" | "noshow" | "completed";
  applied_at: string;
  notes?: string;
  call_logs?: { timestamp: string; note: string }[];
  is_favorite?: boolean;
  is_blacklist?: boolean;
};

export default function ApplicantManager() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [callLogText, setCallLogText] = useState("");
  const [showCallLogForm, setShowCallLogForm] = useState<string | null>(null);

  useEffect(() => {
    loadApplicants();
  }, [statusFilter]);

  const loadApplicants = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      const res = await fetch(`/api/applicants?${params}`);
      const data = await res.json();
      setApplicants(data.applicants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/applicants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", status }),
      });
      loadApplicants();
    } catch (err) {
      alert("상태 변경 실패");
    }
  };

  const handleUpdateNotes = async (id: string) => {
    try {
      await fetch(`/api/applicants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_notes", notes: noteText }),
      });
      alert("메모가 저장되었습니다");
      setEditingId(null);
      setNoteText("");
      loadApplicants();
    } catch (err) {
      alert("메모 저장 실패");
    }
  };

  const handleAddCallLog = async (id: string) => {
    if (!callLogText.trim()) {
      alert("통화 내용을 입력하세요");
      return;
    }

    try {
      await fetch(`/api/applicants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_call_log",
          call_log: {
            timestamp: new Date().toISOString(),
            note: callLogText,
          },
        }),
      });
      alert("통화 로그가 저장되었습니다");
      setShowCallLogForm(null);
      setCallLogText("");
      loadApplicants();
    } catch (err) {
      alert("통화 로그 저장 실패");
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await fetch(`/api/applicants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_favorite" }),
      });
      loadApplicants();
    } catch (err) {
      alert("즐겨찾기 변경 실패");
    }
  };

  const handleToggleBlacklist = async (id: string) => {
    if (!confirm("블랙리스트에 추가/제거하시겠습니까?")) return;

    try {
      await fetch(`/api/applicants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_blacklist" }),
      });
      loadApplicants();
    } catch (err) {
      alert("블랙리스트 변경 실패");
    }
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      applied: "지원",
      invited: "초대",
      accepted: "수락",
      pending: "보류",
      rejected: "거절",
      noshow: "노쇼",
      completed: "완료",
    };
    return labels[status] || status;
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 className="card-title">지원자 관리</h3>
        <p className="muted" style={{ fontSize: 14, marginBottom: 12 }}>
          지원자 상태를 관리하고 통화 로그를 기록하세요.
        </p>
        <div className="chips">
          {[
            { key: "all", label: "전체" },
            { key: "applied", label: "지원" },
            { key: "accepted", label: "수락" },
            { key: "pending", label: "보류" },
            { key: "rejected", label: "거절" },
            { key: "noshow", label: "노쇼" },
            { key: "completed", label: "완료" },
          ].map((f) => (
            <button
              key={f.key}
              className={`chip ${statusFilter === f.key ? "active" : ""}`}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 지원자 목록 */}
      <div className="post-list">
        {applicants.length === 0 ? (
          <div className="post-empty">조건에 맞는 지원자가 없습니다.</div>
        ) : (
          applicants.map((app) => (
            <div key={app.id} className="post-item">
              <div style={{ padding: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="post-title">{app.applicant_name}</div>
                      {app.is_favorite && (
                        <span style={{ color: "#f59e0b" }}>★</span>
                      )}
                      {app.is_blacklist && (
                        <span
                          className="tag"
                          style={{ background: "#fee", borderColor: "#fcc" }}
                        >
                          블랙리스트
                        </span>
                      )}
                    </div>
                    <div className="post-meta">
                      {app.applicant_phone} · {app.posting_title}
                    </div>
                    <div className="post-meta">
                      지원: {formatDateTime(app.applied_at)}
                    </div>
                  </div>
                  <span className="badge">{statusLabel(app.status)}</span>
                </div>

                {/* 메모 */}
                {app.notes && editingId !== app.id && (
                  <div className="notice" style={{ marginTop: 8, fontSize: 12 }}>
                    <strong>메모:</strong> {app.notes}
                  </div>
                )}

                {/* 메모 수정 폼 */}
                {editingId === app.id && (
                  <div style={{ marginTop: 8 }}>
                    <textarea
                      className="kv-val"
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: "8px 10px",
                        width: "100%",
                        minHeight: 60,
                      }}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="메모 입력..."
                    />
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleUpdateNotes(app.id)}
                      >
                        저장
                      </button>
                      <button
                        className="btn"
                        onClick={() => {
                          setEditingId(null);
                          setNoteText("");
                        }}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}

                {/* 통화 로그 */}
                {app.call_logs && app.call_logs.length > 0 && (
                  <div
                    className="notice"
                    style={{ marginTop: 8, fontSize: 12 }}
                  >
                    <strong>통화 로그:</strong>
                    {app.call_logs.map((log, idx) => (
                      <div key={idx} style={{ marginTop: 4 }}>
                        [{formatDateTime(log.timestamp)}] {log.note}
                      </div>
                    ))}
                  </div>
                )}

                {/* 통화 로그 추가 폼 */}
                {showCallLogForm === app.id && (
                  <div style={{ marginTop: 8 }}>
                    <textarea
                      className="kv-val"
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: "8px 10px",
                        width: "100%",
                        minHeight: 60,
                      }}
                      value={callLogText}
                      onChange={(e) => setCallLogText(e.target.value)}
                      placeholder="통화 내용 입력..."
                    />
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleAddCallLog(app.id)}
                      >
                        저장
                      </button>
                      <button
                        className="btn"
                        onClick={() => {
                          setShowCallLogForm(null);
                          setCallLogText("");
                        }}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <button
                    className="btn"
                    onClick={() => {
                      setShowCallLogForm(app.id);
                      setCallLogText("");
                    }}
                  >
                    전화 로그
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setEditingId(app.id);
                      setNoteText(app.notes || "");
                    }}
                  >
                    메모 {app.notes ? "수정" : "추가"}
                  </button>
                  <button
                    className="btn"
                    onClick={() => handleToggleFavorite(app.id)}
                  >
                    {app.is_favorite ? "★ 즐겨찾기 해제" : "☆ 즐겨찾기"}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleStatusChange(app.id, "accepted")}
                    disabled={app.status === "accepted"}
                  >
                    수락
                  </button>
                  <button
                    className="btn"
                    onClick={() => handleStatusChange(app.id, "pending")}
                    disabled={app.status === "pending"}
                  >
                    보류
                  </button>
                  <button
                    className="btn"
                    onClick={() => handleStatusChange(app.id, "rejected")}
                    disabled={app.status === "rejected"}
                  >
                    거절
                  </button>
                  <button
                    className="btn"
                    style={{
                      background: app.is_blacklist ? "#fee" : undefined,
                      borderColor: app.is_blacklist ? "#fcc" : undefined,
                    }}
                    onClick={() => handleToggleBlacklist(app.id)}
                  >
                    블랙리스트
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
