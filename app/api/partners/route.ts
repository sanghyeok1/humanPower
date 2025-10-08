// app/api/partners/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { partners } from "@/lib/mockdb";
import { haversineKm } from "@/lib/geo";

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

  const items = partners
    .map((p) => {
      const km = haversineKm(lat, lng, p.lat, p.lng);
      return { ...p, distanceKm: km };
    })
    .sort((a, b) => a.distanceKm! - b.distanceKm!);

  return NextResponse.json({ items, center: { lat, lng } });
}
