// app/post/new/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { POSTINGS } from "@/data/postings";
import type { Posting, CategorySlug } from "@/types";

export default async function NewPostPage() {
  const jar = await cookies();
  const isLoggedIn = jar.get("demo_login")?.value === "1";
  const role = jar.get("demo_role")?.value;

  if (!isLoggedIn) redirect("/login?returnTo=/post/new");
  if (role !== "employer") redirect("/"); // 구인자만 접근

  async function createPosting(formData: FormData) {
    "use server";
    const cj = await cookies();
    const isLoggedIn2 = cj.get("demo_login")?.value === "1";
    const role2 = cj.get("demo_role")?.value;
    if (!isLoggedIn2 || role2 !== "employer")
      redirect("/login?returnTo=/post/new");

    const title = String(formData.get("title") ?? "").trim();
    const category = String(
      formData.get("category") ?? "rebar_form_concrete"
    ) as CategorySlug;
    const wage_type = String(formData.get("wage_type") ?? "day") as
      | "day"
      | "hour"
      | "month";
    const wage_amount = Number(formData.get("wage_amount") ?? 0);
    const dong = (formData.get("dong") as string)?.trim() || "";
    const address = (formData.get("address") as string)?.trim() || "";
    const start_date_raw = (formData.get("start_date") as string) || "";
    const start_date = start_date_raw
      ? new Date(start_date_raw).toISOString()
      : undefined;

    if (!title || !wage_amount) {
      // 간단 검증(필요 시 개선)
      redirect("/post/new");
    }

    const id = `n${Date.now()}`;
    const newPost: Posting = {
      id,
      title,
      category,
      wage_type,
      wage_amount,
      dong: dong || undefined,
      address: address || undefined,
      start_date,
      created_at: new Date().toISOString(),
      content: "데모 등록: DB 연동 전 임시 데이터입니다.",
    };

    // 데모: 런타임 메모리 배열에 추가
    POSTINGS.unshift(newPost);
    redirect(`/post/${id}`);
  }

  return (
    <div style={{ maxWidth: 680, margin: "24px auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>공고 올리기 (데모)</h1>
      <p style={{ color: "#666" }}>
        DB 연동 전 데모 양식입니다. 저장 시 임시 목록에 추가됩니다.
      </p>

      <form
        action={createPosting}
        style={{ display: "grid", gap: 10, marginTop: 16 }}
      >
        <label>
          제목
          <input
            name="title"
            required
            placeholder="예) 형틀 보조 · 일급 16만"
            style={inputStyle}
          />
        </label>

        <label>
          분야
          <select
            name="category"
            defaultValue="rebar_form_concrete"
            style={inputStyle}
          >
            <option value="rebar_form_concrete">철근/형틀/콘크리트</option>
            <option value="interior_finish">내부마감</option>
            <option value="mep">설비/전기/배관</option>
          </select>
        </label>

        <div
          style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10 }}
        >
          <label>
            임금형태
            <select name="wage_type" defaultValue="day" style={inputStyle}>
              <option value="day">일급</option>
              <option value="hour">시급</option>
              <option value="month">월급</option>
            </select>
          </label>
          <label>
            금액
            <input
              name="wage_amount"
              type="number"
              min={0}
              required
              placeholder="150000"
              style={inputStyle}
            />
          </label>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <label>
            동(선택)
            <input name="dong" placeholder="예) 춘의동" style={inputStyle} />
          </label>
          <label>
            주소(선택)
            <input
              name="address"
              placeholder="예) 부천시 ○○로 00"
              style={inputStyle}
            />
          </label>
        </div>

        <label>
          시작일(선택)
          <input name="start_date" type="date" style={inputStyle} />
        </label>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: 160 }}
        >
          등록
        </button>
      </form>
    </div>
  );
}

// 인라인 스타일 최소화(간단 데모용)
const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "8px 10px",
  marginTop: 6,
};
