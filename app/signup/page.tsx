// app/signup/page.tsx
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const role =
    sp.role === "employer" ? "구인자" : sp.role === "seeker" ? "구직자" : null;

  return (
    <div style={{ maxWidth: 520, margin: "40px auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>
        {role ? `${role} 회원가입` : "회원가입"}
      </h1>
      <p style={{ color: "#666", marginTop: 6 }}>
        데모 단계: 실제 가입 폼은 이후 단계에서 구현됩니다.
      </p>

      <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
        <a className="btn" href="/signup?role=seeker">
          구직자 회원가입
        </a>
        <a className="btn" href="/signup?role=employer">
          구인자 회원가입
        </a>
      </div>

      <div style={{ marginTop: 16 }}>
        <a className="nav-link" href="/">
          ← 홈으로
        </a>
      </div>
    </div>
  );
}
