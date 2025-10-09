// app/api/my-postings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { jobPostings, findAccountById } from "@/lib/mockdb";

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
  if (!user || user.role !== "employer") {
    return NextResponse.json(
      { error: "Only employers can view postings" },
      { status: 403 }
    );
  }

  // 내가 작성한 공고만 필터링
  const myPostings = jobPostings.filter((jp) => jp.employer_id === user.id);

  return NextResponse.json({ ok: true, postings: myPostings });
}
