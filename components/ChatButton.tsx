"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChatButton({
  postingId,
  employerId,
}: {
  postingId: string;
  employerId: number;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStartChat = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posting_id: postingId, employer_id: employerId }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/chat/${data.room.id}`);
      } else {
        alert("채팅 시작 실패");
      }
    } catch (err) {
      alert("오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="btn" onClick={handleStartChat} disabled={loading}>
      💬 채팅 문의
    </button>
  );
}
