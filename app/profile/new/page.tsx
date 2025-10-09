// app/profile/new/page.tsx
import { getServerAccount } from "@/lib/auth";
import { redirect } from "next/navigation";
import SeekerProfileCreateForm from "@/components/SeekerProfileCreateForm";

export default async function NewProfilePage() {
  const me = await getServerAccount();

  // 미로그인 → 로그인 페이지로
  if (!me) {
    redirect(`/login?returnTo=${encodeURIComponent("/profile/new")}`);
  }

  // 권한 체크: 구직자만 프로필 작성
  if (me.role !== "seeker") {
    redirect("/");
  }

  return (
    <main className="page">
      <div className="board">
        <h1 className="page-title">프로필 작성</h1>

        <div className="card">
          <h3 className="card-title">구직자 프로필</h3>
          <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
            프로필을 작성하여 맞춤 공고를 받아보세요.
          </p>

          <SeekerProfileCreateForm
            userName={me.display_name}
            userPhone={me.phone || ""}
          />
        </div>
      </div>
    </main>
  );
}
