// app/page.tsx
import Link from "next/link";
import { postings, jobPostings } from "@/lib/mockdb";
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
function categoryToCat(category: CategorySlug): Cat {
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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: Cat; dong?: string; when?: When; page?: string }>;
}) {
  const sp = await searchParams;
  const me = await getServerAccount();

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

  // 기존 postings 필터
  const filteredOldPostings = postings.filter(
    (p) =>
      (cat === "all" || p.cat === cat) &&
      (dong === "전체" || p.dong === dong) &&
      (targetDate ? p.startDate === targetDate : true)
  );

  // jobPostings를 postings 형식으로 변환 및 필터
  const convertedJobPostings = jobPostings
    .filter((jp) => {
      const jpCat = categoryToCat(jp.category);
      return (
        (cat === "all" || jpCat === cat) &&
        (dong === "전체" || jp.address_dong === dong) &&
        (targetDate ? jp.start_date === targetDate : true)
      );
    })
    .map((jp) => ({
      id: jp.id,
      cat: categoryToCat(jp.category),
      dong: jp.address_dong,
      title: jp.title,
      pay: formatWage(jp.wage_type, jp.wage_amount, jp.wage_notes),
      startDate: jp.start_date,
      createdAt: jp.created_at,
      summary: jp.required_positions,
      employer_id: jp.employer_id, // 추가: 작성자 ID
    }));

  // 두 배열 합치기 (최신순 정렬)
  const allPosts = [...filteredOldPostings, ...convertedJobPostings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
