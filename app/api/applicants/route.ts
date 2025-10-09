// app/api/applicants/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerAccount } from "@/lib/auth";
import {
  getApplicantsByEmployerId,
  getFavoriteApplicants,
  getBlacklistApplicants,
} from "@/lib/mockdb";

// GET: 내 지원자 목록
export async function GET(req: NextRequest) {
  const me = await getServerAccount();
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter");

  let applicants;
  if (filter === "favorites") {
    applicants = getFavoriteApplicants(me.id);
  } else if (filter === "blacklist") {
    applicants = getBlacklistApplicants(me.id);
  } else {
    applicants = getApplicantsByEmployerId(me.id);
  }

  // 상태별 필터
  const status = searchParams.get("status");
  if (status && status !== "all") {
    applicants = applicants.filter((a) => a.status === status);
  }

  return NextResponse.json({ applicants });
}
