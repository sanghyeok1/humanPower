// app/board/cat/page.tsx
export default async function BoardByCat({
  searchParams,
}: {
  searchParams: Promise<{
    cat?: "rc" | "int" | "mech" | "all";
    dong?: string;
    when?: "today" | "tomorrow" | "plus3";
  }>;
}) {
  const sp = await searchParams;
  const cat = (sp?.cat ?? "all") as "rc" | "int" | "mech" | "all";
  const dong = sp?.dong ?? "전체";
  const when = sp?.when ?? "today";

  const { postings } = await import("@/lib/mockdb");

  // 필터
  const now = new Date();
  const yyyy = (d: Date) => d.getFullYear();
  const mm = (d: Date) => String(d.getMonth() + 1).padStart(2, "0");
  const dd = (d: Date) => String(d.getDate()).padStart(2, "0");
  const fmt = (d: Date) => `${yyyy(d)}-${mm(d)}-${dd(d)}`;

  const d0 = new Date(now);
  const d1 = new Date(now);
  d1.setDate(d1.getDate() + 1);
  const d3 = new Date(now);
  d3.setDate(d3.getDate() + 3);

  const targetDate =
    when === "today" ? fmt(d0) : when === "tomorrow" ? fmt(d1) : fmt(d3);

  const items = postings.filter(
    (p) =>
      (cat === "all" || p.cat === cat) &&
      (dong === "전체" || p.dong === dong) &&
      // “당일/내일/3일후”는 시작일과 매칭
      p.startDate === targetDate
  );

  const dongTabs = ["전체", "춘의동", "신중동", "원미동", "소사동"];
  const whenTabs: { key: "today" | "tomorrow" | "plus3"; label: string }[] = [
    { key: "today", label: "당일" },
    { key: "tomorrow", label: "내일" },
    { key: "plus3", label: "3일후" },
  ];

  const catLabel =
    cat === "rc"
      ? "철근/형틀/콘크리트"
      : cat === "int"
      ? "내부마감"
      : cat === "mech"
      ? "설비/전기/배관"
      : "전체";

  const base = `/board/cat?cat=${cat}`;

  return (
    <main style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>{catLabel}</h1>

      {/* 동 탭 */}
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        {dongTabs.map((d) => (
          <a
            key={d}
            className="btn"
            href={`${base}&dong=${encodeURIComponent(d)}&when=${when}`}
            style={{
              background: d === dong ? "#111827" : undefined,
              color: d === dong ? "#fff" : undefined,
            }}
          >
            {d}
          </a>
        ))}
      </div>

      {/* 날짜 탭 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {whenTabs.map((w) => (
          <a
            key={w.key}
            className="btn"
            href={`${base}&dong=${encodeURIComponent(dong)}&when=${w.key}`}
            style={{
              background: w.key === when ? "#111827" : undefined,
              color: w.key === when ? "#fff" : undefined,
            }}
          >
            {w.label}
          </a>
        ))}
      </div>

      <ul style={{ display: "grid", gap: 8 }}>
        {items.length === 0 ? (
          <div style={{ color: "#6b7280" }}>해당 조건의 공고가 없습니다.</div>
        ) : (
          items.map((p) => (
            <li
              key={p.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <a
                href={`/post/${p.id}`}
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div style={{ fontSize: 15, color: "#6b7280" }}>
                  {catLabel} · {p.dong}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, marginTop: 4 }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 14, color: "#374151", marginTop: 2 }}>
                  {p.pay} · 시작일 {p.startDate}
                </div>
                {p.summary && (
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                    {p.summary}
                  </div>
                )}
              </a>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
