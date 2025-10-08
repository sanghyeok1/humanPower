// lib/mockdb.ts
// ─────────────────────────────────────────────────────────────
// 타입
export type Account = {
  id: number;
  role: "seeker" | "employer";
  username: string;
  password: string; // 데모용(실서버는 해시 사용)
  display_name: string;
  phone?: string;
  lat?: number | null;
  lng?: number | null;
};

export type Partner = {
  id: number;
  name: string;
  address?: string | null;
  lat: number;
  lng: number;
  logo_url?: string | null;
  link_url?: string | null;
  tags_json?: string[] | null;
};

export type Posting = {
  id: string;
  cat: "rc" | "int" | "mech";
  dong: "춘의동" | "신중동" | "중동" | "원미동" | "소사동"; // ← '중동' 포함
  title: string;
  pay: string;
  startDate: string; // YYYY-MM-DD
  createdAt: string; // YYYY-MM-DD
  summary?: string;
};

// ─────────────────────────────────────────────────────────────
// 더미 계정(그대로)
export const accounts: Account[] = [
  {
    id: 1,
    role: "seeker",
    username: "seeker01",
    password: "1111",
    display_name: "구직자A",
    lat: 37.503,
    lng: 126.766,
  },
  {
    id: 2,
    role: "seeker",
    username: "seeker02",
    password: "1111",
    display_name: "구직자B",
    lat: 37.51,
    lng: 126.78,
  },
  {
    id: 3,
    role: "employer",
    username: "employer01",
    password: "1111",
    display_name: "현장소장A",
  },
  {
    id: 4,
    role: "seeker",
    username: "qmffhrskfk13",
    password: "1111",
    display_name: "나상혁",
    phone: "01063779454",
    lat: 37.51,
    lng: 126.78,
  },
];

// ─────────────────────────────────────────────────────────────
// 파트너 광고: 총 12개(기존 2개 + 10개 추가)
// 좌표는 부천 주요 동네 인근값 (대략적)
export const partners: Partner[] = [
  {
    id: 1,
    name: "OO공구상",
    address: "부천시 춘의동 123",
    lat: 37.504,
    lng: 126.766,
    link_url: "https://example.com",
    tags_json: ["공구상", "자재"],
  },
  {
    id: 2,
    name: "XX자재상",
    address: "부천시 신중동 45",
    lat: 37.498,
    lng: 126.78,
    link_url: "https://example.com",
    tags_json: ["자재"],
  },
  {
    id: 3,
    name: "부천철물마트",
    address: "부천시 중동 101",
    lat: 37.5052,
    lng: 126.7748,
    link_url: "https://example.com",
    tags_json: ["철물", "공구"],
  },
  {
    id: 4,
    name: "대성공구백화점",
    address: "부천시 원미동 22",
    lat: 37.4972,
    lng: 126.7675,
    link_url: "https://example.com",
    tags_json: ["공구", "장비대여"],
  },
  {
    id: 5,
    name: "신중동자재마트",
    address: "부천시 신중동 210",
    lat: 37.5081,
    lng: 126.7702,
    link_url: "https://example.com",
    tags_json: ["자재", "목자재"],
  },
  {
    id: 6,
    name: "소사자재창고",
    address: "부천시 소사동 88",
    lat: 37.4943,
    lng: 126.7614,
    link_url: "https://example.com",
    tags_json: ["자재", "단가상담"],
  },
  {
    id: 7,
    name: "중동배관센터",
    address: "부천시 중동 330",
    lat: 37.506,
    lng: 126.784,
    link_url: "https://example.com",
    tags_json: ["배관", "설비"],
  },
  {
    id: 8,
    name: "춘의타일상사",
    address: "부천시 춘의동 55",
    lat: 37.4889,
    lng: 126.776,
    link_url: "https://example.com",
    tags_json: ["타일", "내부마감"],
  },
  {
    id: 9,
    name: "원미페인트",
    address: "부천시 원미동 77",
    lat: 37.5,
    lng: 126.772,
    link_url: "https://example.com",
    tags_json: ["페인트", "내부"],
  },
  {
    id: 10,
    name: "중동전기자재",
    address: "부천시 중동 12",
    lat: 37.512,
    lng: 126.788,
    link_url: "https://example.com",
    tags_json: ["전기", "자재"],
  },
  {
    id: 11,
    name: "신중동용접자재",
    address: "부천시 신중동 311",
    lat: 37.515,
    lng: 126.7705,
    link_url: "https://example.com",
    tags_json: ["용접", "보호구"],
  },
  {
    id: 12,
    name: "소사전동공구",
    address: "부천시 소사동 199",
    lat: 37.491,
    lng: 126.785,
    link_url: "https://example.com",
    tags_json: ["전동공구", "임대"],
  },
];

