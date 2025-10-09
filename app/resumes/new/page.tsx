// app/resumes/new/page.tsx
import { getServerAccount } from "@/lib/auth";
import { redirect } from "next/navigation";
import ResumeForm from "@/components/ResumeForm";

export default async function NewResumePage() {
  const me = await getServerAccount();

  if (!me) {
    redirect(`/login?returnTo=${encodeURIComponent("/resumes/new")}`);
  }

  if (me.role !== "seeker") {
    redirect("/");
  }

  return (
    <main className="page">
      <div className="board">
        <h1 className="page-title">이력서 작성</h1>

        <div className="card">
          <ResumeForm userName={me.display_name} userPhone={me.phone || ""} />
        </div>
      </div>
    </main>
  );
}
