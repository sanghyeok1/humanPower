// lib/auth.ts
import { cookies } from "next/headers";

export async function isLoggedIn() {
  const jar = await cookies();
  const token = jar.get("auth_token")?.value; // 실로그인(JWT)
  const demo = jar.get("demo_login")?.value === "1"; // 데모 로그인(기존)
  return !!token || demo;
}

export async function currentRole() {
  const jar = await cookies();
  return jar.get("auth_role")?.value ?? null;
}
