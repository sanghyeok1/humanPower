import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function normalizePhone(p: string) {
  return String(p || "").replace(/\D/g, "");
}

export async function POST(req: Request) {
  const { phone, code } = await req.json().catch(() => ({}));
  const ph = normalizePhone(phone);
  const jar = await cookies();
  const pv = jar.get("pv")?.value;

  if (!pv)
    return NextResponse.json(
      { verified: false, error: "no_request" },
      { status: 400 }
    );

  try {
    const raw = Buffer.from(pv, "base64").toString("utf8");
    const data = JSON.parse(raw) as {
      phone: string;
      code: string;
      exp: number;
    };
    if (Date.now() > data.exp) {
      return NextResponse.json(
        { verified: false, error: "expired" },
        { status: 400 }
      );
    }
    if (normalizePhone(data.phone) !== ph) {
      return NextResponse.json(
        { verified: false, error: "phone_mismatch" },
        { status: 400 }
      );
    }
    if (String(data.code) !== String(code)) {
      return NextResponse.json(
        { verified: false, error: "invalid_code" },
        { status: 400 }
      );
    }

    const resp = NextResponse.json({ verified: true });
    // 인증 완료 표식(선택): 이후 가입 API에서 확인용
    resp.cookies.set("pv_ok", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60,
    });
    return resp;
  } catch {
    return NextResponse.json(
      { verified: false, error: "bad_cookie" },
      { status: 400 }
    );
  }
}
