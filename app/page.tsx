// app/page.tsx
import { getServerAccount } from "@/lib/auth";
import { postings } from "@/lib/mockdb";

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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: Cat; dong?: string; when?: When }>;
}) {
  const sp = await searchParams;

  const cat: Cat = (sp?.cat ?? "all") as Cat;
  const dong = sp?.dong ?? "전체";
  const when: When = (sp?.when ?? "all") as When;

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

  // 필터 적용
  const items = postings.filter(
    (p) =>
      (cat === "all" || p.cat === cat) &&
      (dong === "전체" || p.dong === dong) &&
      (targetDate ? p.startDate === targetDate : true)
  );

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
  const buildUrl = (next: Partial<{ cat: Cat; dong: string; when: When }>) => {
    const c = encodeURIComponent(next.cat ?? cat);
    const d = encodeURIComponent(next.dong ?? dong);
    const w = encodeURIComponent(next.when ?? when);
    return `/?cat=${c}&dong=${d}&when=${w}`;
  };

  return (
    <main className="page">
      <section className="board">
        <div className="board__header">
          <h2>{catLabel(cat)}</h2>
          <span className="count">총 {items.length}건</span>
        </div>

        {/* 1단: 카테고리 */}
        <div className="tabs">
          {catTabs.map((t) => (
            <a
              key={t.key}
              href={buildUrl({ cat: t.key })}
              className={`tab ${t.key === cat ? "active" : ""}`}
            >
              {t.label}
            </a>
          ))}
        </div>

        {/* 2단: 동(지역) */}
        <div className="tabs subtle">
          {dongTabs.map((d) => (
            <a
              key={d}
              href={buildUrl({ dong: d })}
              className={`chip ${d === dong ? "active" : ""}`}
            >
              {d}
            </a>
          ))}
        </div>

        {/* 3단: 날짜 */}
        <div className="tabs subtle">
          {whenTabs.map((w) => (
            <a
              key={w.key}
              href={buildUrl({ when: w.key })}
              className={`chip ${w.key === when ? "active" : ""}`}
            >
              {w.label}
            </a>
          ))}
        </div>

        {/* 목록 */}
        <ul className="post-list">
          {items.length === 0 ? (
            <li className="post-empty">조건에 맞는 공고가 없습니다.</li>
          ) : (
            items.map((p) => (
              <li key={p.id} className="post-item">
                <a href={`/post/${p.id}`} className="post-link">
                  <div className="post-meta">
                    {catLabel(p.cat as Cat)} · {p.dong} · 시작일 {p.startDate}
                  </div>
                  <div className="post-title">{p.title}</div>
                  <div className="post-desc">
                    {p.pay}
                    {p.summary ? ` · ${p.summary}` : ""}
                  </div>
                </a>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
