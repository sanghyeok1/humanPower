import { NextRequest, NextResponse } from "next/server";
import { haversineKm } from "@/lib/geo";
import type { Partner, PartnerWithDistance } from "@/types";

const DEFAULT_CENTER = { lat: 37.503, lng: 126.766 }; // 부천시청 근처(대략)

// 데모용 파트너 데이터(실서비스에서는 DB 조회)
const PARTNERS: Partner[] = [
  {
    id: "p1",
    name: "부천 공구마트 춘의점",
    lat: 37.5039,
    lng: 126.7756,
    logoUrl: "https://dummyimage.com/120x120/efefef/333&text=TOOLS",
    linkUrl: "https://example.com/p1",
    address: "부천시 춘의동",
    tags: ["공구", "소모품", "주차"],
  },
  {
    id: "p2",
    name: "신중 자재상",
    lat: 37.5053,
    lng: 126.7631,
    logoUrl: "https://dummyimage.com/120x120/efefef/333&text=SUPPLY",
    linkUrl: "https://example.com/p2",
    address: "부천시 신중동",
    tags: ["자재", "당일배송"],
  },
  {
    id: "p3",
    name: "부천 렌탈 설비센터",
    lat: 37.4938,
    lng: 126.7761,
    logoUrl: "https://dummyimage.com/120x120/efefef/333&text=RENTAL",
    linkUrl: "https://example.com/p3",
    address: "부천시 중동",
    tags: ["장비대여", "야간"],
  },
  {
    id: "p4",
    name: "현장 식당(식대 제휴)",
    lat: 37.4985,
    lng: 126.7675,
    logoUrl: "https://dummyimage.com/120x120/efefef/333&text=MEAL",
    linkUrl: "https://example.com/p4",
    address: "부천시 중동",
    tags: ["식대제공", "단체예약"],
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "NaN");
  const lng = parseFloat(searchParams.get("lng") ?? "NaN");
  const center = isNaN(lat) || isNaN(lng) ? DEFAULT_CENTER : { lat, lng };

  const withDist: PartnerWithDistance[] = PARTNERS.map((p) => ({
    ...p,
    distanceKm: haversineKm(center.lat, center.lng, p.lat, p.lng),
  }))
    .filter((p) => p.distanceKm <= 10) // 반경 10km 이내
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 5);

  return NextResponse.json({ items: withDist, center });
}
