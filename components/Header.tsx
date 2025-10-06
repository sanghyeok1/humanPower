// components/Header.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Header() {
  // Next 15: cookies()는 Promise
  const jar = await cookies();
  // 새 로그인 흐름: JWT/역할 쿠키
  const token = jar.get("auth_token")?.value ?? null;
  const role = jar.get("auth_role")?.value ?? null;
  const isLoggedIn = !!token;

  // (구) 데모 쿠키도 함께 읽고 싶다면 참고:
  // const demoLoggedIn = jar.get("demo_login")?.value === "1";

  // 서버 액션: 쿠키 직접 삭제 후 리다이렉트
  async function logout() {
    "use server";
    const cj = await cookies();
    // 새 쿠키 삭제
    cj.delete("auth_token"); // path 기본값이 '/'가 아니었다면 로그인 세팅과 동일한 path로 지정 필요
    cj.delete("auth_role");
    // (선택) 데모 쿠키도 함께 정리
    cj.delete("demo_login");
    cj.delete("demo_role");
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
