"use client";

import { useState } from "react";

type SeekerNotificationSettings = {
  nearby_postings: boolean;
  category_match: boolean;
  wage_match: boolean;
};

export default function SeekerNotificationSettings({
  initialSettings,
}: {
  initialSettings: SeekerNotificationSettings;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleToggle = (key: keyof SeekerNotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/me/seeker-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        alert("저장 실패");
        return;
      }

      alert("알림 설정이 저장되었습니다!");
    } catch (err) {
      alert("오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 className="card-title">알림 설정</h3>
      <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
        받고 싶은 알림을 선택하세요. SMS 또는 카카오톡으로 발송됩니다.
      </p>

      <div style={{ display: "grid", gap: 16, marginBottom: 20 }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={settings.nearby_postings}
            onChange={() => handleToggle("nearby_postings")}
            style={{ width: 18, height: 18 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              내 반경 내 새 공고 알림
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              설정한 활동 반경 내에 새 공고가 등록되면 알림을 받습니다.
            </div>
          </div>
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={settings.category_match}
            onChange={() => handleToggle("category_match")}
            style={{ width: 18, height: 18 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              선호 카테고리 공고 알림
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              내가 선호하는 카테고리의 새 공고가 등록되면 알림을 받습니다.
            </div>
          </div>
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={settings.wage_match}
            onChange={() => handleToggle("wage_match")}
            style={{ width: 18, height: 18 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              희망 임금 이상 공고 알림
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              내가 설정한 희망 임금 이상의 공고가 등록되면 알림을 받습니다.
            </div>
          </div>
        </label>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "저장 중..." : "저장"}
      </button>
    </div>
  );
}
