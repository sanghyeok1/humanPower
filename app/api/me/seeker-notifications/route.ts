// app/api/me/seeker-notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { accounts, findAccountById } from "@/lib/mockdb";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("hp_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === "string") {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = Number((decoded as any).sub);
  const acc = findAccountById(userId);
  if (!acc || acc.role !== "seeker") {
    return NextResponse.json({ error: "Not a seeker account" }, { status: 403 });
  }

  const body = await req.json();

  // 구직자 알림 설정 업데이트
  if (!acc.seeker_notifications) {
    acc.seeker_notifications = {};
  }

  acc.seeker_notifications.nearby_postings = body.nearby_postings ?? false;
  acc.seeker_notifications.category_match = body.category_match ?? false;
  acc.seeker_notifications.wage_match = body.wage_match ?? false;

  return NextResponse.json({ ok: true });
}
