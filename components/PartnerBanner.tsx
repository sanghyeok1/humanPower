"use client";
import { useEffect, useState } from "react";
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

const DEFAULT_CENTER = { lat: 37.503, lng: 126.766 };

export default function PartnerBanner({
  account,
}: {
  account: MeAccount | null;
}) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [subtitle, setSubtitle] = useState("부천 근처 파트너");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let stop = false;
    (async () => {
      setLoading(true);
      const useSaved = account?.lat != null && account?.lng != null;
      const fetchIt = async (lat: number, lng: number, label: string) => {
        const r = await fetch(`/api/partners?lat=${lat}&lng=${lng}`, {
          cache: "no-store",
        });
        const j = await r.json();
        if (!stop) {
          setPartners(j.items ?? []);
          setSubtitle(label);
          setLoading(false);
        }
      };
      if (useSaved) {
        await fetchIt(account!.lat!, account!.lng!, "내 저장 주소 기준");
        return;
      }
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (p) =>
            fetchIt(p.coords.latitude, p.coords.longitude, "현재 위치 기준"),
          () =>
            fetchIt(
              DEFAULT_CENTER.lat,
              DEFAULT_CENTER.lng,
              "부천시청 기준(권한 거부)"
            ),
          { maximumAge: 60000, timeout: 7000 }
        );
      } else {
        await fetchIt(
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
        {loading ? (
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
