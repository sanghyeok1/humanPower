// app/page.tsx
import { getServerAccount } from "@/lib/auth";
import PartnerBanner from "@/components/PartnerBanner";
import { postings } from "@/lib/mockdb";

export default async function HomePage() {
  const me = await getServerAccount();

  return (
    <main style={{ padding: "16px 0" }}>
      <PartnerBanner account={me} />

      <section
        style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>전체 공고 (최근)</h2>
          <nav style={{ display: "flex", gap: 8 }}>
            <a className="btn" href="/board/cat?cat=rc">
              철근/형틀/콘크리트
            </a>
            <a className="btn" href="/board/cat?cat=int">
              내부마감
            </a>
            <a className="btn" href="/board/cat?cat=mech">
              설비/전기/배관
            </a>
          </nav>
        </header>

        <ul style={{ display: "grid", gap: 8 }}>
          {postings.map((p) => (
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
                  {p.cat === "rc"
                    ? "철근/형틀/콘크리트"
                    : p.cat === "int"
                    ? "내부마감"
                    : "설비/전기/배관"}{" "}
                  · {p.dong}
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
          ))}
        </ul>
      </section>
    </main>
  );
}
