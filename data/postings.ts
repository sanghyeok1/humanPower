// data/postings.ts
import type { Posting } from "@/types";

// 날짜 헬퍼
const addDays = (base: Date, days: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const today = new Date();
today.setHours(0, 0, 0, 0);

export const POSTINGS: Posting[] = [
  {
    id: "r1",
    title: "철근 조공 · 오늘 시작 · 일급 15만",
    category: "rebar_form_concrete",
    wage_type: "day",
    wage_amount: 150000,
    address: "부천시 춘의동",
    dong: "춘의동",
    start_date: addDays(today, 0), // 당일
    flags: { today: true, beginner_ok: true },
    created_at: new Date().toISOString(),
    content:
      "철근 조공 보조. 개인장비 일부 필요(장갑/안전화). 초보 가능, 안전교육 필수.",
  },
  {
    id: "r2",
    title: "형틀 보조 · 초보가능 · 일급 16만",
    category: "rebar_form_concrete",
    wage_type: "day",
    wage_amount: 160000,
    address: "부천시 신중동",
    dong: "신중동",
    start_date: addDays(today, 2), // 다다음날
    created_at: new Date().toISOString(),
    content: "형틀 보조. 주 6일, 숙소 문의 가능. 초보 가능, 현장 적응 지원.",
  },
  {
    id: "i1",
    title: "석고보드 내부마감 · 주간 · 일급 17만",
    category: "interior_finish",
    wage_type: "day",
    wage_amount: 170000,
    address: "부천시 중동",
    dong: "중동",
    start_date: addDays(today, 3), // 3일후
    created_at: new Date().toISOString(),
    content: "내부마감(석고보드) 보조. 개인장비 일부 현장 대여 가능.",
  },
  {
    id: "i2",
    title: "도장 보조 · 반경 5km · 일급 14만",
    category: "interior_finish",
    wage_type: "day",
    wage_amount: 140000,
    address: "부천시 소사동",
    dong: "소사동",
    start_date: addDays(today, 0), // 당일
    created_at: new Date().toISOString(),
    content: "도장 보조. 반경 5km 내 우선. 초보 가능.",
  },
  {
    id: "m1",
    title: "배관 설비 보조 · 야간 · 일급 18만",
    category: "mep",
    wage_type: "day",
    wage_amount: 180000,
    address: "부천시 원미동",
    dong: "원미동",
    start_date: addDays(today, 2), // 다다음날
    flags: { night: true },
    created_at: new Date().toISOString(),
    content: "야간 설비 보조. 야간수당 포함. 안전장비 필수.",
  },
  {
    id: "m2",
    title: "전기 배선 정리 · 초보가능 · 시급 13,000",
    category: "mep",
    wage_type: "hour",
    wage_amount: 13000,
    address: "부천시 약대동",
    dong: "약대동",
    start_date: addDays(today, 3), // 3일후
    flags: { beginner_ok: true },
    created_at: new Date().toISOString(),
    content: "전기 배선 정리. 초보 가능, 현장 교육 제공.",
  },
];
