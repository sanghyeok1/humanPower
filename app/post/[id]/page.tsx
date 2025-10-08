// app/post/[id]/page.tsx
import { getServerAccount } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { postings } from "@/lib/mockdb";

export default async function PostDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const me = await getServerAccount();
  const { id } = await params;

  const post = postings.find((p) => p.id === id);
  if (!post) notFound();

  // 미로그인 → 로그인으로 보내되, 원래 글로 되돌아오게 returnTo
  if (!me) {
    redirect(`/login?returnTo=${encodeURIComponent(`/post/${post.id}`)}`);
  }

  const catLabel =
    post.cat === "rc"
      ? "철근/형틀/콘크리트"
      : post.cat === "int"
      ? "내부마감"
      : "설비/전기/배관";

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <a href="/" className="btn" style={{ marginBottom: 12 }}>
        ← 목록으로
      </a>

      <h1 style={{ fontSize: 22, fontWeight: 800 }}>{post.title}</h1>
      <div style={{ color: "#6b7280", marginTop: 6 }}>
        {catLabel} · {post.dong} · 시작일 {post.startDate}
      </div>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
          marginTop: 16,
        }}
      >
        <p style={{ margin: 0, fontSize: 16 }}>{post.pay}</p>
        {post.summary && (
          <p style={{ marginTop: 8, color: "#374151" }}>{post.summary}</p>
        )}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <a className="btn btn-primary" href="tel:010-0000-0000">
          전화하기
        </a>
        <a className="btn" href="#">
          채팅 문의
        </a>
      </div>
    </main>
  );
}
