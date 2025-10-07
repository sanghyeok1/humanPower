import { NextResponse } from "next/server";

function normalizePhone(p: string) {
  return String(p || "").replace(/\D/g, "");
}

export async function POST(req: Request) {
  const { phone } = await req.json().catch(() => ({}));
  const ph = normalizePhone(phone);
  if (ph.length < 10 || ph.length > 11) {
    return NextResponse.json(
      { ok: false, error: "invalid_phone" },
      { status: 400 }
    );
  }

  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6자리
  const payload = { phone: ph, code, exp: Date.now() + 5 * 60 * 1000 }; // 5분
  const base = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");

  // 데모 편의를 위해 서버 콘솔에 코드 출력
  console.log("[PHONE CODE]", ph, code);

  const resp = NextResponse.json({ ok: true });
  resp.cookies.set("pv", base, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 5 * 60,
  });
  return resp;
}
