import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function LoginPage() {
  async function demoLogin() {
    "use server";
    const jar = await cookies(); // ← await
    jar.set("demo_login", "1", {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/");
  }

  return (
    <form action={demoLogin}>
      <button type="submit">데모 로그인</button>
    </form>
  );
}
