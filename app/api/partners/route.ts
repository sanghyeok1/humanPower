// app/api/partners/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { haversineKm } from "@/lib/geo";

// 백엔드에서 파트너 데이터 가져오기
async function fetchPartnersFromBackend() {
  try {
    const res = await fetch(`${process.env.API_BASE}/api/partners`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.partners || [];
  } catch (error) {
    console.error('Failed to fetch partners:', error);
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { items: [], error: "bad_coords" },
      { status: 400 }
    );
  }

  // 백엔드에서 파트너 데이터 가져오기
  const partners = await fetchPartnersFromBackend();

  const items = partners
    .map((p: any) => {
      const km = haversineKm(lat, lng, Number(p.lat), Number(p.lng));
      return { ...p, distanceKm: km };
    })
    .filter((p: any) => p.distanceKm <= 5) // 반경 5km 이내만 필터링
    .sort((a: any, b: any) => a.distanceKm! - b.distanceKm!);

  return NextResponse.json({ items, center: { lat, lng } });
}
