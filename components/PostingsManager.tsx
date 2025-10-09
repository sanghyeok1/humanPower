"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS } from "@/types";

type JobPosting = {
  id: string;
  title: string;
  category: string;
  start_date: string;
  wage_type: string;
  wage_amount: number;
  address_dong: string;
  created_at: string;
};

export default function PostingsManager() {
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPostings();
  }, []);

  async function fetchPostings() {
    try {
      const res = await fetch("/api/my-postings");
      const data = await res.json();
      if (data.ok) {
        setPostings(data.postings || []);
      }
    } catch (error) {
      console.error("Failed to fetch postings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 이 공고를 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/my-postings/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        alert("공고가 삭제되었습니다.");
        fetchPostings(); // 목록 새로고침
      } else {
        alert("삭제 실패: " + (data.error || "알 수 없는 오류"));
      }
    } catch (error) {
      console.error("Failed to delete posting:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  function handleEdit(id: string) {
    router.push(`/post/edit/${id}`);
  }

  if (loading) {
    return <div className="notice">로딩 중...</div>;
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 className="card-title">공고 관리</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <Link href="/post/new" className="btn btn-primary">
            새 공고 작성
          </Link>
          <Link href="/mypage?tab=templates" className="btn">
            템플릿 관리
          </Link>
        </div>
      </div>

      {postings.length === 0 ? (
        <div className="notice">
          <p>등록된 공고가 없습니다.</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            새 공고를 작성하여 구직자를 모집하세요.
          </p>
        </div>
      ) : (
        <div className="post-list">
          {postings.map((posting) => (
            <div key={posting.id} className="post-item">
              <div style={{ padding: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div className="post-title">{posting.title}</div>
                    <div className="post-meta">
                      {CATEGORY_LABELS[posting.category as keyof typeof CATEGORY_LABELS] || posting.category} · {posting.address_dong}
                    </div>
                    <div className="post-meta">
                      {posting.wage_type === "day" ? "일급" : "시급"} {posting.wage_amount.toLocaleString()}원 · 시작일: {posting.start_date}
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                      등록일: {new Date(posting.created_at).toLocaleDateString("ko-KR")}
                    </div>
                  </div>
                  <span className="badge">게시 중</span>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <Link href={`/post/${posting.id}`} className="btn">
                    상세보기
                  </Link>
                  <button
                    className="btn"
                    onClick={() => handleEdit(posting.id)}
                  >
                    수정
                  </button>
                  <button
                    className="btn"
                    onClick={() => handleDelete(posting.id)}
                    style={{ backgroundColor: "#ef4444", color: "#fff" }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
