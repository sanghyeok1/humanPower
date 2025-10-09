// app/api/view-history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { viewHistory, findAccountById } from "@/lib/mockdb";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("hp_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === "string") {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = Number((decoded as any).sub);
  const user = findAccountById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  // 내 조회 기록만 필터
  const myHistory = viewHistory.filter((h) => h.seeker_id === user.id);

  return NextResponse.json({ history: myHistory });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("hp_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === "string") {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = Number((decoded as any).sub);
  const user = findAccountById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  // 내 조회 기록 전체 삭제
  const deleteCount = viewHistory.filter((h) => h.seeker_id === user.id).length;

  for (let i = viewHistory.length - 1; i >= 0; i--) {
    if (viewHistory[i].seeker_id === user.id) {
      viewHistory.splice(i, 1);
    }
  }

  return NextResponse.json({ ok: true, deleted: deleteCount });
}
