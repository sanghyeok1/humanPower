// app/api/auth/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const base = process.env.API_BASE;
  if (!base)
    return NextResponse.json(
      { ok: false, error: "missing API_BASE" },
      { status: 500 }
    );

  const r = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j?.ok || !j?.token) {
    return NextResponse.json(j, { status: r.status });
  }

  const res = NextResponse.json({ ok: true, user: j.user });
  // 로그인 쿠키 발급 (Next 도메인 기준)
  res.cookies.set("hp_token", j.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
