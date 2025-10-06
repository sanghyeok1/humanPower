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

  const [phone, setPhone] = useState("");
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
        body: JSON.stringify({ phone, password }),
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
          전화번호
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0001"
            className="input"
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="1111"
            className="input"
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
