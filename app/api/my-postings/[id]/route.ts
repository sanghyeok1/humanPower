// app/api/my-postings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { jobPostings, findAccountById, updateJobPosting, deleteJobPosting } from "@/lib/mockdb";

// GET: 공고 상세 조회
export async function GET(
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
  if (!user || user.role !== "employer") {
    return NextResponse.json(
      { error: "Only employers can view postings" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const posting = jobPostings.find((p) => p.id === id && p.employer_id === userId);

  if (!posting) {
    return NextResponse.json({ error: "Posting not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, posting });
}

// PATCH: 공고 수정
export async function PATCH(
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
  if (!user || user.role !== "employer") {
    return NextResponse.json(
      { error: "Only employers can update postings" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await req.json();

  const updatedPosting = updateJobPosting(id, userId, body);

  if (!updatedPosting) {
    return NextResponse.json({ error: "Posting not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, posting: updatedPosting });
}

// DELETE: 공고 삭제
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
  if (!user || user.role !== "employer") {
    return NextResponse.json(
      { error: "Only employers can delete postings" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const success = deleteJobPosting(id, userId);

  if (!success) {
    return NextResponse.json({ error: "Posting not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
