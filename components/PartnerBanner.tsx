"use client";
import { useEffect, useRef, useState } from "react";
import type { MeAccount } from "@/lib/auth";

type Partner = {
  id: number;
  name: string;
  address?: string | null;
  lat: number;
  lng: number;
  logo_url?: string | null;
  link_url?: string | null;
  tags_json?: string[] | null;
  distanceKm?: number;
};

const DEFAULT_CENTER = { lat: 37.503, lng: 126.766 }; // 부천시청
const COORD_TTL_MS = 5 * 60 * 1000; // 좌표 캐시 5분
const PARTNERS_TTL_MS = 10 * 60 * 1000; // 파트너 캐시 10분

function readCoordCache() {
  try {
    const s = sessionStorage.getItem("hp:lastCoords");
    if (!s) return null;
    const j = JSON.parse(s);
    if (!j?.lat || !j?.lng || !j?.ts) return null;
    if (Date.now() - j.ts > COORD_TTL_MS) return null;
    return { lat: Number(j.lat), lng: Number(j.lng) };
  } catch {
    return null;
  }
}
function writeCoordCache(lat: number, lng: number) {
  try {
    sessionStorage.setItem(
      "hp:lastCoords",
      JSON.stringify({ lat, lng, ts: Date.now() })
    );
  } catch {}
}
function readPartnersCache(lat: number, lng: number): Partner[] | null {
  try {
    const key = `hp:partners:${lat.toFixed(4)},${lng.toFixed(4)}`;
    const s = sessionStorage.getItem(key);
    if (!s) return null;
    const j = JSON.parse(s);
    if (!j?.ts || !Array.isArray(j.items)) return null;
    if (Date.now() - j.ts > PARTNERS_TTL_MS) return null;
    return j.items as Partner[];
  } catch {
    return null;
  }
}
function writePartnersCache(lat: number, lng: number, items: Partner[]) {
  try {
    const key = `hp:partners:${lat.toFixed(4)},${lng.toFixed(4)}`;
    sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), items }));
  } catch {}
}

export default function PartnerBanner({
  account,
}: {
  account: MeAccount | null;
}) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [subtitle, setSubtitle] = useState("부천 근처 파트너");
  const [loading, setLoading] = useState(false);
  const firstPaint = useRef(true);

  useEffect(() => {
    let stop = false;
    const useSaved = account?.lat != null && account?.lng != null;

    async function fetchPartners(lat: number, lng: number, label: string) {
      // 1) 캐시로 즉시 그림
      const cached = readPartnersCache(lat, lng);
      if (cached && firstPaint.current) {
        setPartners(cached);
        setSubtitle(label + " · 캐시");
        firstPaint.current = false;
      }
      // 2) 네트워크로 최신 갱신
      try {
        setLoading(!cached);
        const r = await fetch(`/api/partners?lat=${lat}&lng=${lng}`, {
          cache: "no-store",
        });
        const j = await r.json();
        if (stop) return;
        const items: Partner[] = j.items ?? [];
        setPartners(items);
        setSubtitle(label);
        writePartnersCache(lat, lng, items);
      } finally {
        if (!stop) setLoading(false);
      }
    }

    (async () => {
      // 저장된 좌표가 있으면 그걸로 고정
      if (useSaved) {
        const lat = Number(account!.lat),
          lng = Number(account!.lng);
        await fetchPartners(lat, lng, "내 저장 주소 기준");
        return;
      }

      // 최근 브라우저 좌표 캐시가 있으면 재사용
      const cachedCoord = readCoordCache();
      if (cachedCoord) {
        await fetchPartners(cachedCoord.lat, cachedCoord.lng, "최근 위치 기준");
        return;
      }

      // 지오로케이션 시도
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude,
              lng = pos.coords.longitude;
            writeCoordCache(lat, lng);
            await fetchPartners(lat, lng, "현재 위치 기준");
          },
          async () => {
            await fetchPartners(
              DEFAULT_CENTER.lat,
              DEFAULT_CENTER.lng,
              "부천시청 기준(권한 거부)"
            );
          },
          { maximumAge: 60000, timeout: 7000 }
        );
      } else {
        await fetchPartners(
          DEFAULT_CENTER.lat,
          DEFAULT_CENTER.lng,
          "부천시청 기준(위치 미지원)"
        );
      }
    })();

    return () => {
      stop = true;
    };
  }, [account?.lat, account?.lng]);

  return (
    <section className="partner-banner">
      <div className="partner-banner__inner">
        <div className="partner-banner__header">
          <h2>현장 파트너 광고</h2>
          <p>{subtitle}</p>
        </div>
        {loading && !partners.length ? (
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
                  href={p.link_url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="card__body">
                    <div className="card__title">{p.name}</div>
                    <div className="card__meta">
                      {p.address ?? "부천"}
                      {typeof p.distanceKm === "number"
                        ? ` · 약 ${p.distanceKm.toFixed(1)} km`
                        : ""}
                    </div>
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
