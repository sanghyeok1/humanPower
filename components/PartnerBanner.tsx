"use client";

import { useEffect, useState } from "react";

type Partner = {
  id: number;
  name: string;
  address?: string | null;
  logo_url?: string | null;
  link_url?: string | null;
  tags_json?: string[] | null;
  lat: string;
  lng: string;
  dist_m?: number; // 서버에서 오는 원시 거리(m)
  distanceKm?: number; // 프록시에서 변환해줄 수도 있음
};

const DEFAULT_CENTER = { lat: 37.503, lng: 126.766 }; // 부천시청

export default function PartnerBanner({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    DEFAULT_CENTER
  );
  const [subtitle, setSubtitle] = useState("부천 근처 파트너");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchBy(lat: number, lng: number, label: string) {
    try {
      const res = await fetch(`/api/partners?lat=${lat}&lng=${lng}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setPartners(data.items ?? []);
      setCenter(data.center ?? { lat, lng });
      setSubtitle(label);
    } catch {
      setError("파트너 광고를 불러오지 못했어요.");
    }
  }

  useEffect(() => {
    if (!isLoggedIn) return; // 비로그인은 기존 placeholder
    let stopped = false;

    (async () => {
      setLoading(true);
      setError(null);

      // 1) 내 프로필 좌표 우선
      try {
        const me = await fetch("/api/me", { cache: "no-store" });
        if (me.ok) {
          const j = await me.json();
          const acc = j?.account;
          const lat = Number(acc?.lat);
          const lng = Number(acc?.lng);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            if (!stopped) await fetchBy(lat, lng, "내 저장된 주소 기준");
            return;
          }
        }
      } catch {
        // 무시하고 폴백 진행
      }

      // 2) 브라우저 위치 폴백
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            if (stopped) return;
            const { latitude, longitude } = pos.coords;
            await fetchBy(latitude, longitude, "내 현재 위치 기준");
          },
          async () => {
            if (stopped) return;
            await fetchBy(
              DEFAULT_CENTER.lat,
              DEFAULT_CENTER.lng,
              "부천시청 기준(권한 거부)"
            );
          },
          { enableHighAccuracy: false, maximumAge: 60_000, timeout: 7_000 }
        );
      } else {
        // 3) 최종 기본값
        await fetchBy(
          DEFAULT_CENTER.lat,
          DEFAULT_CENTER.lng,
          "부천시청 기준(위치 미지원)"
        );
      }
    })();

    return () => {
      stopped = true;
    };
  }, [isLoggedIn]);

  return (
    <section className="partner-banner">
      <div className="partner-banner__inner">
        <div className="partner-banner__header">
          <h2>현장 파트너 광고</h2>
          <p>{subtitle}</p>
        </div>

        {!isLoggedIn ? (
          <div className="partner-banner__placeholder">
            <a href="/login" className="btn">
              로그인하러 가기
            </a>
          </div>
        ) : loading ? (
          <div className="skeleton-row">불러오는 중…</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="cards">
            {partners.length === 0 ? (
              <div className="empty">근처 파트너가 아직 없어요.</div>
            ) : (
              partners.map((p) => {
                const km =
                  typeof p.distanceKm === "number"
                    ? p.distanceKm
                    : typeof p.dist_m === "number"
                    ? p.dist_m / 1000
                    : undefined;
                return (
                  <a
                    key={p.id}
                    className="card"
                    href={p.link_url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className="card__thumb">
                      {p.logo_url ? (
                        <img src={p.logo_url} alt={`${p.name} 로고`} />
                      ) : (
                        <div className="noimg" />
                      )}
                    </div>
                    <div className="card__body">
                      <div className="card__title">{p.name}</div>
                      <div className="card__meta">
                        {p.address ?? "부천"}{" "}
                        {km !== undefined ? `· 약 ${km.toFixed(1)} km` : ""}
                      </div>
                      {Array.isArray(p.tags_json) && p.tags_json.length > 0 && (
                        <div className="tags">
                          {p.tags_json.slice(0, 3).map((t) => (
                            <span key={t} className="tag">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </a>
                );
              })
            )}
          </div>
        )}
      </div>
    </section>
  );
}
