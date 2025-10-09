// app/api/resumes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getResumeById, updateResume, deleteResume } from "@/lib/mockdb";

// GET: 특정 이력서 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const resume = getResumeById(id);

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, resume });
}

// PUT: 이력서 수정
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
  const { id } = await params;
  const body = await req.json();

  const updated = updateResume(id, userId, body);
  if (!updated) {
    return NextResponse.json(
      { error: "Resume not found or unauthorized" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, resume: updated });
}

// DELETE: 이력서 삭제
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
  const { id } = await params;

  const success = deleteResume(id, userId);
  if (!success) {
    return NextResponse.json(
      { error: "Resume not found or unauthorized" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
