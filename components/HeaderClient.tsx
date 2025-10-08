"use client";

import { useState } from "react";

export default function HeaderClient({
  displayName,
  lat,
  lng,
}: {
  displayName?: string;
  lat?: number;
  lng?: number;
}) {
  const [saving, setSaving] = useState(false);

  const onLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
    } catch {}
    window.location.href = "/";
  };

  const saveMyLocation = () => {
    if (!("geolocation" in navigator)) {
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }
    setSaving(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await fetch("/api/me/location", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          });
          const j = await r.json().catch(() => ({}));
          if (!r.ok || !j?.ok) {
            alert("위치 저장 실패");
          } else {
            // 새 좌표를 SSR 헤더/배너가 사용하도록 전체 새로고침
            window.location.reload();
          }
        } finally {
          setSaving(false);
        }
      },
      () => {
        alert("위치 권한을 허용해 주세요.");
        setSaving(false);
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 7_000 }
    );
  };

  const namePart = displayName ? `${displayName}님` : "로그인됨";
  const coordPart =
    typeof lat === "number" && typeof lng === "number"
      ? ` (${lat.toFixed(5)}, ${lng.toFixed(5)})`
      : "";

  const needSave = !(typeof lat === "number" && typeof lng === "number");

  return (
    <div
      className="auth"
      style={{ display: "flex", gap: 8, alignItems: "center" }}
    >
      <span style={{ fontSize: 13 }}>
        {namePart}
        {coordPart}
      </span>

      {needSave && (
        <button className="btn" onClick={saveMyLocation} disabled={saving}>
          {saving ? "저장 중…" : "내 위치 저장"}
        </button>
      )}

      <a className="btn" href="/post/new">
        공고 올리기
      </a>
      <button className="btn" onClick={onLogout}>
        로그아웃
      </button>
    </div>
  );
}
