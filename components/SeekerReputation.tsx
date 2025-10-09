"use client";

import { useState, useEffect } from "react";

type ReceivedRating = {
  id: number;
  employer_name: string;
  stars: number;
  comment: string;
  work_date: string;
  created_at: string;
};

type CompletionRecord = {
  id: number;
  posting_title: string;
  posting_category: string;
  work_date: string;
  pay: string;
  status: "completed" | "cancelled";
};

export default function SeekerReputation() {
  const [ratings, setRatings] = useState<ReceivedRating[]>([]);
  const [completions, setCompletions] = useState<CompletionRecord[]>([]);
  const [tab, setTab] = useState<"ratings" | "completions">("ratings");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ratingsRes, completionsRes] = await Promise.all([
        fetch("/api/me/received-ratings"),
        fetch("/api/me/completions"),
      ]);

      if (ratingsRes.ok) {
        const data = await ratingsRes.json();
        setRatings(data.ratings || []);
      }

      if (completionsRes.ok) {
        const data = await completionsRes.json();
        setCompletions(data.completions || []);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const avgStars =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length).toFixed(1)
      : "0.0";

  const completedCount = completions.filter((c) => c.status === "completed").length;

  const renderStars = (stars: number) => {
    return "★".repeat(stars) + "☆".repeat(5 - stars);
  };

  return (
    <div>
      <h3 className="card-title">평판</h3>
      <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
        받은 별점과 완료한 작업 이력을 확인하세요.
      </p>

      {/* 요약 통계 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          marginBottom: 20,
          padding: 16,
          background: "#f9fafb",
          borderRadius: 12,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b" }}>
            {avgStars}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            평균 별점
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#3b82f6" }}>
            {ratings.length}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            받은 평가
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981" }}>
            {completedCount}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            완료 건수
          </div>
        </div>
      </div>

      <div className="chips" style={{ marginBottom: 16 }}>
        <button
          className={`chip ${tab === "ratings" ? "active" : ""}`}
          onClick={() => setTab("ratings")}
        >
          받은 평가 ({ratings.length})
        </button>
        <button
          className={`chip ${tab === "completions" ? "active" : ""}`}
          onClick={() => setTab("completions")}
        >
          완료 이력 ({completions.length})
        </button>
      </div>

      {loading ? (
        <div className="notice">로딩 중...</div>
      ) : tab === "ratings" ? (
        <div>
          {ratings.length === 0 ? (
            <div className="notice">아직 받은 평가가 없습니다.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="card"
                  style={{ padding: 16, border: "1px solid #e5e7eb" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{rating.employer_name}</div>
                    <div style={{ fontSize: 18, color: "#f59e0b" }}>
                      {renderStars(rating.stars)}
                    </div>
                  </div>
                  {rating.comment && (
                    <div
                      style={{
                        fontSize: 14,
                        color: "#374151",
                        marginBottom: 8,
                        padding: 12,
                        background: "#f9fafb",
                        borderRadius: 8,
                      }}
                    >
                      {rating.comment}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    작업일: {rating.work_date} · 평가일: {rating.created_at}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {completions.length === 0 ? (
            <div className="notice">완료 이력이 없습니다.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {completions.map((record) => (
                <div
                  key={record.id}
                  className="card"
                  style={{ padding: 16, border: "1px solid #e5e7eb" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                        {record.posting_category}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                        {record.posting_title}
                      </div>
                      <div style={{ fontSize: 14, color: "#374151" }}>
                        {record.pay}
                      </div>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background:
                          record.status === "completed" ? "#10b981" : "#6b7280",
                        color: "#fff",
                      }}
                    >
                      {record.status === "completed" ? "완료" : "취소"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    작업일: {record.work_date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
