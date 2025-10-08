// app/login/page.tsx
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const sp = await searchParams;
  const returnTo = sp?.returnTo ?? "/";
  const action = `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <main
      style={{
        maxWidth: 520,
        margin: "32px auto",
        padding: 16,
        display: "grid",
        gap: 16,
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>로그인</h1>
      <form method="POST" action={action} style={{ display: "grid", gap: 12 }}>
        <label>
          아이디
          <input
            className="input"
            name="username"
            required
            autoComplete="username"
          />
        </label>
        <label>
          비밀번호
          <input
            className="input"
            type="password"
            name="password"
            required
            autoComplete="current-password"
          />
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" type="submit">
            로그인
          </button>
          <a className="btn" href="/signup/seeker">
            회원가입
          </a>
        </div>
      </form>
    </main>
  );
}
