// app/api/ratings/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerAccount } from "@/lib/auth";
import { getRatingsByEmployerId, createRating } from "@/lib/mockdb";

// GET: 내 평가 목록
export async function GET(req: NextRequest) {
  const me = await getServerAccount();
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ratings = getRatingsByEmployerId(me.id);
  return NextResponse.json({ ratings });
}

// POST: 새 평가 생성
export async function POST(req: NextRequest) {
  const me = await getServerAccount();
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const newRating = createRating({
      employer_id: me.id,
      ...body,
    });

    return NextResponse.json({ rating: newRating });
  } catch (err) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
