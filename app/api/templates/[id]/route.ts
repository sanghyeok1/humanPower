// app/api/templates/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerAccount } from "@/lib/auth";
import { getTemplateById, updateTemplate, deleteTemplate } from "@/lib/mockdb";

// GET: 특정 템플릿 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getServerAccount();
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const template = getTemplateById(id, me.id);

  if (!template) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ template });
}

// PUT: 템플릿 수정
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
    const updated = updateTemplate(id, me.id, body);

    if (!updated) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ template: updated });
  } catch (err) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}

// DELETE: 템플릿 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getServerAccount();
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = deleteTemplate(id, me.id);

  if (!deleted) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
