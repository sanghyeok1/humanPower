// app/api/ratings/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerAccount } from "@/lib/auth";
import { getRatingById, updateRating, deleteRating } from "@/lib/mockdb";

// GET: 특정 평가 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getServerAccount();
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const rating = getRatingById(id, me.id);

  if (!rating) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ rating });
}

// PUT: 평가 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getServerAccount();
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const updated = updateRating(id, me.id, body);

    if (!updated) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ rating: updated });
  } catch (err) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}

// DELETE: 평가 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getServerAccount();
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = deleteRating(id, me.id);

  if (!deleted) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
