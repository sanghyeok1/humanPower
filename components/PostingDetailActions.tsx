"use client";

import { useRouter } from "next/navigation";

type PostingDetailActionsProps = {
  postingId: string;
};

export default function PostingDetailActions({ postingId }: PostingDetailActionsProps) {
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
        router.push("/"); // 메인 페이지로 이동
      } else {
        alert("삭제 실패: " + (data.error || "알 수 없는 오류"));
      }
    } catch (error) {
      console.error("Failed to delete posting:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  return (
    <button
      className="btn"
      onClick={handleDelete}
      style={{ color: "#ef4444" }}
    >
      🗑️ 삭제
    </button>
  );
}
