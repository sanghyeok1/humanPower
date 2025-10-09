"use client";

import { useRouter } from "next/navigation";

type PostingActionsProps = {
  postingId: string;
};

export default function PostingActions({ postingId }: PostingActionsProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("정말 이 공고를 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/my-postings/${postingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        alert("공고가 삭제되었습니다.");
        router.refresh(); // 페이지 새로고침
      } else {
        alert("삭제 실패: " + (data.error || "알 수 없는 오류"));
      }
    } catch (error) {
      console.error("Failed to delete posting:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  function handleEdit() {
    router.push(`/post/edit/${postingId}`);
  }

  return (
    <div style={{ display: "flex", gap: 6, marginTop: 8, padding: "0 12px 12px" }}>
      <button
        className="btn"
        onClick={handleEdit}
        style={{ fontSize: 12, padding: "4px 12px" }}
      >
        수정
      </button>
      <button
        className="btn"
        onClick={handleDelete}
        style={{
          fontSize: 12,
          padding: "4px 12px",
          backgroundColor: "#ef4444",
          color: "#fff",
        }}
      >
        삭제
      </button>
    </div>
  );
}
