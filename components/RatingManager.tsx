"use client";

import { useState, useEffect } from "react";

type Rating = {
  id: string;
  worker_name: string;
  posting_title: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  work_date: string;
  is_public: boolean;
  created_at: string;
};

export default function RatingManager() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    worker_name: "",
    posting_title: "",
    rating: 5 as 1 | 2 | 3 | 4 | 5,
    comment: "",
    work_date: "",
    is_public: false,
  });

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      const res = await fetch("/api/ratings");
      const data = await res.json();
      setRatings(data.ratings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.worker_name || !formData.posting_title || !formData.work_date) {
      alert("필수 항목을 입력하세요");
      return;
    }

    try {
      if (editingId) {
        // 수정
        await fetch(`/api/ratings/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // 신규
        await fetch("/api/ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      alert("평가가 저장되었습니다!");
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadRatings();
    } catch (err) {
      alert("저장 실패");
    }
  };

  const handleEdit = (rating: Rating) => {
    setFormData({
      worker_name: rating.worker_name,
      posting_title: rating.posting_title,
      rating: rating.rating,
      comment: rating.comment || "",
      work_date: rating.work_date,
      is_public: rating.is_public,
    });
    setEditingId(rating.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await fetch(`/api/ratings/${id}`, { method: "DELETE" });
      alert("삭제되었습니다");
      loadRatings();
    } catch (err) {
      alert("삭제 실패");
    }
  };

  const resetForm = () => {
    setFormData({
      worker_name: "",
      posting_title: "",
      rating: 5,
      comment: "",
      work_date: "",
      is_public: false,
    });
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 className="card-title">평가 수집 (베타)</h3>
        <p className="muted" style={{ fontSize: 14, marginBottom: 12 }}>
          작업자별 평가를 기록하여 내부 참고용으로 활용하세요. 향후 공개 리뷰
          시스템으로 전환 예정입니다.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? "닫기" : "새 평가 작성"}
        </button>
      </div>

      {/* 평가 작성/수정 폼 */}
      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="card-title">
            {editingId ? "평가 수정" : "새 평가 작성"}
          </h3>
          <form onSubmit={handleSave}>
            <div className="detail-grid" style={{ marginBottom: 12 }}>
              <div className="kv">
                <label className="kv-key">작업자 이름 *</label>
                <input
                  type="text"
                  className="kv-val"
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 10px",
                    width: "100%",
                  }}
                  value={formData.worker_name}
                  onChange={(e) =>
                    setFormData({ ...formData, worker_name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="kv">
                <label className="kv-key">공고 제목 *</label>
                <input
                  type="text"
                  className="kv-val"
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 10px",
                    width: "100%",
                  }}
                  value={formData.posting_title}
                  onChange={(e) =>
                    setFormData({ ...formData, posting_title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="kv">
                <label className="kv-key">작업일 *</label>
                <input
                  type="date"
                  className="kv-val"
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 10px",
                    width: "100%",
                  }}
                  value={formData.work_date}
                  onChange={(e) =>
                    setFormData({ ...formData, work_date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="kv">
                <label className="kv-key">별점 *</label>
                <select
                  className="kv-val"
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 10px",
                    width: "100%",
                  }}
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rating: Number(e.target.value) as 1 | 2 | 3 | 4 | 5,
                    })
                  }
                >
                  <option value={5}>★★★★★ (5점)</option>
                  <option value={4}>★★★★☆ (4점)</option>
                  <option value={3}>★★★☆☆ (3점)</option>
                  <option value={2}>★★☆☆☆ (2점)</option>
                  <option value={1}>★☆☆☆☆ (1점)</option>
                </select>
              </div>
            </div>

            {/* 코멘트 */}
            <div className="kv" style={{ marginBottom: 12 }}>
              <label className="kv-key">코멘트 (선택)</label>
              <textarea
                className="kv-val"
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "8px 10px",
                  width: "100%",
                  minHeight: 80,
                }}
                placeholder="작업자에 대한 평가를 자유롭게 입력하세요..."
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
              />
            </div>

            {/* 공개 여부 */}
            <div className="kv" style={{ marginBottom: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) =>
                    setFormData({ ...formData, is_public: e.target.checked })
                  }
                />
                <span>
                  향후 공개 리뷰로 전환 (현재는 내부용이지만 추후 공개될 수 있음)
                </span>
              </label>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn btn-primary">
                저장
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 평가 목록 */}
      <div className="post-list">
        {ratings.length === 0 ? (
          <div className="post-empty">작성된 평가가 없습니다.</div>
        ) : (
          ratings.map((r) => (
            <div key={r.id} className="post-item">
              <div style={{ padding: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div className="post-title">{r.worker_name}</div>
                    <div className="post-meta">
                      {r.posting_title} · 작업일: {r.work_date}
                    </div>
                    <div style={{ marginTop: 8, color: "#f59e0b" }}>
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </div>
                    {r.comment && (
                      <div className="post-desc" style={{ marginTop: 6 }}>
                        {r.comment}
                      </div>
                    )}
                    <div className="post-meta" style={{ marginTop: 6 }}>
                      작성일: {formatDateTime(r.created_at)}
                      {r.is_public && (
                        <span className="tag" style={{ marginLeft: 8 }}>
                          공개 예정
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button className="btn" onClick={() => handleEdit(r)}>
                    수정
                  </button>
                  <button className="btn" onClick={() => handleDelete(r.id)}>
                    삭제
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
