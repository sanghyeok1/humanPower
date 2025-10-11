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
const PARTNERS_TTL_MS = 10 * 60 * 1000;

const cacheKey = (lat: number, lng: number) =>
  `hp:partners:${lat.toFixed(4)},${lng.toFixed(4)}`;
const loadCache = (lat: number, lng: number): Partner[] | null => {
  try {
    const raw = sessionStorage.getItem(cacheKey(lat, lng));
    if (!raw) return null;
    const j = JSON.parse(raw);
    if (!j?.ts || !Array.isArray(j.items)) return null;
    if (Date.now() - j.ts > PARTNERS_TTL_MS) return null;
    return j.items as Partner[];
  } catch {
    return null;
  }
};
const saveCache = (lat: number, lng: number, items: Partner[]) => {
  try {
    sessionStorage.setItem(
      cacheKey(lat, lng),
      JSON.stringify({ ts: Date.now(), items })
    );
  } catch {}
};

export default function PartnerBanner({
  account,
}: {
  account: MeAccount | null;
}) {
  // 로그인 여부에 따라 사용할 '고정' 좌표 결정
  const hasUserLoc =
    account &&
    typeof account.lat === "number" &&
    typeof account.lng === "number";
  const target = hasUserLoc
    ? {
        lat: Number(account!.lat),
        lng: Number(account!.lng),
        label: "내 저장 주소 기준",
      }
    : {
        lat: DEFAULT_CENTER.lat,
        lng: DEFAULT_CENTER.lng,
        label: "부천시청 기준",
      };

  const locKey = `${target.lat.toFixed(5)},${target.lng.toFixed(5)}`;

  const [partners, setPartners] = useState<Partner[]>([]);
  const [subtitle, setSubtitle] = useState(target.label);
  const [loading, setLoading] = useState(false);

  // 마지막으로 처리한 좌표키(동일하면 스킵)
  const lastKeyRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const g = globalThis as any;

    // 0) 이미 같은 좌표를 처리했고, 세션 캐시도 있으면 캐시 데이터 설정
    const sessionItems0 = loadCache(target.lat, target.lng);
    if (g.__hpPartnerLastKey === locKey && sessionItems0) {
      // 상태가 비어있으면 캐시로 채우기
      if (partners.length === 0) {
        setPartners(sessionItems0);
        setSubtitle(`${target.label} · 캐시`);
      }
      return;
    }

    // 1) 같은 좌표키면 스킵 (단, 데이터가 있을 때만)
    if (lastKeyRef.current === locKey && partners.length > 0) return;

    // 2) 먼저 캐시로 즉시 그림 + 전역키 기록, 그리고 여기서 끝 (fetch 안 감)
    if (sessionItems0) {
      setPartners(sessionItems0);
      setSubtitle(`${target.label} · 캐시`);
      lastKeyRef.current = locKey;
      g.__hpPartnerLastKey = locKey;
      return;
    }
    // 2-1) 전역 캐시가 있다면 그것도 활용
    if (
      g.__hpPartnerCache &&
      g.__hpPartnerCache.key === locKey &&
      Date.now() - g.__hpPartnerCache.ts <= PARTNERS_TTL_MS
    ) {
      setPartners(g.__hpPartnerCache.items);
      setSubtitle(`${target.label} · 캐시`);
      lastKeyRef.current = locKey;
      g.__hpPartnerLastKey = locKey;
      return;
    }

    // 3) 여기까지 왔으면 진짜 최초 호출만 fetch
    let stop = false;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(
          `/api/partners?lat=${target.lat}&lng=${target.lng}`,
          { cache: "no-store" }
        );
        const j = await r.json();
        if (stop) return;
        const items: Partner[] = j.items ?? [];
        setPartners(items);
        setSubtitle(target.label);
        saveCache(target.lat, target.lng, items);
        g.__hpPartnerCache = { key: locKey, ts: Date.now(), items };
      } finally {
        if (!stop) setLoading(false);
        lastKeyRef.current = locKey;
        g.__hpPartnerLastKey = locKey;
      }
    })();

    return () => {
      stop = true;
    };
    // 위치 정보만 의존 → 탭/검색 파라미터 변경으로는 재요청 안 함
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locKey, target.label, target.lat, target.lng]);

  return (
    <section className="partner-banner">
      <div className="partner-banner__inner">
        <div className="partner-banner__header">
          <h2>현장 파트너 광고</h2>
          <p>{subtitle} · 반경 5km 이내</p>
        </div>

        {loading && !partners.length ? (
          <div className="skeleton-row">불러오는 중…</div>
        ) : partners.length === 0 ? (
          <div className="empty">근처 파트너가 아직 없어요.</div>
        ) : (
          <div className="cards-wrap">
            <button
              className="scroll-btn left"
              onClick={scrollLeft}
              aria-label="왼쪽 스크롤"
            >
              ‹
            </button>
            <div className="cards-row" ref={scrollRef}>
              {partners.map((p) => (
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
              ))}
            </div>
            <button
              className="scroll-btn right"
              onClick={scrollRight}
              aria-label="오른쪽 스크롤"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
