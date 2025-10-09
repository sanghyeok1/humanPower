"use client";

import { useState } from "react";

type NotificationSettings = {
  new_applicant?: boolean;
  new_message?: boolean;
  deadline_reminder?: boolean;
};

export default function NotificationSettings({
  initialSettings,
}: {
  initialSettings: NotificationSettings;
}) {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    try {
      const res = await fetch("/api/me/notifications", {
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
    <div className="card">
      <h3 className="card-title">알림 설정</h3>
      <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
        SMS 또는 카카오톡 알림을 받을 항목을 선택하세요.
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        {/* 새 지원 알림 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 10,
          }}
        >
          <div>
            <div style={{ fontWeight: 700 }}>새 지원 알림</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              누군가 내 공고에 지원하면 SMS·카톡으로 알려줍니다
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={settings.new_applicant || false}
              onChange={(e) =>
                setSettings({ ...settings, new_applicant: e.target.checked })
              }
            />
            <span>{settings.new_applicant ? "ON" : "OFF"}</span>
          </label>
        </div>

        {/* 메시지 알림 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 10,
          }}
        >
          <div>
            <div style={{ fontWeight: 700 }}>메시지 알림</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              지원자가 메시지를 보내면 알려줍니다
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={settings.new_message || false}
              onChange={(e) =>
                setSettings({ ...settings, new_message: e.target.checked })
              }
            />
            <span>{settings.new_message ? "ON" : "OFF"}</span>
          </label>
        </div>

        {/* 마감 임박 알림 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 10,
          }}
        >
          <div>
            <div style={{ fontWeight: 700 }}>마감 임박 알림</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              공고 마감 1일 전에 알려줍니다
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={settings.deadline_reminder || false}
              onChange={(e) =>
                setSettings({ ...settings, deadline_reminder: e.target.checked })
              }
            />
            <span>{settings.deadline_reminder ? "ON" : "OFF"}</span>
          </label>
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ marginTop: 16 }}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "저장 중..." : "저장"}
      </button>

      <div className="notice" style={{ marginTop: 16 }}>
        <strong>참고:</strong> 알림을 받으려면 휴대폰 번호가 인증되어 있어야 합니다.
        프로필 탭에서 휴대폰 번호를 등록하세요.
      </div>
    </div>
  );
}
