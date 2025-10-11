// lib/auth.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { findAccountById } from "./mockdb";

export async function signToken(userId: number) {
  const secret = process.env.AUTH_JWT_SECRET || "dev-secret";
  return jwt.sign({ sub: String(userId), typ: "hp" }, secret, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  const secret = process.env.AUTH_JWT_SECRET || "dev-secret";
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

export type MeAccount = {
  id: number;
  role: string;
  username: string;
  display_name: string;
  phone?: string;
  lat?: number | null;
  lng?: number | null;
};

export async function getServerAccount(): Promise<MeAccount | null> {
  const jar = await cookies();
  const token = jar.get("hp_token")?.value;
  if (!token) return null;

  try {
    // 백엔드 API를 호출하여 사용자 정보 가져오기
    const res = await fetch(`${process.env.API_BASE}/api/auth/me`, {
      headers: {
        'Cookie': `hp_token=${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    const user = data.user;

    if (!user) return null;

    return {
      id: user.id,
      role: user.role,
      username: user.username,
      display_name: user.display_name,
      phone: user.phone,
      lat: user.lat ?? null,
      lng: user.lng ?? null,
    };
  } catch (error) {
    console.error('Failed to get server account:', error);
    return null;
  }
}
