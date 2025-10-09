"use client";

import { useState, useEffect } from "react";

type SavedPosting = {
  id: number;
  posting_id: number;
  posting_title: string;
  posting_category: string;
  posting_pay: string;
  posting_start_date: string;
  saved_at: string;
};

type ViewHistory = {
  id: number;
  posting_id: number;
  posting_title: string;
  posting_category: string;
  posting_pay: string;
  viewed_at: string;
};

export default function SavedPostingsManager() {
  const [savedPostings, setSavedPostings] = useState<SavedPosting[]>([]);
  const [viewHistory, setViewHistory] = useState<ViewHistory[]>([]);
  const [tab, setTab] = useState<"saved" | "history">("saved");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [savedRes, historyRes] = await Promise.all([
        fetch("/api/saved-postings"),
        fetch("/api/view-history"),
      ]);

      if (savedRes.ok) {
        const data = await savedRes.json();
        setSavedPostings(data.saved || []);
      }

      if (historyRes.ok) {
        const data = await historyRes.json();
        setViewHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeSaved = async (id: number) => {
    try {
      const res = await fetch(`/api/saved-postings/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSavedPostings((prev) => prev.filter((s) => s.id !== id));
        alert("찜 목록에서 제거되었습니다.");
      } else {
        alert("삭제 실패");
      }
    } catch (err) {
      alert("오류가 발생했습니다");
    }
  };

  const clearHistory = async () => {
    if (!confirm("최근 본 공고 기록을 모두 삭제하시겠습니까?")) return;

    try {
      const res = await fetch("/api/view-history", {
        method: "DELETE",
      });

      if (res.ok) {
        setViewHistory([]);
        alert("기록이 삭제되었습니다.");
      } else {
        alert("삭제 실패");
      }
    } catch (err) {
      alert("오류가 발생했습니다");
    }
  };

  return (
    <div>
      <h3 className="card-title">저장/추천</h3>
      <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
        찜한 공고와 최근 본 공고를 확인하세요.
      </p>

      <div className="chips" style={{ marginBottom: 16 }}>
        <button
          className={`chip ${tab === "saved" ? "active" : ""}`}
          onClick={() => setTab("saved")}
        >
          찜한 공고 ({savedPostings.length})
        </button>
        <button
          className={`chip ${tab === "history" ? "active" : ""}`}
          onClick={() => setTab("history")}
        >
          최근 본 공고 ({viewHistory.length})
        </button>
      </div>

      {loading ? (
        <div className="notice">로딩 중...</div>
      ) : tab === "saved" ? (
        <div>
          {savedPostings.length === 0 ? (
            <div className="notice">찜한 공고가 없습니다.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {savedPostings.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  style={{ padding: 16, border: "1px solid #e5e7eb" }}
                >
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                    {item.posting_category} · 시작일 {item.posting_start_date}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                    {item.posting_title}
                  </div>
                  <div style={{ fontSize: 14, color: "#374151", marginBottom: 8 }}>
                    {item.posting_pay}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
                    찜한 날짜: {item.saved_at}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <a href={`/post/${item.posting_id}`} className="btn btn-primary">
                      공고 보기
                    </a>
                    <button className="btn" onClick={() => removeSaved(item.id)}>
                      찜 해제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {viewHistory.length === 0 ? (
            <div className="notice">최근 본 공고가 없습니다.</div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <button className="btn" onClick={clearHistory}>
                  기록 전체 삭제
                </button>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {viewHistory.map((item) => (
                  <div
                    key={item.id}
                    className="card"
                    style={{ padding: 16, border: "1px solid #e5e7eb" }}
                  >
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                      {item.posting_category}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                      {item.posting_title}
                    </div>
                    <div style={{ fontSize: 14, color: "#374151", marginBottom: 8 }}>
                      {item.posting_pay}
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
                      조회일: {item.viewed_at}
                    </div>
                    <a href={`/post/${item.posting_id}`} className="btn btn-primary">
                      공고 보기
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
