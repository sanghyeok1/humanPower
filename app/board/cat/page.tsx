// app/board/[cat]/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CATEGORY_LABELS, type CategorySlug } from "@/types";
import { POSTINGS } from "@/data/postings";

const PAGE_SIZE = 10;
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: { cat: string };
  // Next 15: searchParams는 Promise로 받고 await
  searchParams: Promise<{ page?: string }>;
}) {
  const cat = params.cat as CategorySlug;
  if (!(cat in CATEGORY_LABELS)) notFound();

  const sp = await searchParams;
  const jar = await cookies();
  const isLoggedIn = jar.get("demo_login")?.value === "1";

  const all = POSTINGS.filter((p) => p.category === cat).sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
  );

  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const page = clamp(parseInt(sp.page ?? "1", 10) || 1, 1, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const items = all.slice(start, start + PAGE_SIZE);

  const buildUrl = (p: number) => `/board/${cat}?page=${p}`;

  return (
    <div>
      <h1 className="page-title">{CATEGORY_LABELS[cat]} 게시판</h1>

      <ul className="posting-list">
        {items.map((p) => {
          const target = `/post/${p.id}`;
          const href = isLoggedIn
            ? target
            : `/login?returnTo=${encodeURIComponent(target)}`;
          return (
            <li key={p.id} className="posting-item">
              <Link href={href}>
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
              </Link>
            </li>
          );
        })}
      </ul>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <nav
          className="pagination"
          aria-label="Pagination"
          style={{ marginTop: 12 }}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildUrl(p)}
              className={`page-btn ${p === page ? "page-btn--active" : ""}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
