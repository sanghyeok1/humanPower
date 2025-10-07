// app/api/me/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const jar = await cookies();
    const token = jar.get("hp_token")?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, stage: "cookie", error: "not_logged_in" },
        { status: 401 }
      );
    }

    // 토큰에서 userId 추출 (verify → 실패 시 decode 폴백)
    let userId: string | number | undefined;
    const secret = process.env.AUTH_JWT_SECRET;

    const readPayload = () => {
      try {
        if (secret) return jwt.verify(token, secret) as any;
      } catch (e) {
        // ignore, will fallback to decode
      }
      return jwt.decode(token) as any;
    };

    const payload = readPayload();
    userId = payload?.sub ?? payload?.id;

    if (!userId) {
      return NextResponse.json(
        { ok: false, stage: "jwt", error: "bad_token_payload", payload },
        { status: 401 }
      );
    }

    const base = process.env.API_BASE;
    if (!base) {
      return NextResponse.json(
        { ok: false, stage: "env", error: "missing API_BASE" },
        { status: 500 }
      );
    }

    // 서버로 내 계정 조회
    let r: Response;
    try {
      r = await fetch(`${base}/accounts/${userId}`, { cache: "no-store" });
    } catch (e: any) {
      return NextResponse.json(
        {
          ok: false,
          stage: "fetch",
          error: "server_unreachable",
          detail: e?.message || String(e),
        },
        { status: 502 }
      );
    }

    const text = await r.text();
    let body: any = {};
    try {
      body = JSON.parse(text);
    } catch {
      /* non-JSON */
    }

    // 그대로 중계하되, 상태와 스테이지를 달아줌
    return NextResponse.json(
      {
        ok: r.ok && (body?.ok ?? true),
        stage: "proxy",
        status: r.status,
        raw: text,
        ...body,
      },
      { status: r.status }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        stage: "route",
        error: "me_route_crash",
        detail: e?.message || String(e),
      },
      { status: 500 }
    );
  }
}
