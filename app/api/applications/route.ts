// app/api/applications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import {
  applications,
  findAccountById,
  getResumeById,
  jobPostings,
  applicants,
} from "@/lib/mockdb";

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
  const user = findAccountById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  // applicants 배열에서 내 지원 내역 가져오기
  const myApplicants = applicants.filter((a) => a.applicant_id === user.id);

  // ApplicationsManager가 기대하는 형식으로 변환
  const myApplications = myApplicants.map((app) => {
    const posting = jobPostings.find((jp) => jp.id === app.posting_id);
    return {
      id: app.id,
      posting_id: app.posting_id,
      posting_title: app.posting_title,
      posting_category: posting ? posting.category : "기타",
      posting_pay: posting ? `${posting.wage_type === "day" ? "일급" : "시급"} ${posting.wage_amount.toLocaleString()}원` : "미정",
      status: app.status as any,
      applied_at: new Date(app.applied_at).toLocaleString("ko-KR"),
      type: "applied" as const,
    };
  });

  return NextResponse.json({ applications: myApplications });
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
  const account = findAccountById(userId);

  if (!account || account.role !== "seeker") {
    return NextResponse.json(
      { error: "Only seekers can apply" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { posting_id, resume_id } = body;

  if (!posting_id || !resume_id) {
    return NextResponse.json(
      { error: "Missing posting_id or resume_id" },
      { status: 400 }
    );
  }

  // 공고 확인
  const posting = jobPostings.find((jp) => jp.id === posting_id);
  if (!posting) {
    return NextResponse.json({ error: "Posting not found" }, { status: 404 });
  }

  // 이력서 확인
  const resume = getResumeById(resume_id);
  if (!resume || resume.seeker_id !== userId) {
    return NextResponse.json(
      { error: "Resume not found or unauthorized" },
      { status: 404 }
    );
  }

  // 이미 지원했는지 확인
  const alreadyApplied = applicants.find(
    (a) => a.posting_id === posting_id && a.applicant_id === userId
  );

  if (alreadyApplied) {
    return NextResponse.json(
      { error: "Already applied to this posting" },
      { status: 400 }
    );
  }

  // 지원자 추가
  const newApplicant = {
    id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    posting_id: posting_id,
    posting_title: posting.title,
    employer_id: posting.employer_id,
    applicant_id: userId,
    applicant_name: resume.name,
    applicant_phone: resume.phone,
    resume_id: resume_id,
    status: "applied" as const,
    applied_at: new Date().toISOString(),
    notes: `이력서: ${resume.title}`,
  };

  applicants.push(newApplicant);

  return NextResponse.json({
    ok: true,
    application: newApplicant,
  });
}
