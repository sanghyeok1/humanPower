// components/Header.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Header() {
  const jar = await cookies();
  const isLoggedIn = jar.get("demo_login")?.value === "1";

  async function logout() {
    "use server";
    const cj = await cookies();
    cj.delete("demo_login");
    redirect("/");
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">
          <span className="brand__dot" />
          <span className="brand__title">오늘 일감</span>
          <span className="brand__sub">부천 · 동 단위</span>
        </Link>

        <nav className="nav">
          {isLoggedIn ? (
            <form action={logout}>
              <button type="submit" className="btn btn-ghost">
                로그아웃
              </button>
            </form>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                로그인
              </Link>
              <Link href="/signup" className="btn btn-primary">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
