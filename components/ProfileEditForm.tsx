"use client";

import { useState } from "react";

type ProfileFormData = {
  display_name: string;
  phone: string;
  company_name: string;
  contact_method: "phone" | "kakao";
  radius_km: number;
  preferred_categories: string[];
};

export default function ProfileEditForm({
  initialData,
  onSuccess,
}: {
  initialData: ProfileFormData;
  onSuccess?: () => void;
}) {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/me/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        alert("저장 실패");
        return;
      }

      alert("프로필이 저장되었습니다!");
      if (onSuccess) onSuccess();
      window.location.reload();
    } catch (err) {
      alert("오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryToggle = (cat: string) => {
    const current = formData.preferred_categories || [];
    const updated = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    setFormData({ ...formData, preferred_categories: updated });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="detail-grid" style={{ marginBottom: 16 }}>
        {/* 담당자 이름 */}
        <div className="kv">
          <label className="kv-key" htmlFor="display_name">
            담당자 이름
          </label>
          <input
            id="display_name"
            type="text"
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
            }}
            value={formData.display_name}
            onChange={(e) =>
              setFormData({ ...formData, display_name: e.target.value })
            }
            required
          />
        </div>

        {/* 휴대폰 */}
        <div className="kv">
          <label className="kv-key" htmlFor="phone">
            휴대폰
          </label>
          <input
            id="phone"
            type="tel"
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
            }}
            placeholder="010-0000-0000"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>

        {/* 업체명 */}
        <div className="kv">
          <label className="kv-key" htmlFor="company_name">
            업체명 (선택)
          </label>
          <input
            id="company_name"
            type="text"
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
            }}
            placeholder="개인도 가능"
            value={formData.company_name}
            onChange={(e) =>
              setFormData({ ...formData, company_name: e.target.value })
            }
          />
        </div>

        {/* 기본 연락수단 */}
        <div className="kv">
          <label className="kv-key" htmlFor="contact_method">
            기본 연락수단
          </label>
          <select
            id="contact_method"
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
            }}
            value={formData.contact_method}
            onChange={(e) =>
              setFormData({
                ...formData,
                contact_method: e.target.value as "phone" | "kakao",
              })
            }
          >
            <option value="phone">전화</option>
            <option value="kakao">카톡</option>
          </select>
        </div>

        {/* 활동 반경 */}
        <div className="kv">
          <label className="kv-key" htmlFor="radius_km">
            활동 반경 (km)
          </label>
          <input
            id="radius_km"
            type="number"
            className="kv-val"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "8px 10px",
              width: "100%",
            }}
            min="1"
            max="50"
            value={formData.radius_km}
            onChange={(e) =>
              setFormData({ ...formData, radius_km: Number(e.target.value) })
            }
          />
        </div>
      </div>

      {/* 선호 카테고리 */}
      <div className="kv" style={{ marginBottom: 16 }}>
        <div className="kv-key" style={{ marginBottom: 8 }}>
          선호 카테고리
        </div>
        <div className="chips">
          {[
            { key: "rc", label: "철근/형틀/콘크리트" },
            { key: "int", label: "내부마감" },
            { key: "mech", label: "설비/전기/배관" },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`chip ${
                formData.preferred_categories?.includes(cat.key) ? "active" : ""
              }`}
              onClick={() => handleCategoryToggle(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => window.location.reload()}
        >
          취소
        </button>
      </div>
    </form>
  );
}
