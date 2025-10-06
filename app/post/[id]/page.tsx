// app/post/[id]/page.tsx
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { POSTINGS } from "@/data/postings";
import { CATEGORY_LABELS, type Posting } from "@/types";

function formatWon(n?: number) {
  if (!n || isNaN(n)) return "-";
  return n.toLocaleString("ko-KR") + "원";
}

function labelStart(start?: string) {
  if (!start) return "시작일 미정";
  const s = new Date(start);
  const t = new Date();
  const floor = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((floor(s) - floor(t)) / 86400000);
  if (diff === 0) return "당일";
  if (diff === 1) return "내일";
  if (diff === 2) return "다다음날";
  if (diff === 3) return "3일후";
  return s.toLocaleDateString("ko-KR");
}

function estimatePay(p: Posting) {
  // 데모 가정: 시급=8h/일, 월=22일/월, 주=6일/주
  let perDay = 0;
  if (p.wage_type === "day") perDay = p.wage_amount;
  else if (p.wage_type === "hour") perDay = p.wage_amount * 8;
  else if (p.wage_type === "month") perDay = Math.round(p.wage_amount / 22);

  const perWeek = perDay * 6;
  const perMonth = perDay * 22;
  return { perDay, perWeek, perMonth };
}

function completeness(p: Posting) {
  // 아주 단순한 데모 점수 (100점 만점)
  let score = 0;
  // 임금형태+금액 기입
  if (p.wage_type && p.wage_amount > 0) score += 20;
  // 시작일
  if (p.start_date) score += 10;
  // 위치(동/주소 중 하나)
  if (p.dong || p.address) score += 15;
  // 조건 배지 입력(있으면 가산, 최대 15)
  const flags = p.flags || {};
  const flagCount = ["today", "night", "beginner_ok", "lodging"].filter(
    (k) => (flags as any)[k]
  ).length;
  score += Math.min(15, flagCount * 5);
  // 내용
  if (p.content && p.content.trim().length >= 10) score += 20;
  // 카테고리
  if (p.category) score += 10;
  // created_at
  if (p.created_at) score += 10;
  return Math.max(0, Math.min(100, score));
}

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const jar = await cookies();
  const isLoggedIn = jar.get("demo_login")?.value === "1";
  const post = POSTINGS.find((p) => p.id === params.id);
  if (!post) notFound();
  if (!isLoggedIn)
    redirect(`/login?returnTo=${encodeURIComponent(`/post/${post.id}`)}`);

  const pay = estimatePay(post);
  const score = completeness(post);
  const startLabel = labelStart(post.start_date);
  const catLabel = CATEGORY_LABELS[post.category];
  const postedAt = new Date(post.created_at).toLocaleDateString("ko-KR");
  const mapQuery = encodeURIComponent(
    post.address ?? `${post.dong ?? "부천시"}`
  );
  const naverMapUrl = `https://map.naver.com/p/search/${mapQuery}`;

  return (
    <article className="post-detail">
      {/* 제목 + 메타 */}
      <header className="post-header">
        <h1 className="page-title">{post.title}</h1>
        <div className="post-submeta">
          <span className="badge">{catLabel}</span>
          <span className="sep">·</span>
          <span className="muted">등록일 {postedAt}</span>
        </div>
      </header>

      {/* 핵심 요약 그리드 */}
      <section className="detail-grid">
        <div className="kv">
          <div className="kv-key">임금</div>
          <div className="kv-val">
            {post.wage_type === "day" ? (
              <>일급 {formatWon(post.wage_amount)}</>
            ) : post.wage_type === "hour" ? (
              <>시급 {formatWon(post.wage_amount)}</>
            ) : (
              <>월급 {formatWon(post.wage_amount)}</>
            )}
          </div>
        </div>
        <div className="kv">
          <div className="kv-key">시작</div>
          <div className="kv-val">{startLabel}</div>
        </div>
        <div className="kv">
          <div className="kv-key">위치</div>
          <div className="kv-val">{post.dong ?? post.address ?? "부천"}</div>
        </div>
        <div className="kv">
          <div className="kv-key">조건</div>
          <div className="kv-val tags">
            {post.flags?.today && <span className="tag">오늘/빠른시작</span>}
            {post.flags?.night && <span className="tag">야간</span>}
            {post.flags?.beginner_ok && <span className="tag">초보가능</span>}
            {post.flags?.lodging && <span className="tag">숙소</span>}
            {!post.flags && <span className="muted">-</span>}
          </div>
        </div>
      </section>

      {/* 예상 실수령(간단 계산) */}
      <section className="card">
        <h2 className="card-title">예상 수령(데모)</h2>
        <div className="estimates">
          <div className="est-box">
            <div className="est-key">일급(환산)</div>
            <div className="est-val">{formatWon(pay.perDay)}</div>
          </div>
          <div className="est-box">
            <div className="est-key">주급(6일)</div>
            <div className="est-val">{formatWon(pay.perWeek)}</div>
          </div>
          <div className="est-box">
            <div className="est-key">월급(22일)</div>
            <div className="est-val">{formatWon(pay.perMonth)}</div>
          </div>
        </div>
        <p className="note">
          * 데모 기준 단순 환산입니다. 실제 수당/공제(식대·교통·장비·퇴직공제
          등)에 따라 달라질 수 있어요.
        </p>
      </section>

      {/* 상세 내용 */}
      <section className="card">
        <h2 className="card-title">상세 내용</h2>
        <div className="post-content">
          {post.content
            ? post.content
            : "상세 내용은 추후 작성 예정입니다. (데모)"}
        </div>
      </section>

      {/* 위치/길찾기 */}
      <section className="card">
        <h2 className="card-title">위치 및 길찾기</h2>
        <div className="kv">
          <div className="kv-key">주소/동</div>
          <div className="kv-val">{post.address ?? post.dong ?? "부천"}</div>
        </div>
        <div style={{ marginTop: 8 }}>
          <a
            className="btn"
            href={naverMapUrl}
            target="_blank"
            rel="noreferrer"
          >
            네이버지도로 열기
          </a>
        </div>
      </section>

      {/* 완성도/신뢰(데모) */}
      <section className="card">
        <h2 className="card-title">공고 완성도(데모)</h2>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${score}%` }} />
        </div>
        <div className="muted" style={{ marginTop: 6 }}>
          {score}점 / 100
        </div>
        <p className="note">
          * 데모 점수: 임금·시작일·위치·조건·내용 기입 여부 등에 따라
          산정합니다.
        </p>
      </section>

      {/* 신고/문의 */}
      <section className="card">
        <h2 className="card-title">신고/문의</h2>
        <p className="muted">
          허위임금, 연락두절, 불법·유해 게시물은 아래로 신고해주세요.
        </p>
        <a className="btn" href="/report">
          신고/문의 바로가기
        </a>
      </section>

      <div style={{ marginTop: 16 }}>
        <a className="nav-link" href="javascript:history.back()">
          ← 목록으로
        </a>
      </div>
    </article>
  );
}
