// app/api/me/profile/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerAccount } from "@/lib/auth";
import { updateAccountProfile } from "@/lib/mockdb";

export async function POST(req: NextRequest) {
  const me = await getServerAccount();
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      display_name,
      phone,
      company_name,
      contact_method,
      radius_km,
      preferred_categories,
    } = body;

    const updated = updateAccountProfile(me.id, {
      display_name,
      phone,
      company_name,
      contact_method,
      radius_km: radius_km ? Number(radius_km) : undefined,
      preferred_categories,
    });

    if (!updated) {
      return NextResponse.json({ error: "update_failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, account: updated });
  } catch (err) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
