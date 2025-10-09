// app/api/me/completions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { completionRecords, findAccountById } from "@/lib/mockdb";

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

  // 내 완료 기록만 필터
  const myCompletions = completionRecords.filter((c) => c.seeker_id === user.id);

  return NextResponse.json({ completions: myCompletions });
}
