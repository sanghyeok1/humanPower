// app/post/edit/[id]/page.tsx
import { getServerAccount } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { jobPostings } from "@/lib/mockdb";
import JobPostingEditForm from "@/components/JobPostingEditForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getServerAccount();
  const { id } = await params;

  // 미로그인 → 로그인 페이지로
  if (!me) {
    redirect(`/login?returnTo=${encodeURIComponent(`/post/edit/${id}`)}`);
  }

  // 권한 체크: 구인자만
  if (me.role !== "employer") {
    redirect("/");
  }

  // 공고 조회
  const posting = jobPostings.find((p) => p.id === id);

  if (!posting) {
    notFound();
  }

  // 본인 공고인지 확인
  if (posting.employer_id !== me.id) {
    redirect("/");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "white",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
            padding: "32px 40px",
            color: "white",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 32 }}>✏️</span>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
              공고 수정
            </h1>
          </div>
          <p style={{ fontSize: 16, opacity: 0.95, margin: 0 }}>
            안녕하세요, <strong>{me.display_name}</strong> 님! 공고 내용을 수정하세요.
          </p>
        </div>

        {/* 폼 영역 */}
        <div style={{ padding: "40px" }}>
          <JobPostingEditForm
            employerName={me.display_name}
            posting={posting}
          />
        </div>
      </div>
    </main>
  );
}
