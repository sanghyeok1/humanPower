// app/api/geocode/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") ?? "";
  if (!query) {
    return NextResponse.json({ error: "missing_query" }, { status: 400 });
  }

  const REST = process.env.KAKAO_REST_KEY; // ⭐ 서버 전용 키 (NEXT_PUBLIC 아님)
  if (!REST) {
    return NextResponse.json({ error: "missing_rest_key" }, { status: 500 });
  }

  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
    query
  )}`;

  const r = await fetch(url, {
    headers: { Authorization: `KakaoAK ${REST}` },
    cache: "no-store",
  });

  const j = await r.json().catch(() => ({}));

  if (!r.ok) {
    return NextResponse.json(j, { status: r.status });
  }

  const doc = j?.documents?.[0];
  if (!doc) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    lat: Number(doc.y),
    lng: Number(doc.x),
    address_type: doc.address_type,
    road_address: doc.road_address?.address_name ?? null,
    address: doc.address?.address_name ?? null,
  });
}
