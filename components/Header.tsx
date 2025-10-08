// components/Header.tsx
import HeaderClient from "./HeaderClient";
import { getServerAccount } from "@/lib/auth";

export default async function Header() {
  const me = await getServerAccount();

  return (
    <header className="site-header">
      <div className="inner">
        <a href="/" className="logo">
          <strong>바로일감</strong>
          <span className="sub">부천 동 단위</span>
        </a>

        <nav className="nav">
          <a href="/?cat=all" className="nav-link">
            전체
          </a>
          <a href="/?cat=rc" className="nav-link">
            철근/형틀/콘크리트
          </a>
          <a href="/?cat=int" className="nav-link">
            내부마감
          </a>
          <a href="/?cat=mech" className="nav-link">
            설비/전기/배관
          </a>
        </nav>

        {!me ? (
          <div className="auth">
            <a className="btn" href="/login">
              로그인
            </a>
            <a className="btn btn-primary" href="/signup/seeker">
              회원가입
            </a>
          </div>
        ) : (
          <HeaderClient
            displayName={me.display_name}
            lat={me.lat ?? undefined}
            lng={me.lng ?? undefined}
          />
        )}
      </div>
    </header>
  );
}
