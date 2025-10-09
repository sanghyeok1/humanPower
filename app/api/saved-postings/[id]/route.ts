// app/api/saved-postings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { savedPostings, findAccountById } from "@/lib/mockdb";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const idx = savedPostings.findIndex((s) => s.id === Number(id));
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 본인 것만 삭제 가능
  if (savedPostings[idx].seeker_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  savedPostings.splice(idx, 1);

  return NextResponse.json({ ok: true });
}
