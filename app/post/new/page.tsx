// app/post/new/page.tsx
import { getServerAccount } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewPostPage() {
  const me = await getServerAccount();

  // 미로그인 → 로그인 페이지로
  if (!me) {
    redirect(`/login?returnTo=${encodeURIComponent("/post/new")}`);
  }

  // 권한 체크: 구인자만 공고 작성
  if (me.role !== "employer") {
    // 필요하면 별도 안내 페이지로 보내도 됨
    redirect("/");
  }

  // 여기서부터 공고 작성 폼 (임시 마크업)
  return (
    <main style={{ maxWidth: 720, margin: "32px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>공고 올리기</h1>
      <p style={{ color: "#555", margin: "8px 0 16px" }}>
        안녕하세요, <b>{me.display_name}</b> 님.
      </p>

      <form style={{ display: "grid", gap: 12 }}>
        <label>
          제목
          <input
            className="input"
            name="title"
            placeholder="예) 내부마감 보조 2명"
          />
        </label>
        <label>
          분야
          <select className="input" name="cat">
            <option value="rc">철근/형틀/콘크리트</option>
            <option value="int">내부마감</option>
            <option value="mech">설비/전기/배관</option>
          </select>
        </label>
        <label>
          동(지역)
          <select className="input" name="dong">
            <option>춘의동</option>
            <option>신중동</option>
            <option>원미동</option>
            <option>소사동</option>
          </select>
        </label>
        <label>
          급여/형태
          <input
            className="input"
            name="pay"
            placeholder="예) 일급 18만 + 식대"
          />
        </label>
        <label>
          시작일
          <input className="input" type="date" name="startDate" />
        </label>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="btn btn-primary" type="button" disabled>
            (데모) 저장 준비 중
          </button>
          <a className="btn" href="/">
            취소
          </a>
        </div>
      </form>
    </main>
  );
}
