// lib/auth.ts
import { cookies } from "next/headers";

/** JWT(auth_token) 또는 데모 쿠키가 있으면 로그인으로 간주 */
export async function isLoggedIn(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get("auth_token")?.value; // 실제 로그인(JWT)
  const demo = jar.get("demo_login")?.value === "1"; // 데모 로그인(기존)
  return !!token || demo;
}

/** UI/권한 체크 용도: 'employer' | 'seeker' | null */
export async function currentRole(): Promise<string | null> {
  const jar = await cookies();
  return jar.get("auth_role")?.value ?? null;
}
