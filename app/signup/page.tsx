// app/signup/page.tsx
import Link from "next/link";

export default function SignupIndexPage() {
  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>회원가입</h1>
      <p style={{ color: "#666", marginTop: 6 }}>가입 유형을 선택해 주세요.</p>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <Link
          href="/signup/seeker"
          className="row"
          style={{
            display: "block",
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 16,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <b>구직자 회원가입</b>
          <div style={{ color: "#666", marginTop: 4 }}>
            부천 동 단위 일감 탐색 · 빠른 지원
          </div>
        </Link>

        <Link
          href="/signup/employer"
          className="row"
          style={{
            display: "block",
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 16,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <b>구인자 회원가입</b>
          <div style={{ color: "#666", marginTop: 4 }}>
            동단위 공고 등록 · 파트너 네트워크
          </div>
        </Link>
      </div>
    </main>
  );
}
