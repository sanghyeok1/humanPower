"use client";

import { useState } from "react";

type SeekerProfileData = {
  display_name: string;
  phone: string;
  nickname: string;
  skills: string[];
  experience_years: number;
  recent_work: string;
  equipment: string[];
  licenses: string[];
  work_hours: "day" | "night" | "both";
  desired_wage_type: "daily" | "hourly";
  desired_wage_amount: string;
  available_immediately: boolean;
  available_from: string;
  radius_km: number;
  preferred_categories: string[];
};

export default function SeekerProfileForm({
  initialData,
}: {
  initialData: Partial<SeekerProfileData>;
}) {
  const [formData, setFormData] = useState<Partial<SeekerProfileData>>({
    display_name: initialData.display_name || "",
    phone: initialData.phone || "",
    nickname: initialData.nickname || "",
    skills: initialData.skills || [],
    experience_years: initialData.experience_years || 0,
    recent_work: initialData.recent_work || "",
    equipment: initialData.equipment || [],
    licenses: initialData.licenses || [],
    work_hours: initialData.work_hours || "day",
    desired_wage_type: initialData.desired_wage_type || "daily",
    desired_wage_amount: initialData.desired_wage_amount || "",
    available_immediately: initialData.available_immediately ?? true,
    available_from: initialData.available_from || "",
    radius_km: initialData.radius_km || 10,
    preferred_categories: initialData.preferred_categories || [],
  });

  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newEquipment, setNewEquipment] = useState("");
  const [newLicense, setNewLicense] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/me/seeker-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        alert("저장 실패");
        return;
      }

      alert("프로필이 저장되었습니다!");
      window.location.reload();
    } catch (err) {
      alert("오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...(formData.skills || []), newSkill.trim()] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills?.filter(s => s !== skill) });
  };

  const addEquipment = () => {
    if (newEquipment.trim() && !formData.equipment?.includes(newEquipment.trim())) {
      setFormData({ ...formData, equipment: [...(formData.equipment || []), newEquipment.trim()] });
      setNewEquipment("");
    }
  };

  const removeEquipment = (item: string) => {
    setFormData({ ...formData, equipment: formData.equipment?.filter(e => e !== item) });
  };

  const addLicense = () => {
    if (newLicense.trim() && !formData.licenses?.includes(newLicense.trim())) {
      setFormData({ ...formData, licenses: [...(formData.licenses || []), newLicense.trim()] });
      setNewLicense("");
    }
  };

  const removeLicense = (lic: string) => {
    setFormData({ ...formData, licenses: formData.licenses?.filter(l => l !== lic) });
  };

  const toggleCategory = (cat: string) => {
    const current = formData.preferred_categories || [];
    const updated = current.includes(cat)
      ? current.filter(c => c !== cat)
      : [...current, cat];
    setFormData({ ...formData, preferred_categories: updated });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="card-title">기본 정보</h3>
      <div className="detail-grid" style={{ marginBottom: 16 }}>
        <div className="kv">
          <label className="kv-key">이름 *</label>
          <input type="text" className="kv-val" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} required />
        </div>

        <div className="kv">
          <label className="kv-key">닉네임/표시명</label>
          <input type="text" className="kv-val" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            value={formData.nickname} onChange={(e) => setFormData({ ...formData, nickname: e.target.value })} />
        </div>

        <div className="kv">
          <label className="kv-key">휴대폰</label>
          <input type="tel" className="kv-val" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            placeholder="010-0000-0000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        </div>

        <div className="kv">
          <label className="kv-key">경력 (년)</label>
          <input type="number" className="kv-val" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            min="0" value={formData.experience_years} onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })} />
        </div>
      </div>

      <div className="kv" style={{ marginBottom: 16 }}>
        <label className="kv-key">최근 작업</label>
        <textarea className="kv-val" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%", minHeight: 60 }}
          placeholder="예: 부천 XX아파트 철근 작업" value={formData.recent_work} onChange={(e) => setFormData({ ...formData, recent_work: e.target.value })} />
      </div>

      <h3 className="card-title" style={{ marginTop: 24 }}>보유 기술/스킬</h3>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <input type="text" placeholder="예: 철근 배근" value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", flex: 1 }} />
          <button type="button" className="btn" onClick={addSkill}>추가</button>
        </div>
        <div className="tags">
          {formData.skills?.map(s => (
            <span key={s} className="tag" style={{ cursor: "pointer" }} onClick={() => removeSkill(s)}>{s} ✕</span>
          ))}
        </div>
      </div>

      <h3 className="card-title" style={{ marginTop: 24 }}>보유 장비</h3>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <input type="text" placeholder="예: 용접기" value={newEquipment} onChange={(e) => setNewEquipment(e.target.value)}
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", flex: 1 }} />
          <button type="button" className="btn" onClick={addEquipment}>추가</button>
        </div>
        <div className="tags">
          {formData.equipment?.map(e => (
            <span key={e} className="tag" style={{ cursor: "pointer" }} onClick={() => removeEquipment(e)}>{e} ✕</span>
          ))}
        </div>
      </div>

      <h3 className="card-title" style={{ marginTop: 24 }}>자격증/면허</h3>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <input type="text" placeholder="예: 용접기능사" value={newLicense} onChange={(e) => setNewLicense(e.target.value)}
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", flex: 1 }} />
          <button type="button" className="btn" onClick={addLicense}>추가</button>
        </div>
        <div className="tags">
          {formData.licenses?.map(l => (
            <span key={l} className="tag" style={{ cursor: "pointer" }} onClick={() => removeLicense(l)}>{l} ✕</span>
          ))}
        </div>
      </div>

      <h3 className="card-title" style={{ marginTop: 24 }}>근무 조건</h3>
      <div className="detail-grid" style={{ marginBottom: 16 }}>
        <div className="kv">
          <label className="kv-key">근무 가능 시간대</label>
          <select className="kv-val" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            value={formData.work_hours} onChange={(e) => setFormData({ ...formData, work_hours: e.target.value as any })}>
            <option value="day">주간</option>
            <option value="night">야간</option>
            <option value="both">주야간</option>
          </select>
        </div>

        <div className="kv">
          <label className="kv-key">희망 임금 형태</label>
          <select className="kv-val" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            value={formData.desired_wage_type} onChange={(e) => setFormData({ ...formData, desired_wage_type: e.target.value as any })}>
            <option value="daily">일급</option>
            <option value="hourly">시급</option>
          </select>
        </div>

        <div className="kv">
          <label className="kv-key">희망 임금 금액</label>
          <input type="text" className="kv-val" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            placeholder="예: 18만원" value={formData.desired_wage_amount} onChange={(e) => setFormData({ ...formData, desired_wage_amount: e.target.value })} />
        </div>

        <div className="kv">
          <label className="kv-key">활동 반경 (km)</label>
          <input type="number" className="kv-val" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%" }}
            min="1" max="50" value={formData.radius_km} onChange={(e) => setFormData({ ...formData, radius_km: Number(e.target.value) })} />
        </div>
      </div>

      <div className="kv" style={{ marginBottom: 16 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={formData.available_immediately} onChange={(e) => setFormData({ ...formData, available_immediately: e.target.checked })} />
          <span>즉시 가능</span>
        </label>
        {!formData.available_immediately && (
          <input type="date" className="kv-val" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", width: "100%", marginTop: 8 }}
            value={formData.available_from} onChange={(e) => setFormData({ ...formData, available_from: e.target.value })} />
        )}
      </div>

      <div className="kv" style={{ marginBottom: 16 }}>
        <div className="kv-key" style={{ marginBottom: 8 }}>선호 카테고리</div>
        <div className="chips">
          {[
            { key: "rc", label: "철근/형틀/콘크리트" },
            { key: "int", label: "내부마감" },
            { key: "mech", label: "설비/전기/배관" },
          ].map(cat => (
            <button key={cat.key} type="button" className={`chip ${formData.preferred_categories?.includes(cat.key) ? "active" : ""}`}
              onClick={() => toggleCategory(cat.key)}>{cat.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "저장 중..." : "저장"}</button>
        <button type="button" className="btn" onClick={() => window.location.reload()}>취소</button>
      </div>
    </form>
  );
}
