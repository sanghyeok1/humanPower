// app/api/partners/route.ts
import { NextResponse } from "next/server";
import { DEFAULT_CENTER } from "@/lib/geo";

export async function GET(req: Request) {
  const devDefault =
    process.env.NODE_ENV !== "production" ? "http://localhost:4000" : undefined;
  const apiBase = process.env.API_BASE ?? devDefault;
  if (!apiBase) {
    return NextResponse.json(
      { items: [], error: "missing API_BASE" },
      { status: 500 }
    );
  }

  const src = new URL(req.url);
  const lat = src.searchParams.get("lat");
  const lng = src.searchParams.get("lng");
  const radius = src.searchParams.get("radius");

  const url = new URL("/partners", apiBase);
  if (lat) url.searchParams.set("lat", lat);
  if (lng) url.searchParams.set("lng", lng);
  if (radius) url.searchParams.set("radius", radius);

  const center =
    lat && lng ? { lat: Number(lat), lng: Number(lng) } : DEFAULT_CENTER;

  try {
    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!res.ok)
      return NextResponse.json(
        { items: [], error: `upstream ${res.status}` },
        { status: res.status }
      );
    const raw = await res.json();

    // ★ 백엔드 snake_case → 프론트 camelCase + km 변환
    const items = Array.isArray(raw.items)
      ? raw.items.map((r: any) => ({
          id: r.id,
          name: r.name,
          address: r.address ?? null,
          lat: r.lat != null ? Number(r.lat) : undefined,
          lng: r.lng != null ? Number(r.lng) : undefined,
          logoUrl: r.logo_url ?? null,
          linkUrl: r.link_url ?? null,
          tags: Array.isArray(r.tags_json) ? r.tags_json : [],
          distanceKm: r.dist_m != null ? Number(r.dist_m) / 1000 : undefined,
        }))
      : [];

    return NextResponse.json({ items, center }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ items: [], error: String(e) }, { status: 500 });
  }
}
