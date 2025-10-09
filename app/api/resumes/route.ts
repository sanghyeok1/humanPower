// app/api/resumes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getResumesBySeekerId, createResume } from "@/lib/mockdb";

// GET: 내 이력서 목록 조회
export async function GET(req: NextRequest) {
  const token = req.cookies.get("hp_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === "string") {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = Number((decoded as any).sub);
  const resumes = getResumesBySeekerId(userId);

  return NextResponse.json({ ok: true, resumes });
}

// POST: 새 이력서 생성
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
  const body = await req.json();

  try {
    const newResume = createResume({
      seeker_id: userId,
      title: body.title,
      name: body.name,
      phone: body.phone,
      main_category: body.main_category,
      skills: body.skills || [],
      experience_years: body.experience_years,
      recent_work_history: body.recent_work_history,
      equipment: body.equipment,
      licenses: body.licenses,
      certificates: body.certificates,
      introduction: body.introduction,
      desired_wage_type: body.desired_wage_type,
      desired_wage_amount: body.desired_wage_amount,
      available_shift: body.available_shift,
      available_start_date: body.available_start_date,
    });

    return NextResponse.json({ ok: true, resume: newResume });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 }
    );
  }
}
