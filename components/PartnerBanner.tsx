"use client";

import { useEffect, useState } from "react";

type Partner = {
  id: number;
  name: string;
  address?: string | null;

  logo_url?: string | null;
  link_url?: string | null;
  tags_json?: string[] | null;

  lat: number | string;
  lng: number | string;

  dist_m?: number;
  distanceKm?: number;

  // 호환용(있어도 되고 없어도 됨)
  logoUrl?: string | null;
  linkUrl?: string | null;
  tags?: string[];
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

  async function fetchPartners(lat: number, lng: number, label: string) {
    try {
      const res = await fetch(`/api/partners?lat=${lat}&lng=${lng}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "partners_failed");
      setPartners(data.items ?? []);
      setCenter(data.center ?? { lat, lng });
      setSubtitle(label);
      setError(null);
    } catch (e: any) {
      setError("파트너 광고를 불러오지 못했어요.");
    }
  }

  useEffect(() => {
    let abort = false;
    (async () => {
      if (!isLoggedIn) return;
      setLoading(true);
      setError(null);

      // 1) 내 저장 좌표 우선
      try {
        const me = await fetch("/api/me", { cache: "no-store" });
        if (me.ok) {
          const j = await me.json().catch(() => ({}));
          const acc = j?.account;
          const lat = Number(acc?.lat);
          const lng = Number(acc?.lng);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            if (!abort) await fetchPartners(lat, lng, "내 저장된 주소 기준");
            setLoading(false);
            return;
          }
        }
      } catch {
        // 무시하고 폴백
      }

      // 2) 브라우저 위치
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            if (abort) return;
            await fetchPartners(
              pos.coords.latitude,
              pos.coords.longitude,
              "내 현재 위치 기준"
            );
            setLoading(false);
          },
          async () => {
            if (abort) return;
            await fetchPartners(
              DEFAULT_CENTER.lat,
              DEFAULT_CENTER.lng,
              "부천시청 기준(권한 거부)"
            );
            setLoading(false);
          },
          { enableHighAccuracy: false, maximumAge: 60_000, timeout: 7_000 }
        );
      } else {
        // 3) 기본
        await fetchPartners(
          DEFAULT_CENTER.lat,
          DEFAULT_CENTER.lng,
          "부천시청 기준(위치 미지원)"
        );
        setLoading(false);
      }
    })();

    return () => {
      abort = true;
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
                const link = p.link_url ?? p.linkUrl ?? "#";
                const logo = p.logo_url ?? p.logoUrl ?? undefined;
                const tags = p.tags_json ?? p.tags ?? [];
                return (
                  <a
                    key={p.id}
                    className="card"
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className="card__thumb">
                      {logo ? (
                        <img src={logo} alt={`${p.name} 로고`} />
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
                      {tags.length > 0 && (
                        <div className="tags">
                          {tags.slice(0, 3).map((t) => (
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
