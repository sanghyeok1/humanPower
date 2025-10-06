// app/post/[id]/page.tsx
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { POSTINGS } from "@/data/postings";
import { CATEGORY_LABELS } from "@/types";

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const jar = await cookies();
  const isLoggedIn = jar.get("demo_login")?.value === "1";
  const post = POSTINGS.find((p) => p.id === params.id);
  if (!post) notFound();

  if (!isLoggedIn) {
    redirect(`/login?returnTo=${encodeURIComponent(`/post/${post.id}`)}`);
  }

  return (
    <article>
      <h1 className="page-title">{post.title}</h1>
      <div className="posting-meta" style={{ marginBottom: 8 }}>
        {post.wage_type === "day"
          ? `일급 ${post.wage_amount.toLocaleString()}원`
          : post.wage_type === "hour"
          ? `시급 ${post.wage_amount.toLocaleString()}원`
          : `월급 ${post.wage_amount.toLocaleString()}원`}
        {" · "}
        {CATEGORY_LABELS[post.category]}
        {" · "}
        {new Date(post.created_at).toLocaleDateString("ko-KR")}
      </div>
      {post.address && (
        <div style={{ color: "#555", marginBottom: 8 }}>{post.address}</div>
      )}
      {post.content ? (
        <div style={{ lineHeight: 1.6, color: "#333" }}>{post.content}</div>
      ) : (
        <div style={{ lineHeight: 1.6, color: "#333" }}>
          상세 내용은 추후 작성 예정입니다. (데모)
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <a className="nav-link" href="javascript:history.back()">
          ← 목록으로
        </a>
      </div>
    </article>
  );
}
