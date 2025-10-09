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

  const secret = process.env.AUTH_JWT_SECRET || "dev-secret";
  let payload: any;
  try {
    payload = jwt.verify(token, secret);
  } catch {
    payload = jwt.decode(token);
  }
  const sub = payload?.sub;
  const id = Number(sub);
  if (!Number.isFinite(id)) return null;

  const acc = findAccountById(id);
  if (!acc) return null;

  return {
    id: acc.id,
    role: acc.role,
    username: acc.username,
    display_name: acc.display_name,
    phone: acc.phone,
    lat: acc.lat ?? null,
    lng: acc.lng ?? null,
  };
}
