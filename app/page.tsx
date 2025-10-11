// app/page.tsx
import Link from "next/link";
import { CATEGORY_LABELS } from "@/types";
import type { CategorySlug } from "@/types";
import { getServerAccount } from "@/lib/auth";
import PostingActions from "@/components/PostingActions";

type Cat = "all" | "rc" | "int" | "mech";
type When = "all" | "today" | "plus2" | "plus3";

function catLabel(cat: Cat) {
  return cat === "rc"
    ? "철근/형틀/콘크리트"
    : cat === "int"
    ? "내부마감"
    : cat === "mech"
    ? "설비/전기/배관"
    : "전체";
}

function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

// CategorySlug를 Cat으로 변환
function categoryToCat(category: string): Cat {
  if (category === "rebar_form_concrete") return "rc";
  if (category === "interior_finish") return "int";
  if (category === "mep") return "mech";
  return "rc";
}

// 임금 포맷팅
function formatWage(type: string, amount: number, notes?: string): string {
  const typeLabel = type === "day" ? "일급" : type === "hour" ? "시급" : "월급";
  const formatted = `${typeLabel} ${amount.toLocaleString()}원`;
  return notes ? `${formatted} (${notes})` : formatted;
}

// 백엔드에서 공고 데이터 가져오기
async function fetchPostings() {
  try {
    const res = await fetch(`${process.env.API_BASE}/api/postings`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.postings || [];
  } catch (error) {
    console.error('Failed to fetch postings:', error);
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: Cat; dong?: string; when?: When; page?: string }>;
}) {
  const sp = await searchParams;
  const me = await getServerAccount();

  // 백엔드에서 공고 데이터 가져오기
  const postings = await fetchPostings();

  const cat: Cat = (sp?.cat ?? "all") as Cat;
  const dong = sp?.dong ?? "전체";
  const when: When = (sp?.when ?? "all") as When;
  const page = Number(sp?.page ?? "1");

  // 날짜 계산
  const now = new Date();
  const d0 = new Date(now);
  const d2 = new Date(now);
  d2.setDate(d2.getDate() + 2);
  const d3 = new Date(now);
  d3.setDate(d3.getDate() + 3);

  const targetDate =
    when === "today"
      ? fmt(d0)
      : when === "plus2"
      ? fmt(d2)
      : when === "plus3"
      ? fmt(d3)
      : null;

  // 백엔드에서 가져온 공고를 필터링 및 변환
  const allPosts = postings
    .filter((p: any) => {
      const pCat = categoryToCat(p.category);
      const pDong = p.dong || "전체";
      const pStartDate = p.start_date ? fmt(new Date(p.start_date)) : null;

      return (
        (cat === "all" || pCat === cat) &&
        (dong === "전체" || pDong === dong) &&
        (targetDate ? pStartDate === targetDate : true)
      );
    })
    .map((p: any) => ({
      id: p.id,
      cat: categoryToCat(p.category),
      dong: p.dong || "전체",
      title: p.title,
      pay: formatWage(p.wage_type, p.wage_amount),
      startDate: p.start_date ? fmt(new Date(p.start_date)) : "",
      createdAt: p.created_at,
      summary: p.content || "",
    }))
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 페이지네이션
  const perPage = 10;
  const totalPages = Math.ceil(allPosts.length / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  const startIdx = (currentPage - 1) * perPage;
  const items = allPosts.slice(startIdx, startIdx + perPage);

  // 탭 목록
  const catTabs: { key: Cat; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "rc", label: "철근/형틀/콘크리트" },
    { key: "int", label: "내부마감" },
    { key: "mech", label: "설비/전기/배관" },
  ];
  const dongTabs = ["전체", "춘의동", "신중동", "중동", "원미동", "소사동"];
  const whenTabs: { key: When; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "today", label: "당일" },
    { key: "plus2", label: "2일후" },
    { key: "plus3", label: "3일후" },
  ];

  // URL builder
  const buildUrl = (next: Partial<{ cat: Cat; dong: string; when: When; page: number }>) => {
    const c = encodeURIComponent(next.cat ?? cat);
    const d = encodeURIComponent(next.dong ?? dong);
    const w = encodeURIComponent(next.when ?? when);
    const p = next.page ?? currentPage;
    return `/?cat=${c}&dong=${d}&when=${w}&page=${p}`;
  };

  return (
    <main className="page">
      <section className="board">
        <div className="board__header">
          <h2>{catLabel(cat)}</h2>
          <span className="count">총 {allPosts.length}건</span>
        </div>

        {/* 1단: 카테고리 */}
        <div className="tabs">
          {catTabs.map((t) => (
            <Link
              key={t.key}
              href={buildUrl({ cat: t.key })}
              className={`tab ${t.key === cat ? "active" : ""}`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* 2단: 동(지역) */}
        <div className="tabs subtle">
          {dongTabs.map((d) => (
            <Link
              key={d}
              href={buildUrl({ dong: d })}
              className={`chip ${d === dong ? "active" : ""}`}
            >
              {d}
            </Link>
          ))}
        </div>

        {/* 3단: 날짜 */}
        <div className="tabs subtle">
          {whenTabs.map((w) => (
            <Link
              key={w.key}
              href={buildUrl({ when: w.key })}
              className={`chip ${w.key === when ? "active" : ""}`}
            >
              {w.label}
            </Link>
          ))}
        </div>

        {/* 목록 */}
        <ul className="post-list">
          {items.length === 0 ? (
            <li className="post-empty">조건에 맞는 공고가 없습니다.</li>
          ) : (
            items.map((p) => (
              <li key={p.id} className="post-item">
                <Link href={`/post/${p.id}`} className="post-link">
                  <div className="post-meta">
                    {catLabel(p.cat as Cat)} · {p.dong} · 시작일 {p.startDate}
                  </div>
                  <div className="post-title">{p.title}</div>
                  <div className="post-desc">
                    {p.pay}
                    {p.summary ? ` · ${p.summary}` : ""}
                  </div>
                </Link>
                {me && me.role === "employer" && (p as any).employer_id === me.id && (
                  <PostingActions postingId={p.id} />
                )}
              </li>
            ))
          )}
        </ul>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="pagination" style={{ marginTop: 20 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildUrl({ page: p })}
                className={`page-btn ${p === currentPage ? "page-btn--active" : ""}`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
