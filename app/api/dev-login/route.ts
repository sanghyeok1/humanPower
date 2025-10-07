// app/api/dev-login/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { userId } = await req.json().catch(() => ({}));
  const uid = Number.isFinite(Number(userId)) ? Number(userId) : 1;

  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "missing AUTH_JWT_SECRET" },
      { status: 500 }
    );
  }

  const token = jwt.sign({ sub: uid, typ: "hp" }, secret, { expiresIn: "7d" });

  const res = NextResponse.json({ ok: true, userId: uid });
  res.cookies.set("hp_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
