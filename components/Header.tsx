import HeaderClient from "./HeaderClient";
import { getServerAccount } from "@/lib/auth";

export default async function Header() {
  const me = await getServerAccount();
  return (
    <header className="site-header">
      <div className="inner">
        <a className="logo" href="/">
          바로일감
        </a>
        <nav className="nav">
          <a href="/board/cat?cat=all">전체</a>
          <a href="/board/cat?cat=rc">철근/형틀/콘크리트</a>
          <a href="/board/cat?cat=int">내부마감</a>
          <a href="/board/cat?cat=mech">설비/전기/배관</a>
        </nav>
        {!me ? (
          <div className="auth">
            <a className="btn" href="/login">
              로그인
            </a>
            <a className="btn" href="/signup/seeker">
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
