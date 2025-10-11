// app/api/auth/login/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

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

  try {
    // 폼 데이터 읽기
    const { username, password } = await readCreds(req);

    // 백엔드 로그인 API 호출
    const backendRes = await fetch(`${process.env.API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { ok: false, error: "invalid_credentials" },
        { status: 401 }
      );
    }

    // 백엔드에서 설정한 쿠키 가져오기
    const setCookieHeader = backendRes.headers.get('set-cookie');

    // 리다이렉트 응답 생성
    const res = NextResponse.redirect(new URL(returnTo, req.url));

    // 백엔드에서 받은 쿠키를 프론트엔드 응답에 설정
    if (setCookieHeader) {
      res.headers.set('set-cookie', setCookieHeader);
    }

    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405 }
  );
}
