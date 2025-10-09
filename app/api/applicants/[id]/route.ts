// app/api/applicants/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerAccount } from "@/lib/auth";
import {
  updateApplicantStatus,
  updateApplicantNotes,
  addCallLog,
  toggleApplicantFavorite,
  toggleApplicantBlacklist,
} from "@/lib/mockdb";

// PUT: 지원자 상태/정보 업데이트
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
    const { action, status, notes, call_log } = body;

    let updated = null;

    if (action === "update_status" && status) {
      updated = updateApplicantStatus(id, me.id, status);
    } else if (action === "update_notes" && notes !== undefined) {
      updated = updateApplicantNotes(id, me.id, notes);
    } else if (action === "add_call_log" && call_log) {
      updated = addCallLog(id, me.id, call_log);
    } else if (action === "toggle_favorite") {
      updated = toggleApplicantFavorite(id, me.id);
    } else if (action === "toggle_blacklist") {
      updated = toggleApplicantBlacklist(id, me.id);
    } else {
      return NextResponse.json({ error: "invalid_action" }, { status: 400 });
    }

    if (!updated) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ applicant: updated });
  } catch (err) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
