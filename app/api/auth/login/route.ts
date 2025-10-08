// app/api/auth/login/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { findAccountByUsername } from "@/lib/mockdb";
import { signToken } from "@/lib/auth";

type Creds = { username: string; password: string };

async function readCreds(req: Request): Promise<Creds> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const j = await req.json().catch(() => ({} as any));
    return {
      username: String(j.username || ""),
      password: String(j.password || ""),
    };
  }
  const fd = await req.formData();
  return {
    username: String(fd.get("username") || ""),
    password: String(fd.get("password") || ""),
  };
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const returnTo = url.searchParams.get("returnTo") || "/";

  const { username, password } = await readCreds(req);
  const acc = findAccountByUsername(username);
  if (!acc || acc.password !== password) {
    return NextResponse.json(
      { ok: false, error: "invalid_credentials" },
      { status: 401 }
    );
  }

  const token = await signToken(acc.id);

  // ★ 같은 응답에서 쿠키 세팅 + 서버 리다이렉트
  const res = NextResponse.redirect(new URL(returnTo, req.url));
  res.cookies.set("hp_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405 }
  );
}
