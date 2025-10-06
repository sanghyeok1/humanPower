// app/api/partners/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const apiBase = process.env.API_BASE;
  if (!apiBase) {
    return NextResponse.json(
      { items: [], error: "missing API_BASE" },
      { status: 500 }
    );
  }

  const srcUrl = new URL(req.url);
  const lat = srcUrl.searchParams.get("lat") ?? "";
  const lng = srcUrl.searchParams.get("lng") ?? "";
  const radius = srcUrl.searchParams.get("radius") ?? ""; // 선택

  const url = new URL("/partners", apiBase);
  if (lat) url.searchParams.set("lat", lat);
  if (lng) url.searchParams.set("lng", lng);
  if (radius) url.searchParams.set("radius", radius);

  try {
    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      return NextResponse.json(
        { items: [], error: `upstream ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ items: [], error: String(e) }, { status: 500 });
  }
}
