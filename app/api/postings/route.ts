// app/api/postings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { POSTINGS } from "@/data/postings";
import type { CategorySlug } from "@/types";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") as CategorySlug | null;
  const items = category
    ? POSTINGS.filter((p) => p.category === category)
    : POSTINGS;
  return NextResponse.json({ items });
}
