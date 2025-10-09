// app/api/geocode/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") ?? "";
  if (!query) {
    return NextResponse.json({ error: "missing_query" }, { status: 400 });
  }

  const REST = process.env.KAKAO_REST_KEY?.trim(); // 서버 전용 REST 키

  // 임시: 카카오 API 키가 없거나 유효하지 않으면 더미 좌표 반환 (부천시 중심)
  if (!REST || REST.startsWith("sdfsdf")) {
    // 부천시 중심 좌표에서 약간 랜덤하게 생성
    const baseLat = 37.503;
    const baseLng = 126.766;
    const randomLat = baseLat + (Math.random() - 0.5) * 0.02;
    const randomLng = baseLng + (Math.random() - 0.5) * 0.02;

    return NextResponse.json({
      lat: Number(randomLat.toFixed(6)),
      lng: Number(randomLng.toFixed(6)),
      address_type: "ROAD_ADDR",
      road_address: query,
      address: query,
      _note: "Using dummy coordinates (KAKAO_REST_KEY not configured)",
    });
  }

  const url =
    "https://dapi.kakao.com/v2/local/search/address.json?query=" +
    encodeURIComponent(query);

  // ▶ 바디는 '한 번만' 읽는다: text → JSON 파싱 시도
  const r = await fetch(url, {
    headers: { Authorization: `KakaoAK ${REST}` },
    cache: "no-store",
  });

  const raw = await r.text(); // 한번만 읽음
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    // JSON이 아니면 data는 null로 두고 raw를 그대로 전달
  }

  if (!r.ok) {
    return NextResponse.json(
      {
        ok: false,
        from: "kakao",
        status: r.status,
        // 카카오가 보낸 에러 본문(JSON이면 data, 아니면 raw문자열)
        body: data ?? raw,
      },
      { status: r.status }
    );
  }

  const doc = data?.documents?.[0];
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
