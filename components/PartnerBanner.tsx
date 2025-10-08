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
const COORD_TTL_MS = 5 * 60 * 1000;
const PARTNERS_TTL_MS = 10 * 60 * 1000;

// ── sessionStorage 캐시 helpers
const readCoord = () => {
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
};
const writeCoord = (lat: number, lng: number) => {
  try {
    sessionStorage.setItem(
      "hp:lastCoords",
      JSON.stringify({ lat, lng, ts: Date.now() })
    );
  } catch {}
};
const readPartners = (lat: number, lng: number): Partner[] | null => {
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
};
const writePartners = (lat: number, lng: number, items: Partner[]) => {
  try {
    const key = `hp:partners:${lat.toFixed(4)},${lng.toFixed(4)}`;
    sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), items }));
  } catch {}
};

export default function PartnerBanner({
  account,
}: {
  account: MeAccount | null;
}) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [subtitle, setSubtitle] = useState("부천 근처 파트너");
  const [loading, setLoading] = useState(false);

  // 가로 스크롤 제어
  const rowRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const initial = useRef(account);
  const firstPaint = useRef(true);

  const updateArrows = () => {
    const el = rowRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < max - 8);
  };
  const scrollBy = (dir: "left" | "right") => {
    const el = rowRef.current;
    if (!el) return;
    const delta = el.clientWidth * 0.9 * (dir === "left" ? -1 : 1);
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  useEffect(() => {
    let stop = false;

    async function fetchPartners(lat: number, lng: number, label: string) {
      const cached = readPartners(lat, lng);
      if (cached && firstPaint.current) {
        setPartners(cached);
        setSubtitle(`${label} · 캐시`);
        firstPaint.current = false;
      }
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
        writePartners(lat, lng, items);
      } finally {
        if (!stop) setLoading(false);
        // 목록 바뀌면 화살표 상태 다시 계산
        setTimeout(updateArrows, 0);
      }
    }

    (async () => {
      const acc = initial.current;
      if (acc?.lat != null && acc?.lng != null) {
        await fetchPartners(
          Number(acc.lat),
          Number(acc.lng),
          "내 저장 주소 기준"
        );
        return;
      }

      const c = readCoord();
      if (c) {
        await fetchPartners(c.lat, c.lng, "최근 위치 기준");
        return;
      }

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            writeCoord(lat, lng);
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

    window.addEventListener("resize", updateArrows);
    return () => {
      stop = true;
      window.removeEventListener("resize", updateArrows);
    };
    // 의존성 비움: 내비게이션(검색 파라미터)으로 재실행 방지
  }, []);

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
          <div className="cards-wrap">
            <button
              className="scroll-btn left"
              aria-label="왼쪽"
              onClick={() => scrollBy("left")}
              disabled={!canLeft}
            >
              ‹
            </button>

            <div className="cards-row" ref={rowRef} onScroll={updateArrows}>
              {partners.length === 0 ? (
                <div className="empty">근처 파트너가 아직 없어요.</div>
              ) : (
                partners.map((p) => (
                  <a
                    key={p.id}
                    className="card card--h"
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
                      {p.tags_json?.length ? (
                        <div className="tags">
                          {p.tags_json.slice(0, 3).map((t) => (
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

            <button
              className="scroll-btn right"
              aria-label="오른쪽"
              onClick={() => scrollBy("right")}
              disabled={!canRight}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
