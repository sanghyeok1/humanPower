// app/login/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage({
  // Next 15: searchParams는 Promise로 받고 await 해야 함
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const sp = await searchParams;

  async function demoLogin(formData: FormData) {
    "use server";
    const jar = await cookies();

    const roleRaw = (formData.get("role") as string) || "seeker";
    const role = roleRaw === "employer" ? "employer" : "seeker";

    // 데모용 쿠키
    jar.set("demo_login", "1", {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    });
    jar.set("demo_role", role, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    });

    const next = (formData.get("returnTo") as string | null) ?? "/";
    redirect(next && next.startsWith("/") ? next : "/");
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>로그인</h1>
      <p style={{ color: "#666" }}>
        데모 전용: 실제 인증 대신 아래 버튼으로 역할을 선택해 로그인합니다.
      </p>

      {/* 구직자 데모 로그인 */}
      <form action={demoLogin} style={{ marginTop: 12 }}>
        <input type="hidden" name="role" value="seeker" />
        <input type="hidden" name="returnTo" value={sp.returnTo ?? ""} />
        <button type="submit" className="btn" style={{ width: "100%" }}>
          구직자 데모 로그인
        </button>
      </form>

      {/* 구인자 데모 로그인 */}
      <form action={demoLogin} style={{ marginTop: 8 }}>
        <input type="hidden" name="role" value="employer" />
        <input type="hidden" name="returnTo" value={sp.returnTo ?? ""} />
        <button type="submit" className="btn" style={{ width: "100%" }}>
          구인자 데모 로그인
        </button>
      </form>

      <div style={{ marginTop: 16 }}>
        <a className="nav-link" href="/">
          ← 홈으로
        </a>
      </div>
    </div>
  );
}
