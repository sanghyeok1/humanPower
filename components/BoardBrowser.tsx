// components/BoardBrowser.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORY_LABELS, type CategorySlug } from "@/types";
import { POSTINGS } from "@/data/postings";

const ALL_CATS: CategorySlug[] = [
  "rebar_form_concrete",
  "interior_finish",
  "mep",
];

export default function BoardBrowser({ isLoggedIn }: { isLoggedIn: boolean }) {
  // 로그인 시 기본 전체 선택, 비로그인 시 비어있음
  const [selected, setSelected] = useState<Set<CategorySlug>>(
    () => new Set(isLoggedIn ? ALL_CATS : [])
  );

  const isAll = selected.size === ALL_CATS.length;
  const items = useMemo(() => {
    if (selected.size === 0) return [];
    const ok = new Set(selected);
    return [...POSTINGS]
      .filter((p) => ok.has(p.category))
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)); // 최신순
  }, [selected]);

  const toggleCat = (cat: CategorySlug) => {
    if (!isLoggedIn) {
      // 비로그인: 칩 클릭 시 로그인 유도
      window.location.href = "/login?returnTo=/";
      return;
    }
    const next = new Set(selected);
    next.has(cat) ? next.delete(cat) : next.add(cat);
    setSelected(next);
  };

  const toggleAll = () => {
    if (!isLoggedIn) {
      window.location.href = "/login?returnTo=/";
      return;
    }
    setSelected(isAll ? new Set() : new Set(ALL_CATS));
  };

  return (
    <section>
      {/* 필터 칩 */}
      <div className="chips">
        <button
          className={`chip ${isAll ? "chip--active" : ""}`}
          onClick={toggleAll}
        >
          전체
        </button>
        {ALL_CATS.map((c) => (
          <button
            key={c}
            className={`chip ${selected.has(c) ? "chip--active" : ""}`}
            onClick={() => toggleCat(c)}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {!isLoggedIn && (
        <div className="notice">
          로그인 전에는 목록만 볼 수 있어요. 항목을 클릭하면 로그인 페이지로
          이동합니다.
        </div>
      )}

      {/* 게시판 목록 */}
      <ul className="posting-list" style={{ marginTop: 12 }}>
        {items.length === 0 && isLoggedIn ? (
          <li className="posting-item empty">
            선택한 카테고리에 공고가 아직 없어요.
          </li>
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
                    {CATEGORY_LABELS[p.category]}
                    {" · "}
                    {new Date(p.created_at).toLocaleDateString("ko-KR")}
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