// ─────────────────────────────────────────────────────────────
// 게시판 공고: 총 13개(기존 3개 + 10개 추가)
// 오늘 날짜: 2025-10-08 기준 — 당일/2일후/3일후 노출되도록 분배
export const postings: Posting[] = [
  // 당일(2025-10-08)
  {
    id: "r1",
    cat: "rc",
    dong: "춘의동",
    title: "철근/형틀 인원 모집(당일)",
    pay: "일급 18만 + 식대",
    startDate: "2025-10-08",
    createdAt: "2025-10-07",
    summary: "초보 가능 / 장비 일부 제공",
  },
  {
    id: "i2",
    cat: "int",
    dong: "중동",
    title: "중동 내부마감 보조(당일)",
    pay: "일급 16만",
    startDate: "2025-10-08",
    createdAt: "2025-10-08",
    summary: "주차 가능 / 개인장비 지참",
  },
  {
    id: "m2",
    cat: "mech",
    dong: "원미동",
    title: "원미동 설비/배관 조공(당일)",
    pay: "일급 17만",
    startDate: "2025-10-08",
    createdAt: "2025-10-08",
  },

  // 2일후(2025-10-10)
  {
    id: "i1",
    cat: "int",
    dong: "신중동",
    title: "내부마감 인력(2일 후)",
    pay: "일급 16만",
    startDate: "2025-10-10",
    createdAt: "2025-10-07",
  },
  {
    id: "r2",
    cat: "rc",
    dong: "중동",
    title: "형틀 목수 충원(2일 후)",
    pay: "일급 19만 + 숙소",
    startDate: "2025-10-10",
    createdAt: "2025-10-08",
    summary: "야간 가능 / 초보 불가",
  },
  {
    id: "m3",
    cat: "mech",
    dong: "소사동",
    title: "소사동 배관 보조(2일 후)",
    pay: "일급 17만 + 식대",
    startDate: "2025-10-10",
    createdAt: "2025-10-08",
  },

  // 3일후(2025-10-11)
  {
    id: "m1",
    cat: "mech",
    dong: "원미동",
    title: "설비/배관 보조(3일 후)",
    pay: "일급 17만",
    startDate: "2025-10-11",
    createdAt: "2025-10-07",
  },
  {
    id: "r3",
    cat: "rc",
    dong: "춘의동",
    title: "철근 작업반 구인(3일 후)",
    pay: "일급 18만",
    startDate: "2025-10-11",
    createdAt: "2025-10-08",
    summary: "숙소 제공 / 주6일",
  },
  {
    id: "i3",
    cat: "int",
    dong: "신중동",
    title: "도배/도장 보조(3일 후)",
    pay: "일급 15만",
    startDate: "2025-10-11",
    createdAt: "2025-10-08",
  },

  // 추가(카테고리/동 다양화)
  {
    id: "r4",
    cat: "rc",
    dong: "중동",
    title: "콘크리트 타설 지원",
    pay: "일급 18만 + 간식",
    startDate: "2025-10-08",
    createdAt: "2025-10-08",
  },
  {
    id: "i4",
    cat: "int",
    dong: "원미동",
    title: "내부마감 보양 작업",
    pay: "일급 15.5만",
    startDate: "2025-10-10",
    createdAt: "2025-10-08",
  },
  {
    id: "m4",
    cat: "mech",
    dong: "소사동",
    title: "전기 트레이 보조",
    pay: "일급 17.5만",
    startDate: "2025-10-11",
    createdAt: "2025-10-08",
  },
  {
    id: "i5",
    cat: "int",
    dong: "춘의동",
    title: "가구/몰딩 설치 보조",
    pay: "일급 16만",
    startDate: "2025-10-08",
    createdAt: "2025-10-08",
    summary: "개인장비 우대",
  },
];

// ─────────────────────────────────────────────────────────────
// 유틸 함수(그대로)
export function findAccountByUsername(u: string) {
  return accounts.find((a) => a.username === u) || null;
}
export function findAccountById(id: number) {
  return accounts.find((a) => a.id === id) || null;
}
export function setAccountLocation(id: number, lat: number, lng: number) {
  const acc = accounts.find((a) => a.id === id);
  if (!acc) return null;
  acc.lat = lat;
  acc.lng = lng;
  return acc;
}
