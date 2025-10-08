// lib/mockdb.ts
export type Account = {
  id: number;
  role: "seeker" | "employer";
  username: string;
  password: string; // 데모용. 실제로는 hash 쓰세요.
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
  dong: "춘의동" | "신중동" | "원미동" | "소사동";
  title: string;
  pay: string;
  startDate: string; // YYYY-MM-DD
  createdAt: string;
  summary?: string;
};

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
  // 깃 코멘트에 있던 사용자 예시(원하면 추가)
  {
    id: 4,
    role: "seeker",
    username: "qmffhrskfk13",
    password: "1111",
    display_name: "나상혁",
    phone: "01063779454",
  },
];

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
];

export const postings: Posting[] = [
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
    id: "i1",
    cat: "int",
    dong: "신중동",
    title: "내부마감 인력(3일 후)",
    pay: "일급 16만",
    startDate: "2025-10-11",
    createdAt: "2025-10-07",
  },
  {
    id: "m1",
    cat: "mech",
    dong: "원미동",
    title: "설비/배관 보조(내일)",
    pay: "일급 17만",
    startDate: "2025-10-09",
    createdAt: "2025-10-07",
  },
];

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
