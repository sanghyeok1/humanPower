// app/board/[cat]/page.tsx
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { CATEGORY_LABELS, type CategorySlug } from "@/types";
import { POSTINGS } from "@/data/postings";

export default async function BoardPage({
  params,
}: {
  params: { cat: string };
}) {
  const cat = params.cat as CategorySlug;
  if (!(cat in CATEGORY_LABELS)) notFound();

  const jar = await cookies();
  const isLoggedIn = jar.get("demo_login")?.value === "1";
  if (!isLoggedIn) {
    redirect(`/login?returnTo=${encodeURIComponent(`/board/${cat}`)}`);
  }

  const items = POSTINGS.filter((p) => p.category === cat);

  return (
    <div>
      <h1 className="page-title">{CATEGORY_LABELS[cat]} 게시판</h1>
      <ul className="posting-list">
        {items.map((p) => (
          <li key={p.id} className="posting-item">
            <div className="posting-title">{p.title}</div>
            <div className="posting-meta">
              {p.wage_type === "day"
                ? `일급 ${p.wage_amount.toLocaleString()}원`
                : p.wage_type === "hour"
                ? `시급 ${p.wage_amount.toLocaleString()}원`
                : `월급 ${p.wage_amount.toLocaleString()}원`}
              {" · "}
              {new Date(p.created_at).toLocaleDateString("ko-KR")}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
