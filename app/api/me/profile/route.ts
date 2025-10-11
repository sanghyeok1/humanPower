// app/api/me/profile/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("hp_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 백엔드 API로 프록시
    const res = await fetch(`${process.env.API_BASE}/api/me/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `hp_token=${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
