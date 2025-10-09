"use client";

import { useState, useEffect } from "react";

type PostingTemplate = {
  id: string;
  name: string;
  title: string;
  cat: "rc" | "int" | "mech";
  work_period?: string;
  work_hours?: "day" | "night" | "both";
  wage_type?: "daily" | "hourly" | "monthly";
  wage_amount?: string;
  meals_provided?: boolean;
  housing_provided?: boolean;
  equipment_provided?: boolean;
  address?: string;
  required_people?: number;
  role?: string;
  summary?: string;
};

export default function TemplateManager() {
  const [templates, setTemplates] = useState<PostingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<PostingTemplate>>({
    name: "",
    title: "",
    cat: "rc",
    work_hours: "day",
    wage_type: "daily",
    meals_provided: false,
    housing_provided: false,
    equipment_provided: false,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // 수정
        await fetch(`/api/templates/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // 신규
        await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      alert("템플릿이 저장되었습니다!");
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadTemplates();
    } catch (err) {
      alert("저장 실패");
    }
  };

  const handleEdit = (tpl: PostingTemplate) => {
    setFormData(tpl);
    setEditingId(tpl.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await fetch(`/api/templates/${id}`, { method: "DELETE" });
      alert("삭제되었습니다");
      loadTemplates();
    } catch (err) {
      alert("삭제 실패");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      cat: "rc",
      work_hours: "day",
      wage_type: "daily",
      meals_provided: false,
      housing_provided: false,
      equipment_provided: false,
    });
  };

  const categoryLabel = (cat: string) => {
    return cat === "rc"
      ? "철근/형틀/콘크리트"
      : cat === "int"
      ? "내부마감"
      : "설비/전기/배관";
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 className="card-title">공고 템플릿 관리</h3>
        <p className="muted" style={{ fontSize: 14, marginBottom: 12 }}>
          자주 사용하는 공고 양식을 저장하여 빠르게 재사용할 수 있습니다.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? "닫기" : "+ 새 템플릿"}
        </button>
      </div>

      {/* 템플릿 생성/수정 폼 */}
      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="card-title">
            {editingId ? "템플릿 수정" : "새 템플릿 만들기"}
          </h3>
          <form onSubmit={handleSave}>
            <div className="detail-grid" style={{ marginBottom: 12 }}>
              <div className="kv">
                <label className="kv-key">템플릿 이름 *</label>
                <input
                  type="text"
                  className="kv-val"
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 10px",
                    width: "100%",
                  }}
                  placeholder="예: 철근 작업 기본"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
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
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="kv">
                <label className="kv-key">카테고리 *</label>
                <select
                  className="kv-val"
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 10px",
                    width: "100%",
                  }}
                  value={formData.cat || "rc"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cat: e.target.value as "rc" | "int" | "mech",
                    })
                  }
                >
                  <option value="rc">철근/형틀/콘크리트</option>
                  <option value="int">내부마감</option>
                  <option value="mech">설비/전기/배관</option>
                </select>
              </div>

              <div className="kv">
                <label className="kv-key">작업 기간</label>
                <input
                  type="text"
                  className="kv-val"
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 10px",
                    width: "100%",
                  }}
                  placeholder="예: 3일, 1주"
                  value={formData.work_period || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, work_period: e.target.value })
                  }
                />
              </div>

              <div className="kv">
                <label className="kv-key">근무시간</label>
                <select
                  className="kv-val"
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 10px",
                    width: "100%",
                  }}
                  value={formData.work_hours || "day"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      work_hours: e.target.value as "day" | "night" | "both",
                    })
                  }
                >
                  <option value="day">주간</option>
                  <option value="night">야간</option>
                  <option value="both">주야간</option>
                </select>
              </div>

              <div className="kv">
                <label className="kv-key">임금형태</label>
                <select
                  className="kv-val"
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 10px",
                    width: "100%",
                  }}
                  value={formData.wage_type || "daily"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wage_type: e.target.value as
                        | "daily"
                        | "hourly"
                        | "monthly",
                    })
                  }
                >
                  <option value="daily">일급</option>
                  <option value="hourly">시급</option>
                  <option value="monthly">월급</option>
                </select>
              </div>

              <div className="kv">
                <label className="kv-key">임금 금액</label>
                <input
                  type="text"
                  className="kv-val"
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 10px",
                    width: "100%",
                  }}
                  placeholder="예: 18만원"
                  value={formData.wage_amount || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, wage_amount: e.target.value })
                  }
                />
              </div>

              <div className="kv">
                <label className="kv-key">필요 인원</label>
                <input
                  type="number"
                  className="kv-val"
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 10px",
                    width: "100%",
                  }}
                  min="1"
                  value={formData.required_people || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      required_people: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="kv">
                <label className="kv-key">역할</label>
                <input
                  type="text"
                  className="kv-val"
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 10px",
                    width: "100%",
                  }}
                  placeholder="예: 조공, 기능공"
                  value={formData.role || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                />
              </div>

              <div className="kv">
                <label className="kv-key">주소</label>
                <input
                  type="text"
                  className="kv-val"
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 10px",
                    width: "100%",
                  }}
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>

            {/* 제공 사항 체크박스 */}
            <div className="kv" style={{ marginBottom: 12 }}>
              <div className="kv-key" style={{ marginBottom: 8 }}>
                제공 사항
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={formData.meals_provided || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meals_provided: e.target.checked,
                      })
                    }
                  />
                  <span>식대</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={formData.housing_provided || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        housing_provided: e.target.checked,
                      })
                    }
                  />
                  <span>숙소</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={formData.equipment_provided || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        equipment_provided: e.target.checked,
                      })
                    }
                  />
                  <span>장비</span>
                </label>
              </div>
            </div>

            {/* 요약/메모 */}
            <div className="kv" style={{ marginBottom: 12 }}>
              <label className="kv-key">요약/메모</label>
              <textarea
                className="kv-val"
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "8px 10px",
                  width: "100%",
                  minHeight: 80,
                }}
                value={formData.summary || ""}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
              />
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

      {/* 템플릿 목록 */}
      <div className="post-list">
        {templates.length === 0 ? (
          <div className="post-empty">저장된 템플릿이 없습니다.</div>
        ) : (
          templates.map((tpl) => (
            <div key={tpl.id} className="post-item">
              <div style={{ padding: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div className="post-title">{tpl.name}</div>
                    <div className="post-meta">
                      {categoryLabel(tpl.cat)} · {tpl.title}
                    </div>
                    {tpl.wage_amount && (
                      <div className="post-desc">{tpl.wage_amount}</div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button className="btn" onClick={() => handleEdit(tpl)}>
                    수정
                  </button>
                  <button className="btn" onClick={() => handleDelete(tpl.id)}>
                    삭제
                  </button>
                  <button className="btn btn-primary">이 템플릿으로 공고 작성</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
