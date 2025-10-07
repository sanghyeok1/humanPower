// app/login/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const [sp, setSp] = useState<{ returnTo?: string }>({});
  useEffect(() => {
    searchParams.then(setSp);
  }, [searchParams]);

  const [username, setUsername] = useState(""); // ✅ 아이디
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }), // ✅ 아이디로 로그인
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j.error ?? "로그인 실패");
        return;
      }
      const to = sp.returnTo && sp.returnTo.startsWith("/") ? sp.returnTo : "/";
      window.location.href = to;
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>로그인</h1>
      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: 10, marginTop: 12 }}
      >
        <label>
          아이디
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="예: worker01"
            className="input"
            autoComplete="username"
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••"
            className="input"
            autoComplete="current-password"
          />
        </label>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "확인 중…" : "로그인"}
        </button>
        {error && (
          <div className="notice" style={{ color: "#b91c1c" }}>
            {error}
          </div>
        )}
      </form>
      <div style={{ marginTop: 16 }}>
        <a className="nav-link" href="/">
          ← 홈으로
        </a>
      </div>
    </main>
  );
}
