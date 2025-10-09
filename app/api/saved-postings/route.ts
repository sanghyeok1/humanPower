// app/api/saved-postings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { savedPostings, findAccountById, jobPostings } from "@/lib/mockdb";

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

  // 내 찜 목록만 필터
  const mySaved = savedPostings.filter((s) => s.seeker_id === user.id);

  return NextResponse.json({ saved: mySaved });
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
      { error: "Only seekers can save postings" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { posting_id, action } = body;

  if (!posting_id || !action) {
    return NextResponse.json(
      { error: "Missing posting_id or action" },
      { status: 400 }
    );
  }

  // Find the posting
  const posting = jobPostings.find((p) => p.id === posting_id);
  if (!posting) {
    return NextResponse.json({ error: "Posting not found" }, { status: 404 });
  }

  if (action === "save") {
    // Check if already saved
    const alreadySaved = savedPostings.find(
      (s) => s.seeker_id === userId && s.posting_id === posting_id
    );

    if (!alreadySaved) {
      const newSaved = {
        id: savedPostings.length + 1,
        seeker_id: userId,
        posting_id: posting_id,
        posting_title: posting.title,
        posting_category: posting.category,
        posting_pay: `${posting.wage_type === "day" ? "일급" : "시급"} ${posting.wage_amount.toLocaleString()}원`,
        posting_start_date: posting.start_date,
        saved_at: new Date().toISOString(),
      };
      savedPostings.push(newSaved);
    }

    return NextResponse.json({ ok: true, saved: true });
  } else if (action === "unsave") {
    // Remove from saved postings
    const index = savedPostings.findIndex(
      (s) => s.seeker_id === userId && s.posting_id === posting_id
    );

    if (index !== -1) {
      savedPostings.splice(index, 1);
    }

    return NextResponse.json({ ok: true, saved: false });
  } else {
    return NextResponse.json(
      { error: "Invalid action. Use 'save' or 'unsave'" },
      { status: 400 }
    );
  }
}
