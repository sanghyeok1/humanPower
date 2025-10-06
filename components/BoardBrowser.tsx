// components/BoardBrowser.tsx
"use client";

import { useMemo, useState } from "react";
import { CATEGORY_LABELS, type CategorySlug } from "@/types";
import { POSTINGS } from "@/data/postings";

const ALL_CATS: CategorySlug[] = [
  "rebar_form_concrete",
  "interior_finish",
  "mep",
];

export default function BoardBrowser({ isLoggedIn }: { isLoggedIn: boolean }) {
  // 로그인 시 기본: 전체 선택 / 비로그인: 비어 있음
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

  const requireLogin = () => {
    window.location.href = "/login?returnTo=/";
  };

  const toggleCat = (cat: CategorySlug) => {
    if (!isLoggedIn) return requireLogin();
    const next = new Set(selected);
    next.has(cat) ? next.delete(cat) : next.add(cat);
    setSelected(next);
  };

  const toggleAll = () => {
    if (!isLoggedIn) return requireLogin();
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

      {/* 비로그인 안내 */}
      {!isLoggedIn && (
        <div className="notice">
          로그인 후 열람 가능합니다. 카테고리를 누르면 로그인 페이지로
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
          items.map((p) => (
            <li key={p.id} className="posting-item">
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
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
