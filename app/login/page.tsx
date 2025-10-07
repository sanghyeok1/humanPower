"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function LoginPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const returnTo = useMemo(() => sp?.get("returnTo") || "/", [sp]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);
      try {
        const r = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const j = await r.json();
        if (!r.ok || !j?.ok) {
          const msg =
            j?.error === "invalid_credentials"
              ? "아이디 또는 비밀번호가 올바르지 않습니다."
              : j?.error === "inactive_account"
              ? "비활성화된 계정입니다."
              : j?.error || "로그인에 실패했습니다.";
          setError(msg);
          return;
        }
        router.push(returnTo);
      } catch {
        setError("네트워크 오류로 로그인에 실패했습니다.");
      } finally {
        setSubmitting(false);
      }
    },
    [username, password, router, returnTo]
  );

  // ▽ 개발용 데모 로그인 (접힘)
  const [showDev, setShowDev] = useState(false);
  const devLogin = useCallback(
    async (userId: number) => {
      try {
        const r = await fetch("/api/dev-login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (!r.ok) throw new Error("데모 로그인 실패");
        router.push(returnTo);
      } catch (e: any) {
        alert(e?.message ?? "데모 로그인 실패");
      }
    },
    [router, returnTo]
  );

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

      {/* 정식 로그인 폼 (아이디/비번) */}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          아이디
          <input
            className="input"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label>
          비밀번호
          <input
            className="input"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error && <div style={{ color: "#b91c1c", fontSize: 13 }}>{error}</div>}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "로그인 중…" : "로그인"}
          </button>
          <a className="btn" href="/signup/seeker">
            회원가입
          </a>
        </div>
      </form>

      {/* 개발자용(접기/펼치기) */}
      <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
        <button className="btn" onClick={() => setShowDev((v) => !v)}>
          {showDev ? "개발용 데모 로그인 닫기" : "개발용 데모 로그인 열기"}
        </button>
        {showDev && (
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            <button className="btn" onClick={() => devLogin(2)}>
              구직자 데모 로그인 (id=2)
            </button>
            <button className="btn" onClick={() => devLogin(1)}>
              구인자 데모 로그인 (id=1)
            </button>
            <p style={{ color: "#666", fontSize: 12 }}>
              데모 로그인은 <code>hp_token</code> 쿠키를 발급합니다. DB에 해당
              id가 있어야 합니다.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
