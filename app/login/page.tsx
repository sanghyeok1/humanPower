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
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          background: "white",
          borderRadius: 16,
          padding: "40px 32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* 로고/제목 */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 8,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            바로일감
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            부천 동 단위 일자리 플랫폼
          </p>
        </div>

        <form method="POST" action={action} style={{ display: "grid", gap: 16 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 8,
                color: "#374151",
              }}
            >
              아이디
            </label>
            <input
              className="input"
              name="username"
              required
              autoComplete="username"
              placeholder="아이디를 입력하세요"
              style={{
                fontSize: 16,
                padding: "12px 16px",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 8,
                color: "#374151",
              }}
            >
              비밀번호
            </label>
            <input
              className="input"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="비밀번호를 입력하세요"
              style={{
                fontSize: 16,
                padding: "12px 16px",
              }}
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            style={{
              marginTop: 8,
              padding: "14px",
              fontSize: 16,
              fontWeight: 600,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
            }}
          >
            로그인
          </button>
        </form>

        {/* 회원가입 링크 */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 24,
            borderTop: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>
            아직 회원이 아니신가요?
          </p>
          <a
            className="btn"
            href="/signup"
            style={{
              display: "inline-block",
              fontSize: 14,
              fontWeight: 600,
              color: "#667eea",
              textDecoration: "none",
              padding: "8px 24px",
              border: "2px solid #667eea",
              borderRadius: 8,
            }}
          >
            회원가입
          </a>
        </div>

        {/* 데모 계정 안내 */}
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "#f9fafb",
            borderRadius: 8,
            fontSize: 12,
            color: "#6b7280",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>데모 계정</div>
          <div>구직자: seeker01 / 1111</div>
          <div>구인자: employer01 / 1111</div>
        </div>
      </div>
    </main>
  );
}
