// app/api/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const jar = await cookies();
    const token = jar.get("hp_token")?.value ?? jar.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "not_logged_in" },
        { status: 401 }
      );
    }

    const secret = process.env.AUTH_JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { ok: false, error: "missing AUTH_JWT_SECRET" },
        { status: 500 }
      );
    }

    const payload = jwt.verify(token, secret) as any;
    const userId = payload?.sub ?? payload?.id;
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "bad_token_payload", payload },
        { status: 401 }
      );
    }

    const base = process.env.API_BASE;
    if (!base) {
      return NextResponse.json(
        { ok: false, error: "missing API_BASE" },
        { status: 500 }
      );
    }

    const r = await fetch(`${base}/accounts/${userId}`, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    // 계정 조회 실패도 그대로 전달
    return NextResponse.json(j, { status: r.status });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "invalid_token", detail: e?.message },
      { status: 401 }
    );
  }
}
