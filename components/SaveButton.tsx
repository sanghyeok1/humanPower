"use client";

import { useState, useEffect } from "react";

export default function SaveButton({ postingId }: { postingId: string }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [postingId]);

  const checkIfSaved = async () => {
    try {
      const res = await fetch("/api/saved-postings");
      if (res.ok) {
        const data = await res.json();
        const isSaved = data.saved.some(
          (s: any) => s.posting_id === postingId
        );
        setSaved(isSaved);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSave = async () => {
    setLoading(true);
    try {
      const action = saved ? "unsave" : "save";
      const res = await fetch("/api/saved-postings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posting_id: postingId, action }),
      });

      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
      } else {
        alert("저장 실패");
      }
    } catch (err) {
      alert("오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn"
      onClick={handleToggleSave}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: saved ? "#f59e0b" : undefined,
      }}
    >
      {saved ? "★" : "☆"} {saved ? "찜 해제" : "찜하기"}
    </button>
  );
}
