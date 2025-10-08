// app/api/me/location/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { setAccountLocation, findAccountById } from "@/lib/mockdb";

// 쿠키에서 userId 읽기
async function getUserIdFromCookie(): Promise<number | null> {
  const jar = await cookies();
  const token = jar.get("hp_token")?.value;
  if (!token) return null;
  const secret = process.env.AUTH_JWT_SECRET || "dev-secret";
  let payload: any;
  try {
    payload = jwt.verify(token, secret);
  } catch {
    payload = jwt.decode(token);
  }
  const sub = payload?.sub ?? payload?.id;
  const id = Number(sub);
  return Number.isFinite(id) ? id : null;
}

// 현재 값 확인 (GET)
export async function GET() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "not_logged_in" },
      { status: 401 }
    );
  }
  const me = findAccountById(userId);
  if (!me) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 }
    );
  }
  return NextResponse.json({
    ok: true,
    lat: me.lat ?? null,
    lng: me.lng ?? null,
  });
}

// 위치 저장 (POST { lat, lng })
export async function POST(req: Request) {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "not_logged_in" },
      { status: 401 }
    );
  }
  const body = await req.json().catch(() => ({} as any));
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { ok: false, error: "bad_coords" },
      { status: 400 }
    );
  }
  const updated = setAccountLocation(userId, lat, lng);
  if (!updated) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 }
    );
  }
  return NextResponse.json({
    ok: true,
    account: { id: updated.id, lat: updated.lat, lng: updated.lng },
  });
}
