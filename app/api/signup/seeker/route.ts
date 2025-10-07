import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const base = process.env.API_BASE;
  if (!base)
    return NextResponse.json(
      { ok: false, error: "missing API_BASE" },
      { status: 500 }
    );

  const r = await fetch(`${base}/auth/signup/seeker`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  return NextResponse.json(j, { status: r.status });
}
