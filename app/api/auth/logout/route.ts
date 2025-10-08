// app/api/auth/logout/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

function clear(res: NextResponse) {
  res.cookies.set("hp_token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
export async function POST() {
  return clear(NextResponse.json({ ok: true }));
}
export async function GET() {
  return clear(NextResponse.json({ ok: true, via: "GET" }));
}
