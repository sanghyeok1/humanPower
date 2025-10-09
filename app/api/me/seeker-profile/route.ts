// app/api/me/seeker-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { accounts, findAccountById } from "@/lib/mockdb";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("hp_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === "string") {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = Number((decoded as any).sub);
  const acc = findAccountById(userId);
  if (!acc || acc.role !== "seeker") {
    return NextResponse.json({ error: "Not a seeker account" }, { status: 403 });
  }

  const body = await req.json();

  // Update seeker-specific fields
  acc.display_name = body.display_name ?? acc.display_name;
  acc.phone = body.phone ?? acc.phone;
  acc.nickname = body.nickname ?? acc.nickname;
  acc.skills = body.skills ?? acc.skills;
  acc.experience_years = body.experience_years ?? acc.experience_years;
  acc.recent_work = body.recent_work ?? acc.recent_work;
  acc.equipment = body.equipment ?? acc.equipment;
  acc.licenses = body.licenses ?? acc.licenses;
  acc.work_hours = body.work_hours ?? acc.work_hours;
  acc.desired_wage_type = body.desired_wage_type ?? acc.desired_wage_type;
  acc.desired_wage_amount = body.desired_wage_amount ?? acc.desired_wage_amount;
  acc.available_immediately = body.available_immediately ?? acc.available_immediately;
  acc.available_from = body.available_from ?? acc.available_from;
  acc.radius_km = body.radius_km ?? acc.radius_km;
  acc.preferred_categories = body.preferred_categories ?? acc.preferred_categories;

  return NextResponse.json({ ok: true, profile_id: acc.id, account: acc });
}
