// components/BoardBrowser.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORY_LABELS, type CategorySlug } from "@/types";
import { POSTINGS } from "@/data/postings";

// ---- 옵션들 ----
const CAT_ALL = "all" as const;
type CatFilter = typeof CAT_ALL | CategorySlug;

const DONG_ALL = "all" as const;
type DongFilter = typeof DONG_ALL | string;

const START_ALL = "all" as const;
type StartFilter = typeof START_ALL | "today" | "dayAfterTomorrow" | "plus3";

// ---- 날짜 그룹 계산 (당일/다다음날/3일후) ----
function startGroupOf(dateStr?: string): StartFilter | "other" {
  if (!dateStr) return "other";
  const start = new Date(dateStr);
  const today = new Date();
  // 날짜만 비교(자정 기준)
  const floor = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((floor(start) - floor(today)) / 86400000);

  if (diffDays === 0) return "today";
  if (diffDays === 2) return "dayAfterTomorrow";
  if (diffDays === 3) return "plus3";
  return "other";
}

// ---- 동 옵션 목록 (더미데이터에서 추출) ----
const DONG_OPTIONS: string[] = Array.from(
  new Set(POSTINGS.map((p) => p.dong).filter((d): d is string => !!d))
);

const CAT_LABELS: Record<CatFilter, string> = {
  all: "전체",
  rebar_form_concrete: CATEGORY_LABELS.rebar_form_concrete,
  interior_finish: CATEGORY_LABELS.interior_finish,
  mep: CATEGORY_LABELS.mep,
};

const START_LABELS: Record<StartFilter, string> = {
  all: "전체",
  today: "당일",
  dayAfterTomorrow: "다다음날",
  plus3: "3일후",
};

export default function BoardBrowser({ isLoggedIn }: { isLoggedIn: boolean }) {
  // 1) 분야
  const [cat, setCat] = useState<CatFilter>("all");
  // 2) 동
  const [dong, setDong] = useState<DongFilter>("all");
  // 3) 시작일
  const [start, setStart] = useState<StartFilter>("all");

  // 필터 적용
  const items = useMemo(() => {
    return [...POSTINGS]
      .filter((p) => (cat === "all" ? true : p.category === cat))
      .filter((p) => (dong === "all" ? true : p.dong === dong))
      .filter((p) => {
        if (start === "all") return true;
        return startGroupOf(p.start_date) === start;
      })
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }, [cat, dong, start]);

  return (
    <section>
      {/* 1) 분야 */}
      <div className="chips" style={{ marginBottom: 8 }}>
        {(
          [
            "all",
            "rebar_form_concrete",
            "interior_finish",
            "mep",
          ] as CatFilter[]
        ).map((c) => (
          <button
            key={c}
            className={`chip ${cat === c ? "chip--active" : ""}`}
            onClick={() => setCat(c)}
          >
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>

      {/* 2) 동 */}
      <div className="chips" style={{ marginBottom: 8 }}>
        <button
          className={`chip ${dong === "all" ? "chip--active" : ""}`}
          onClick={() => setDong("all")}
        >
          전체
        </button>
        {DONG_OPTIONS.map((d) => (
          <button
            key={d}
            className={`chip ${dong === d ? "chip--active" : ""}`}
            onClick={() => setDong(d)}
          >
            {d}
          </button>
        ))}
      </div>

      {/* 3) 시작일 */}
      <div className="chips">
        {(["all", "today", "dayAfterTomorrow", "plus3"] as StartFilter[]).map(
          (s) => (
            <button
              key={s}
              className={`chip ${start === s ? "chip--active" : ""}`}
              onClick={() => setStart(s)}
            >
              {START_LABELS[s]}
            </button>
          )
        )}
      </div>

      {/* 안내 (목록은 공개, 클릭 시 로그인 유도) */}
      {!isLoggedIn && (
        <div className="notice" style={{ marginTop: 10 }}>
          로그인 전에는 목록만 볼 수 있어요. 항목을 클릭하면 로그인 페이지로
          이동합니다.
        </div>
      )}

      {/* 목록 */}
      <ul className="posting-list" style={{ marginTop: 12 }}>
        {items.length === 0 ? (
          <li className="posting-item empty">조건에 맞는 공고가 없습니다.</li>
        ) : (
          items.map((p) => {
            const target = `/post/${p.id}`;
            const href = isLoggedIn
              ? target
              : `/login?returnTo=${encodeURIComponent(target)}`;
            return (
              <li key={p.id} className="posting-item">
                <Link href={href}>
                  <div className="posting-title">{p.title}</div>
                  <div className="posting-meta">
                    {p.wage_type === "day"
                      ? `일급 ${p.wage_amount.toLocaleString()}원`
                      : p.wage_type === "hour"
                      ? `시급 ${p.wage_amount.toLocaleString()}원`
                      : `월급 ${p.wage_amount.toLocaleString()}원`}
                    {" · "}
                    {p.dong ?? p.address ?? "부천"}
                    {" · "}
                    {(() => {
                      const g = startGroupOf(p.start_date);
                      if (g === "today") return "당일";
                      if (g === "dayAfterTomorrow") return "다다음날";
                      if (g === "plus3") return "3일후";
                      return p.start_date
                        ? new Date(p.start_date).toLocaleDateString("ko-KR")
                        : "시작일 미정";
                    })()}
                  </div>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
