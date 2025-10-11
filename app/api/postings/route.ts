// app/api/postings/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // 백엔드에서 공고 목록 가져오기
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    let backendUrl = `${process.env.API_BASE}/api/postings`;
    if (category) {
      backendUrl += `?category=${category}`;
    }

    const res = await fetch(backendUrl, {
      cache: 'no-store'
    });

    if (!res.ok) {
      return NextResponse.json({ items: [] });
    }

    const data = await res.json();
    return NextResponse.json({ items: data.postings || [] });
  } catch (error) {
    console.error('Failed to fetch postings:', error);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("hp_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 백엔드 API로 공고 생성 요청
    const res = await fetch(`${process.env.API_BASE}/api/postings`, {
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
  } catch (error) {
    console.error('Failed to create posting:', error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
