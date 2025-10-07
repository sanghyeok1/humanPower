"use client";

import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    daum: any;
  }
}

const DAUM_POSTCODE_SDK =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("script load error: " + src));
    document.head.appendChild(el);
  });
}

async function waitUntil(test: () => boolean, timeoutMs = 8000, step = 50) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (test()) return;
    await new Promise((r) => setTimeout(r, step));
  }
  throw new Error("timeout");
}

export default function SeekerSignupPage() {
  // 필드들 중 주소/좌표 관련만 간단 발췌(나머지는 기존 코드 유지)
  const [postalCode, setPostalCode] = useState("");
  const [roadAddress, setRoadAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [readyPostcode, setReadyPostcode] = useState(false);
  const [postcodeOpen, setPostcodeOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const layerRef = useRef<HTMLDivElement | null>(null);

  // 우편번호 스크립트만 로드 (지도 SDK는 더 이상 필요 없음)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!window.daum?.Postcode) {
          await loadScript(DAUM_POSTCODE_SDK);
          await waitUntil(() => !!window.daum?.Postcode);
        }
        if (!cancelled) setReadyPostcode(true);
      } catch (e: any) {
        if (!cancelled) setMsg(e?.message ?? "우편번호 모듈 로딩 실패");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 레이어 임베드 열기
  function openPostcodeLayer() {
    setMsg(null);
    if (!readyPostcode) {
      setMsg("우편번호 모듈 로딩 중입니다. 잠시 후 다시 시도하세요.");
      return;
    }
    setPostcodeOpen(true);
    setTimeout(() => {
      if (!layerRef.current) return;
      layerRef.current.innerHTML = "";
      new window.daum.Postcode({
        oncomplete: async (data: any) => {
          const addr = data.roadAddress || data.address || "";
          setPostalCode(data.zonecode || "");
          setRoadAddress(addr);
          setDetailAddress("");
          setPostcodeOpen(false);

          // ⭐ 서버 프록시로 좌표 조회
          try {
            const r = await fetch(
              `/api/geocode?query=${encodeURIComponent(addr)}`,
              { cache: "no-store" }
            );
            const j = await r.json();
            if (!r.ok) {
              setLat(null);
              setLng(null);
              setMsg(j?.error || "좌표를 찾지 못했습니다.");
              return;
            }
            setLat(j.lat);
            setLng(j.lng);
          } catch {
            setMsg("좌표 변환 중 네트워크 오류");
          }
        },
        onclose: () => setPostcodeOpen(false),
        width: "100%",
        height: "100%",
      }).embed(layerRef.current);
    }, 0);
  }

  const addressValid =
    !!roadAddress && Number.isFinite(lat) && Number.isFinite(lng);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!addressValid) {
      setMsg("주소 선택 후 좌표가 자동 입력되어야 합니다.");
      return;
    }
    setSaving(true);
    try {
      console.log("[payload]", {
        postalCode,
        roadAddress,
        detailAddress,
        lat,
        lng,
      });
      setMsg("임시 제출 완료(프론트). 콘솔 확인!");
    } catch {
      setMsg("제출 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>구직자 회원가입</h1>

      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: 12, marginTop: 12 }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            placeholder="우편번호"
            value={postalCode}
            readOnly
            style={{ width: 140 }}
          />
          <button
            type="button"
            className="btn"
            onClick={openPostcodeLayer}
            disabled={!readyPostcode}
          >
            카카오 주소 찾기
          </button>
        </div>

        <input
          className="input"
          placeholder="도로명 주소"
          value={roadAddress}
          readOnly
        />
        <input
          className="input"
          placeholder="상세 주소"
          value={detailAddress}
          onChange={(e) => setDetailAddress(e.target.value)}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            placeholder="위도(lat)"
            value={lat ?? ""}
            readOnly
          />
          <input
            className="input"
            placeholder="경도(lng)"
            value={lng ?? ""}
            readOnly
          />
        </div>

        {msg && (
          <div
            className="notice"
            style={{ color: msg.includes("완료") ? "#166534" : "#b91c1c" }}
          >
            {msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "제출 중…" : "가입하기(프론트 데모)"}
          </button>
          <a href="/" className="btn">
            취소
          </a>
        </div>
      </form>

      {/* 우편번호 레이어 */}
      {postcodeOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.4)",
            display: "grid",
            placeItems: "center",
            zIndex: 50,
          }}
          onClick={() => setPostcodeOpen(false)}
        >
          <div
            style={{
              width: "min(620px, 92vw)",
              height: "min(520px, 80vh)",
              background: "#fff",
              borderRadius: 12,
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 700,
              }}
            >
              주소 검색
              <button className="btn" onClick={() => setPostcodeOpen(false)}>
                닫기
              </button>
            </div>
            <div ref={layerRef} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      )}
    </main>
  );
}
