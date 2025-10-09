// app/api/postings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { POSTINGS } from "@/data/postings";
import type { CategorySlug } from "@/types";
import { verifyToken } from "@/lib/auth";
import { jobPostings, findAccountById } from "@/lib/mockdb";
import type { JobPosting } from "@/lib/mockdb";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") as CategorySlug | null;
  const items = category
    ? POSTINGS.filter((p) => p.category === category)
    : POSTINGS;
  return NextResponse.json({ items });
}

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
  const user = findAccountById(userId);
  if (!user || user.role !== "employer") {
    return NextResponse.json(
      { error: "Only employers can create job postings" },
      { status: 403 }
    );
  }

  const body = await req.json();

  // 새 공고 생성
  const newId = `jp${Date.now()}`;
  const now = new Date().toISOString();

  const newPosting: JobPosting = {
    id: newId,
    employer_id: user.id,
    title: body.title,
    category: body.category,
    start_date: body.start_date,
    duration_days: body.duration_days,
    estimated_end_date: body.estimated_end_date,
    shift_type: body.shift_type,
    work_hours: body.work_hours,
    wage_type: body.wage_type,
    wage_amount: body.wage_amount,
    wage_notes: body.wage_notes,
    address_dong: body.address_dong,
    address_detail: body.address_detail,
    lat: body.lat,
    lng: body.lng,
    required_positions: body.required_positions,
    contact_name: body.contact_name,
    contact_phone: body.contact_phone,
    contact_hours: body.contact_hours,
    meal_provided: body.meal_provided,
    lodging_provided: body.lodging_provided,
    equipment_provided: body.equipment_provided,
    preferred_experience_years: body.preferred_experience_years,
    preferred_certificates: body.preferred_certificates,
    preferred_driver_license: body.preferred_driver_license,
    site_photos: body.site_photos,
    additional_notes: body.additional_notes,
    deadline: body.deadline,
    payment_method: body.payment_method,
    template_name: body.template_name,
    created_at: now,
    updated_at: now,
  };

  jobPostings.push(newPosting);

  return NextResponse.json({ ok: true, posting_id: newId });
}
