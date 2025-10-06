// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

/**
 * 로그아웃: 인증 쿠키 제거 후 홈으로 리다이렉트(303 See Other)
 * 폼(action="/api/auth/logout" method="post")으로 호출해도
 * JSON 페이지가 뜨지 않고 / 로 돌아갑니다.
 */
export async function POST(req: Request) {
  // 리다이렉트 응답 생성 (현재 요청 기준으로 / 로)
  const resp = NextResponse.redirect(new URL("/", req.url), { status: 303 });

  // 쿠키 무효화
  resp.cookies.set("auth_token", "", { path: "/", maxAge: 0 });
  resp.cookies.set("auth_role", "", { path: "/", maxAge: 0 });
  // 데모 로그인 쿠키도 함께 정리(있다면)
  resp.cookies.set("demo_login", "", { path: "/", maxAge: 0 });

  return resp;
}
