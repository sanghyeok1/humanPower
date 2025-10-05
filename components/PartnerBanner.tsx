// components/PartnerBanner.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { PartnerWithDistance } from "@/types";

const DEFAULT_CENTER = { lat: 37.503, lng: 126.766 }; // 부천시청 근처(대략)

export default function PartnerBanner({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partners, setPartners] = useState<PartnerWithDistance[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const subtitle = useMemo(() => {
    if (!isLoggedIn) return "로그인 후 내 위치 기준 파트너 광고가 노출됩니다.";
    if (loading) return "내 위치를 확인하고 있어요…";
    if (error) return error;
    if (center) return "내 기준 반경 10km 파트너";
    return "위치 정보를 확인하는 중입니다.";
  }, [isLoggedIn, loading, error, center]);

  useEffect(() => {
    if (!isLoggedIn) return;

    setLoading(true);

    const fetchByCoords = async (lat: number, lng: number) => {
      const res = await fetch(`/api/partners?lat=${lat}&lng=${lng}`, {
        cache: "no-store",
      });
      const data: {
        items: PartnerWithDistance[];
        center: { lat: number; lng: number };
      } = await res.json();
      setPartners(data.items);
      setCenter(data.center);
    };

    const fallback = async () => {
      try {
        await fetchByCoords(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      } catch {
        setError("파트너 광고를 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    };

    if (!("geolocation" in navigator)) {
      setError(
        "브라우저에서 위치 정보를 지원하지 않아요. 기본 위치로 보여드릴게요."
      );
      void fallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await fetchByCoords(pos.coords.latitude, pos.coords.longitude);
        } catch {
          setError("파트너 광고를 불러오지 못했어요.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("위치 권한이 거부되어 기본 위치(부천시청)로 노출합니다.");
        void fallback();
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 7_000 }
    );
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
        ) : (
          <div className="cards">
            {partners.length === 0 ? (
              <div className="empty">근처 파트너가 아직 없어요.</div>
            ) : (
              partners.map((p) => (
                <a
                  key={p.id}
                  className="card"
                  href={p.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="card__thumb">
                    <img src={p.logoUrl} alt={`${p.name} 로고`} />
                  </div>
                  <div className="card__body">
                    <div className="card__title">{p.name}</div>
                    <div className="card__meta">
                      {p.address ?? "부천"} · 약 {p.distanceKm.toFixed(1)} km
                    </div>
                    {p.tags?.length ? (
                      <div className="tags">
                        {p.tags.slice(0, 3).map((t) => (
                          <span key={t} className="tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </a>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
