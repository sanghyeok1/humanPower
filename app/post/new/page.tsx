// app/post/new/page.tsx
import { redirect } from "next/navigation";
import { isLoggedIn, currentRole } from "@/lib/auth";

export default async function NewPostPage() {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    redirect(`/login?returnTo=${encodeURIComponent("/post/new")}`);
  }

  const role = await currentRole();
  if (role !== "employer") {
    // 구직자는 작성 불가. 필요시 안내 페이지로 변경 가능
    redirect("/");
  }

  // 여기부터 실제 작성 폼(지금은 데모)
  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>공고 올리기</h1>
      <p style={{ color: "#666", marginTop: 6 }}>
        (데모) 로그인·권한 체크를 통과했으니 이 폼을 구현하면 됩니다.
      </p>

      <form style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          제목
          <input
            className="input"
            placeholder="예: 철근 조공 · 오늘 시작 · 일급 15만"
          />
        </label>
        <label>
          카테고리
          <select className="input">
            <option value="rebar_form_concrete">철근/형틀/콘크리트</option>
            <option value="interior_finish">내부마감</option>
            <option value="mep">설비/전기/배관</option>
          </select>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <select className="input">
            <option value="day">일급</option>
            <option value="hour">시급</option>
            <option value="month">월급</option>
          </select>
          <input className="input" type="number" placeholder="금액(숫자)" />
        </div>
        <label>
          주소
          <input className="input" placeholder="부천시 ○○동 ○○-○" />
        </label>
        <label>
          내용
          <textarea
            className="input"
            rows={6}
            placeholder="상세 조건, 근무시간, 숙소/식대, 장비 등"
          ></textarea>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" type="button">
            임시저장
          </button>
          <button className="btn" type="button">
            등록
          </button>
        </div>
      </form>
    </main>
  );
}
