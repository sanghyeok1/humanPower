import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username } = await req.json().catch(() => ({}));
  if (!username)
    return NextResponse.json(
      { ok: false, error: "missing_username" },
      { status: 400 }
    );

  const okFormat = /^[a-z0-9_]{3,20}$/.test(username);
  if (!okFormat) {
    return NextResponse.json({
      ok: true,
      available: false,
      reason: "invalid_format",
    });
  }

  // 데모: 이미 사용 중인 아이디 목록(나중에 DB 조회로 교체)
  const taken = ["admin", "test", "seeker01", "employer01"];
  const available = !taken.includes(username.toLowerCase());

  return NextResponse.json({ ok: true, available });
}
