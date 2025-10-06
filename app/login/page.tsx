// app/login/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage({
  // ❗ Next 15: searchParams는 Promise 타입으로 받고
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  // ❗ 반드시 await 후에 사용
  const sp = await searchParams;

  async function demoLogin(formData: FormData) {
    "use server";
    const jar = await cookies();
    jar.set("demo_login", "1", {
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
        데모 전용: 실제 인증 대신 쿠키를 심습니다.
      </p>

      <form action={demoLogin}>
        <input type="hidden" name="returnTo" value={sp.returnTo ?? ""} />
        <button
          type="submit"
          className="btn"
          style={{ width: "100%", marginTop: 12 }}
        >
          데모 로그인
        </button>
      </form>
    </div>
  );
}
