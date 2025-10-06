// components/Header.tsx
import Link from "next/link";
import { cookies } from "next/headers";

export default async function Header() {
  const jar = await cookies(); // ✅ Next 15: await
  const token = jar.get("auth_token")?.value;
  const demo = jar.get("demo_login")?.value === "1";
  const role = jar.get("auth_role")?.value ?? null;
  const loggedIn = !!token || demo;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">
          <span className="brand__dot" />
          <span className="brand__title">오늘 일감</span>
          <span className="brand__sub">부천 · 동 단위</span>
        </Link>

        {loggedIn ? (
          <nav className="nav" style={{ gap: 10 }}>
            {role === "employer" && (
              <Link href="/post/new" className="btn btn-primary">
                공고 올리기
              </Link>
            )}
            <form action="/api/auth/logout" method="post">
              <button className="btn btn-ghost" type="submit">
                로그아웃
              </button>
            </form>
          </nav>
        ) : (
          <nav className="nav">
            <Link href="/login" className="nav-link">
              로그인
            </Link>
            <Link href="/signup" className="btn btn-primary">
              회원가입
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
