// app/api/templates/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerAccount } from "@/lib/auth";
import { getTemplatesByUserId, createTemplate } from "@/lib/mockdb";

// GET: 내 템플릿 목록
export async function GET(req: NextRequest) {
  const me = await getServerAccount();
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const templates = getTemplatesByUserId(me.id);
  return NextResponse.json({ templates });
}

// POST: 새 템플릿 생성
export async function POST(req: NextRequest) {
  const me = await getServerAccount();
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const newTemplate = createTemplate({
      user_id: me.id,
      ...body,
    });

    return NextResponse.json({ template: newTemplate });
  } catch (err) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
