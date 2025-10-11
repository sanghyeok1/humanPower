// lib/mockdb.ts - 임시 더미 데이터 (Express 백엔드 사용 권장)
// 주의: 대부분의 데이터는 이제 MySQL DB에 저장됩니다.
// 이 파일은 아직 Express로 마이그레이션 안된 Next.js API 라우트를 위한 임시 파일입니다.

export type Account = {
  id: number;
  role: "seeker" | "employer";
  username: string;
  password: string;
  display_name: string;
  phone?: string;
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
  dong: string;
  title: string;
  pay: string;
  startDate: string;
  createdAt: string;
  summary?: string;
};

// 빈 배열 (Express 백엔드 사용)
export const accounts: Account[] = [];
export const partners: Partner[] = [];
export const postings: Posting[] = [];
export const jobPostings: any[] = []; // JobPosting 타입이 필요하면 추가
export const chatRooms: any[] = [];
export const chatMessages: any[] = [];

// 유틸 함수들
export function findAccountByUsername(u: string) {
  return accounts.find((a) => a.username === u) || null;
}

export function findAccountById(id: number) {
  return accounts.find((a) => a.id === id) || null;
}

// 기타 필요한 타입/함수들은 백엔드 API 사용 권장
