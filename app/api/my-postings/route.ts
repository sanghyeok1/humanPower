// app/api/my-postings/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("hp_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 백엔드 API에 토큰을 전달하여 내 공고 조회
    const res = await fetch(`${process.env.API_BASE}/api/my-postings`, {
      headers: {
        'Cookie': `hp_token=${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch postings" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, postings: data.postings || [] });
  } catch (error) {
    console.error('Failed to fetch my postings:', error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
