// app/api/me/notifications/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerAccount } from "@/lib/auth";
import { updateNotificationSettings } from "@/lib/mockdb";

// POST: 알림 설정 업데이트
export async function POST(req: NextRequest) {
  const me = await getServerAccount();
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { new_applicant, new_message, deadline_reminder } = body;

    const updated = updateNotificationSettings(me.id, {
      new_applicant,
      new_message,
      deadline_reminder,
    });

    if (!updated) {
      return NextResponse.json({ error: "update_failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, notifications: updated.notifications });
  } catch (err) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
