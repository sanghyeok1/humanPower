// components/Header.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Header() {
  const jar = await cookies();
  const isLoggedIn = jar.get("demo_login")?.value === "1";
  const role = jar.get("demo_role")?.value ?? null;

  async function logout() {
    "use server";
    const cj = await cookies();
    cj.delete("demo_login");
    cj.delete("demo_role"); // 역할도 같이 삭제
    redirect("/");
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">
          <span className="brand__dot" />
          <span className="brand__title">바로일감</span>
          <span className="brand__sub">부천 · 동 단위</span>
        </Link>

        {isLoggedIn ? (
          <nav className="nav" style={{ gap: 10 }}>
            {/* 구인자일 때만 보이는 버튼 */}
            {role === "employer" && (
              <Link href="/post/new" className="btn btn-primary">
                공고 올리기
              </Link>
            )}
            {/* (선택) 역할 뱃지 보여주고 싶으면 주석 해제
            <span className="role-badge">
              {role === 'employer' ? '구인자' : '구직자'}
            </span>
            */}
            <form action={logout}>
              <button type="submit" className="btn btn-ghost">
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
