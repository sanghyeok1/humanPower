// app/api/applications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { applications, findAccountById } from "@/lib/mockdb";

export async function PUT(
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
  const app = applications.find((a) => a.id === Number(id));
  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  // 본인 것만 수정 가능
  if (app.seeker_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // 상태 변경
  if (body.status) {
    app.status = body.status;
  }

  return NextResponse.json({ ok: true, application: app });
}
