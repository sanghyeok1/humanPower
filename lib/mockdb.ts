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
  phone_verified?: boolean;

  // Employer 전용
  company_name?: string;
  contact_method?: "phone" | "kakao";

  // Seeker 전용
  nickname?: string; // 닉네임/표시명
  skills?: string[]; // 보유 기술/세부 스킬
  experience_years?: number; // 경력 년수
  recent_work?: string; // 최근 작업
  equipment?: string[]; // 보유 장비
  licenses?: string[]; // 자격증
  work_hours?: "day" | "night" | "both"; // 근무 가능 시간대
  desired_wage_type?: "daily" | "hourly"; // 희망 임금 형태
  desired_wage_amount?: string; // 희망 임금 금액
  available_immediately?: boolean; // 즉시 가능 여부
  available_from?: string; // 가능 날짜 (YYYY-MM-DD)

  // 공통
  lat?: number | null;
  lng?: number | null;
  radius_km?: number;
  preferred_categories?: ("rc" | "int" | "mech")[];
  notifications?: {
    new_applicant?: boolean; // 새 지원 알림 (employer)
    new_message?: boolean; // 메시지 알림
    deadline_reminder?: boolean; // 마감 임박 알림 (employer)
  };
  seeker_notifications?: {
    nearby_postings?: boolean; // 내 반경 내 공고 알림
    category_match?: boolean; // 선호 카테고리 공고 알림
    wage_match?: boolean; // 희망 임금 이상 공고 알림
  };
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

export type PostingTemplate = {
  id: string;
  user_id: number;
  name: string; // 템플릿 이름
  title: string;
  cat: "rc" | "int" | "mech";
  work_period?: string; // 작업 기간
  work_hours?: "day" | "night" | "both"; // 근무시간
  wage_type?: "daily" | "hourly" | "monthly"; // 임금형태
  wage_amount?: string; // 금액
  meals_provided?: boolean; // 식대 제공
  housing_provided?: boolean; // 숙소 제공
  equipment_provided?: boolean; // 장비 제공
  address?: string;
  lat?: number;
  lng?: number;
  required_people?: number; // 필요 인원
  role?: string; // 역할
  summary?: string;
  createdAt: string;
};

export type Applicant = {
  id: string;
  posting_id: string;
  posting_title: string;
  employer_id: number; // 공고 올린 사람
  applicant_id: number; // 지원한 사람
  applicant_name: string;
  applicant_phone: string;
  status: "applied" | "invited" | "accepted" | "pending" | "rejected" | "noshow" | "completed";
  applied_at: string; // ISO datetime
  notes?: string; // 메모
  call_logs?: CallLog[];
  is_favorite?: boolean; // 즐겨찾기
  is_blacklist?: boolean; // 블랙리스트
};

export type CallLog = {
  timestamp: string; // ISO datetime
  note: string;
};

export type Rating = {
  id: string;
  employer_id: number; // 평가 작성자
  worker_name: string; // 작업자 이름
  worker_id?: number; // 작업자 ID (선택)
  posting_title: string; // 공고 제목
  rating: 1 | 2 | 3 | 4 | 5; // 별점
  comment?: string; // 코멘트
  work_date: string; // 작업일 (YYYY-MM-DD)
  is_public: boolean; // 공개 여부 (추후 공개 전환 대비)
  created_at: string; // ISO datetime
};

export type Application = {
  id: number;
  seeker_id: number;
  posting_id: number;
  posting_title: string;
  posting_category: string;
  posting_pay: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  applied_at: string;
  type: "applied" | "invited";
};

export type SavedPosting = {
  id: number;
  seeker_id: number;
  posting_id: number;
  posting_title: string;
  posting_category: string;
  posting_pay: string;
  posting_start_date: string;
  saved_at: string;
};

export type ViewHistory = {
  id: number;
  seeker_id: number;
  posting_id: number;
  posting_title: string;
  posting_category: string;
  posting_pay: string;
  viewed_at: string;
};

export type ReceivedRating = {
  id: number;
  seeker_id: number;
  employer_name: string;
  stars: number;
  comment: string;
  work_date: string;
  created_at: string;
};

export type CompletionRecord = {
  id: number;
  seeker_id: number;
  posting_title: string;
  posting_category: string;
  work_date: string;
  pay: string;
  status: "completed" | "cancelled";
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
// 랜덤 좌표 생성 함수 (부천 중심 기준 반경 10km 내)
const BUCHEON_CENTER = { lat: 37.503, lng: 126.766 };

function randomCoordInRadius(
  centerLat: number,
  centerLng: number,
  radiusKm: number
): { lat: number; lng: number } {
  // 1도 ≈ 111km
  const deltaLat = (radiusKm / 111) * (Math.random() * 2 - 1);
  const deltaLng =
    (radiusKm / (111 * Math.cos((centerLat * Math.PI) / 180))) *
    (Math.random() * 2 - 1);
  return {
    lat: centerLat + deltaLat,
    lng: centerLng + deltaLng,
  };
}

// ─────────────────────────────────────────────────────────────
// 파트너 광고: 총 12개(기존 2개 + 10개 추가)
// 좌표는 서버 시작마다 랜덤 생성 (부천 중심 반경 10km 내)
const partnersBase = [
  {
    id: 1,
    name: "OO공구상",
    address: "부천시 춘의동 123",
    link_url: "https://example.com",
    tags_json: ["공구상", "자재"],
  },
  {
    id: 2,
    name: "XX자재상",
    address: "부천시 신중동 45",
    link_url: "https://example.com",
    tags_json: ["자재"],
  },
  {
    id: 3,
    name: "부천철물마트",
    address: "부천시 중동 101",
    link_url: "https://example.com",
    tags_json: ["철물", "공구"],
  },
  {
    id: 4,
    name: "대성공구백화점",
    address: "부천시 원미동 22",
    link_url: "https://example.com",
    tags_json: ["공구", "장비대여"],
  },
  {
    id: 5,
    name: "신중동자재마트",
    address: "부천시 신중동 210",
    link_url: "https://example.com",
    tags_json: ["자재", "목자재"],
  },
  {
    id: 6,
    name: "소사자재창고",
    address: "부천시 소사동 88",
    link_url: "https://example.com",
    tags_json: ["자재", "단가상담"],
  },
  {
    id: 7,
    name: "중동배관센터",
    address: "부천시 중동 330",
    link_url: "https://example.com",
    tags_json: ["배관", "설비"],
  },
  {
    id: 8,
    name: "춘의타일상사",
    address: "부천시 춘의동 55",
    link_url: "https://example.com",
    tags_json: ["타일", "내부마감"],
  },
  {
    id: 9,
    name: "원미페인트",
    address: "부천시 원미동 77",
    link_url: "https://example.com",
    tags_json: ["페인트", "내부"],
  },
  {
    id: 10,
    name: "중동전기자재",
    address: "부천시 중동 12",
    link_url: "https://example.com",
    tags_json: ["전기", "자재"],
  },
  {
    id: 11,
    name: "신중동용접자재",
    address: "부천시 신중동 311",
    link_url: "https://example.com",
    tags_json: ["용접", "보호구"],
  },
  {
    id: 12,
    name: "소사전동공구",
    address: "부천시 소사동 199",
    link_url: "https://example.com",
    tags_json: ["전동공구", "임대"],
  },
];

export const partners: Partner[] = partnersBase.map((p) => {
  const coords = randomCoordInRadius(
    BUCHEON_CENTER.lat,
    BUCHEON_CENTER.lng,
    10
  );
  return { ...p, lat: coords.lat, lng: coords.lng };
});

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
  // 추가 17개 (총 30개)
  {
    id: "r5",
    cat: "rc",
    dong: "신중동",
    title: "철근 배근 보조",
    pay: "일급 17.5만",
    startDate: "2025-10-09",
    createdAt: "2025-10-08",
  },
  {
    id: "i6",
    cat: "int",
    dong: "중동",
    title: "벽지 시공 보조",
    pay: "일급 15만",
    startDate: "2025-10-09",
    createdAt: "2025-10-08",
  },
  {
    id: "m5",
    cat: "mech",
    dong: "원미동",
    title: "덕트 설치 보조",
    pay: "일급 17만",
    startDate: "2025-10-09",
    createdAt: "2025-10-08",
  },
  {
    id: "r6",
    cat: "rc",
    dong: "소사동",
    title: "거푸집 해체 작업",
    pay: "일급 18만",
    startDate: "2025-10-12",
    createdAt: "2025-10-08",
  },
  {
    id: "i7",
    cat: "int",
    dong: "춘의동",
    title: "타일 시공 기능공",
    pay: "일급 20만",
    startDate: "2025-10-12",
    createdAt: "2025-10-08",
  },
  {
    id: "m6",
    cat: "mech",
    dong: "신중동",
    title: "소방 배관 작업",
    pay: "일급 18.5만",
    startDate: "2025-10-12",
    createdAt: "2025-10-08",
  },
  {
    id: "r7",
    cat: "rc",
    dong: "중동",
    title: "레미콘 타설 지원",
    pay: "일급 17만",
    startDate: "2025-10-13",
    createdAt: "2025-10-08",
  },
  {
    id: "i8",
    cat: "int",
    dong: "원미동",
    title: "석고보드 시공",
    pay: "일급 16.5만",
    startDate: "2025-10-13",
    createdAt: "2025-10-08",
  },
  {
    id: "m7",
    cat: "mech",
    dong: "소사동",
    title: "전기 케이블 포설",
    pay: "일급 17.5만",
    startDate: "2025-10-13",
    createdAt: "2025-10-08",
  },
  {
    id: "r8",
    cat: "rc",
    dong: "춘의동",
    title: "슬라브 철근 조립",
    pay: "일급 19만",
    startDate: "2025-10-14",
    createdAt: "2025-10-08",
  },
  {
    id: "i9",
    cat: "int",
    dong: "신중동",
    title: "바닥 마감재 시공",
    pay: "일급 16만",
    startDate: "2025-10-14",
    createdAt: "2025-10-08",
  },
  {
    id: "m8",
    cat: "mech",
    dong: "중동",
    title: "냉난방 배관 작업",
    pay: "일급 18만",
    startDate: "2025-10-14",
    createdAt: "2025-10-08",
  },
  {
    id: "r9",
    cat: "rc",
    dong: "원미동",
    title: "기둥 철근 배근",
    pay: "일급 18.5만",
    startDate: "2025-10-15",
    createdAt: "2025-10-08",
  },
  {
    id: "i10",
    cat: "int",
    dong: "소사동",
    title: "천장 마감 작업",
    pay: "일급 15.5만",
    startDate: "2025-10-15",
    createdAt: "2025-10-08",
  },
  {
    id: "m9",
    cat: "mech",
    dong: "춘의동",
    title: "전기 판넬 설치",
    pay: "일급 19만",
    startDate: "2025-10-15",
    createdAt: "2025-10-08",
  },
  {
    id: "r10",
    cat: "rc",
    dong: "신중동",
    title: "외벽 거푸집 조립",
    pay: "일급 18만",
    startDate: "2025-10-16",
    createdAt: "2025-10-08",
  },
  {
    id: "i11",
    cat: "int",
    dong: "중동",
    title: "주방 싱크대 설치",
    pay: "일급 17만",
    startDate: "2025-10-16",
    createdAt: "2025-10-08",
  },
];

// ─────────────────────────────────────────────────────────────
// 공고 템플릿 (in-memory)
export const templates: PostingTemplate[] = [];

// ─────────────────────────────────────────────────────────────
// 평가 데이터 (in-memory)
export const ratings: Rating[] = [
  {
    id: "rating_1",
    employer_id: 3, // employer01
    worker_name: "구직자A",
    worker_id: 1,
    posting_title: "철근 배근 보조",
    rating: 5,
    comment: "성실하고 꼼꼼함. 다음에도 함께 일하고 싶음",
    work_date: "2025-10-05",
    is_public: false,
    created_at: "2025-10-05T18:00:00",
  },
  {
    id: "rating_2",
    employer_id: 3,
    worker_name: "구직자B",
    worker_id: 2,
    posting_title: "내부마감 보조",
    rating: 4,
    comment: "작업 속도는 빠르나 마감이 조금 거침",
    work_date: "2025-10-03",
    is_public: false,
    created_at: "2025-10-03T19:30:00",
  },
];

// ─────────────────────────────────────────────────────────────
// 구직자 지원 내역 (in-memory)
export const applications: Application[] = [
  {
    id: 1,
    seeker_id: 1, // seeker01
    posting_id: 1,
    posting_title: "철근/형틀 인원 모집(당일)",
    posting_category: "철근/형틀/콘크리트",
    posting_pay: "일급 18만원",
    status: "pending",
    applied_at: "2025-10-08T09:00:00",
    type: "applied",
  },
  {
    id: 2,
    seeker_id: 1,
    posting_id: 2,
    posting_title: "내부마감 인력(2일 후)",
    posting_category: "내부마감",
    posting_pay: "일급 17만원",
    status: "accepted",
    applied_at: "2025-10-07T15:30:00",
    type: "applied",
  },
  {
    id: 3,
    seeker_id: 1,
    posting_id: 3,
    posting_title: "설비 작업 보조",
    posting_category: "설비/전기/배관",
    posting_pay: "일급 16만원",
    status: "pending",
    applied_at: "2025-10-08T11:00:00",
    type: "invited",
  },
];

// 찜한 공고 (in-memory)
export const savedPostings: SavedPosting[] = [
  {
    id: 1,
    seeker_id: 1,
    posting_id: 4,
    posting_title: "설비/배관 보조(3일 후)",
    posting_category: "설비/전기/배관",
    posting_pay: "일급 16만원",
    posting_start_date: "2025-10-12",
    saved_at: "2025-10-08T10:00:00",
  },
  {
    id: 2,
    seeker_id: 1,
    posting_id: 5,
    posting_title: "철근 배근 작업",
    posting_category: "철근/형틀/콘크리트",
    posting_pay: "일급 19만원",
    posting_start_date: "2025-10-11",
    saved_at: "2025-10-07T14:20:00",
  },
];

// 최근 본 공고 (in-memory)
export const viewHistory: ViewHistory[] = [
  {
    id: 1,
    seeker_id: 1,
    posting_id: 1,
    posting_title: "철근/형틀 인원 모집(당일)",
    posting_category: "철근/형틀/콘크리트",
    posting_pay: "일급 18만원",
    viewed_at: "2025-10-08T08:45:00",
  },
  {
    id: 2,
    seeker_id: 1,
    posting_id: 2,
    posting_title: "중동 내부마감 보조(당일)",
    posting_category: "내부마감",
    posting_pay: "일급 17만원",
    viewed_at: "2025-10-08T08:30:00",
  },
  {
    id: 3,
    seeker_id: 1,
    posting_id: 6,
    posting_title: "전기 배선 작업",
    posting_category: "설비/전기/배관",
    posting_pay: "시급 2만원",
    viewed_at: "2025-10-07T18:15:00",
  },
];

// 구직자가 받은 평가 (in-memory)
export const receivedRatings: ReceivedRating[] = [
  {
    id: 1,
    seeker_id: 1,
    employer_name: "현장소장A",
    stars: 5,
    comment: "작업 속도가 빠르고 성실합니다. 다음에도 함께 일하고 싶습니다.",
    work_date: "2025-10-05",
    created_at: "2025-10-05T18:30:00",
  },
  {
    id: 2,
    seeker_id: 1,
    employer_name: "○○건설 김대리",
    stars: 4,
    comment: "경험이 많아 작업이 매끄러웠습니다.",
    work_date: "2025-10-03",
    created_at: "2025-10-03T20:00:00",
  },
  {
    id: 3,
    seeker_id: 1,
    employer_name: "부천건설",
    stars: 5,
    comment: "시간 약속 잘 지키시고 작업도 꼼꼼합니다.",
    work_date: "2025-09-28",
    created_at: "2025-09-28T19:00:00",
  },
];

// 구직자 작업 완료 이력 (in-memory)
export const completionRecords: CompletionRecord[] = [
  {
    id: 1,
    seeker_id: 1,
    posting_title: "철근 배근 작업",
    posting_category: "철근/형틀/콘크리트",
    work_date: "2025-10-05",
    pay: "일급 18만원",
    status: "completed",
  },
  {
    id: 2,
    seeker_id: 1,
    posting_title: "내부마감 보조",
    posting_category: "내부마감",
    work_date: "2025-10-03",
    pay: "일급 17만원",
    status: "completed",
  },
  {
    id: 3,
    seeker_id: 1,
    posting_title: "배관 설치 작업",
    posting_category: "설비/전기/배관",
    work_date: "2025-09-28",
    pay: "일급 16만원",
    status: "completed",
  },
  {
    id: 4,
    seeker_id: 1,
    posting_title: "형틀 작업",
    posting_category: "철근/형틀/콘크리트",
    work_date: "2025-09-25",
    pay: "일급 18만원",
    status: "cancelled",
  },
];

// ─────────────────────────────────────────────────────────────
// 지원자 데이터 (in-memory)
export const applicants: Applicant[] = [
  {
    id: "app_1",
    posting_id: "p1",
    posting_title: "철근 배근 보조 구함",
    employer_id: 3, // employer01
    applicant_id: 1, // seeker01
    applicant_name: "구직자A",
    applicant_phone: "010-1234-5678",
    status: "applied",
    applied_at: "2025-10-08T14:30:00",
    notes: "경력 3년, 철근 배근 전문",
  },
  {
    id: "app_2",
    posting_id: "p2",
    posting_title: "내부마감 보조",
    employer_id: 3,
    applicant_id: 2, // seeker02
    applicant_name: "구직자B",
    applicant_phone: "010-2345-6789",
    status: "accepted",
    applied_at: "2025-10-07T10:15:00",
    notes: "성실함, 이전에 함께 작업한 적 있음",
    is_favorite: true,
  },
  {
    id: "app_3",
    posting_id: "p1",
    posting_title: "철근 배근 보조 구함",
    employer_id: 3,
    applicant_id: 4, // qmffhrskfk13
    applicant_name: "나상혁",
    applicant_phone: "010-6377-9454",
    status: "pending",
    applied_at: "2025-10-08T16:20:00",
    call_logs: [
      {
        timestamp: "2025-10-08T17:00:00",
        note: "통화 완료. 내일 아침 8시 현장 집합 가능",
      },
    ],
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

export function updateAccountProfile(
  id: number,
  updates: Partial<
    Pick<
      Account,
      | "display_name"
      | "phone"
      | "phone_verified"
      | "company_name"
      | "contact_method"
      | "radius_km"
      | "preferred_categories"
    >
  >
) {
  const acc = accounts.find((a) => a.id === id);
  if (!acc) return null;
  Object.assign(acc, updates);
  return acc;
}

// 템플릿 유틸
export function getTemplatesByUserId(userId: number) {
  return templates.filter((t) => t.user_id === userId);
}

export function createTemplate(data: Omit<PostingTemplate, "id" | "createdAt">) {
  const newTemplate: PostingTemplate = {
    ...data,
    id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  templates.push(newTemplate);
  return newTemplate;
}

export function updateTemplate(id: string, userId: number, updates: Partial<PostingTemplate>) {
  const tpl = templates.find((t) => t.id === id && t.user_id === userId);
  if (!tpl) return null;
  Object.assign(tpl, updates);
  return tpl;
}

export function deleteTemplate(id: string, userId: number) {
  const idx = templates.findIndex((t) => t.id === id && t.user_id === userId);
  if (idx === -1) return false;
  templates.splice(idx, 1);
  return true;
}

export function getTemplateById(id: string, userId: number) {
  return templates.find((t) => t.id === id && t.user_id === userId) || null;
}

// 지원자 유틸
export function getApplicantsByEmployerId(employerId: number) {
  return applicants.filter((a) => a.employer_id === employerId);
}

export function updateApplicantStatus(
  id: string,
  employerId: number,
  status: Applicant["status"]
) {
  const app = applicants.find((a) => a.id === id && a.employer_id === employerId);
  if (!app) return null;
  app.status = status;
  return app;
}

export function updateApplicantNotes(id: string, employerId: number, notes: string) {
  const app = applicants.find((a) => a.id === id && a.employer_id === employerId);
  if (!app) return null;
  app.notes = notes;
  return app;
}

export function addCallLog(id: string, employerId: number, log: CallLog) {
  const app = applicants.find((a) => a.id === id && a.employer_id === employerId);
  if (!app) return null;
  if (!app.call_logs) app.call_logs = [];
  app.call_logs.push(log);
  return app;
}

export function toggleApplicantFavorite(id: string, employerId: number) {
  const app = applicants.find((a) => a.id === id && a.employer_id === employerId);
  if (!app) return null;
  app.is_favorite = !app.is_favorite;
  return app;
}

export function toggleApplicantBlacklist(id: string, employerId: number) {
  const app = applicants.find((a) => a.id === id && a.employer_id === employerId);
  if (!app) return null;
  app.is_blacklist = !app.is_blacklist;
  return app;
}

export function getFavoriteApplicants(employerId: number) {
  return applicants.filter((a) => a.employer_id === employerId && a.is_favorite);
}

export function getBlacklistApplicants(employerId: number) {
  return applicants.filter((a) => a.employer_id === employerId && a.is_blacklist);
}

// 알림 설정 유틸
export function updateNotificationSettings(
  id: number,
  settings: {
    new_applicant?: boolean;
    new_message?: boolean;
    deadline_reminder?: boolean;
  }
) {
  const acc = accounts.find((a) => a.id === id);
  if (!acc) return null;
  acc.notifications = { ...acc.notifications, ...settings };
  return acc;
}

// 평가 유틸
export function getRatingsByEmployerId(employerId: number) {
  return ratings.filter((r) => r.employer_id === employerId);
}

export function createRating(data: Omit<Rating, "id" | "created_at">) {
  const newRating: Rating = {
    ...data,
    id: `rating_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    created_at: new Date().toISOString(),
  };
  ratings.push(newRating);
  return newRating;
}

export function updateRating(id: string, employerId: number, updates: Partial<Rating>) {
  const rating = ratings.find((r) => r.id === id && r.employer_id === employerId);
  if (!rating) return null;
  Object.assign(rating, updates);
  return rating;
}

export function deleteRating(id: string, employerId: number) {
  const idx = ratings.findIndex((r) => r.id === id && r.employer_id === employerId);
  if (idx === -1) return false;
  ratings.splice(idx, 1);
  return true;
}

export function getRatingById(id: string, employerId: number) {
  return ratings.find((r) => r.id === id && r.employer_id === employerId) || null;
}

// 구직자 지원 내역 유틸
export function getApplicationsBySeekerId(seekerId: number) {
  return applications.filter((a) => a.seeker_id === seekerId);
}

export function getSavedPostingsBySeekerId(seekerId: number) {
  return savedPostings.filter((s) => s.seeker_id === seekerId);
}

export function getViewHistoryBySeekerId(seekerId: number) {
  return viewHistory.filter((v) => v.seeker_id === seekerId);
}

// 구직자가 받은 평가 조회
export function getRatingsByWorkerId(workerId: number) {
  return ratings.filter((r) => r.worker_id === workerId);
}

// ─────────────────────────────────────────────────────────────
// 구인자 공고 (JobPosting)
export type JobPosting = {
  id: string;
  employer_id: number;
  title: string;
  category: "rebar_form_concrete" | "interior_finish" | "mep";
  start_date: string;
  duration_days?: number;
  estimated_end_date?: string;
  shift_type: "day" | "night";
  work_hours?: string;
  wage_type: "day" | "hour" | "month";
  wage_amount: number;
  wage_notes?: string;
  address_dong: string;
  address_detail: string;
  lat: number;
  lng: number;
  required_positions: string;
  contact_name: string;
  contact_phone: string;
  contact_hours?: string;
  meal_provided?: boolean;
  lodging_provided?: boolean;
  equipment_provided?: boolean;
  preferred_experience_years?: number;
  preferred_certificates?: string[];
  preferred_driver_license?: boolean;
  site_photos?: string[];
  additional_notes?: string;
  deadline?: string;
  payment_method?: string;
  template_name?: string;
  created_at: string;
  updated_at: string;
};

export const jobPostings: JobPosting[] = [
  {
    id: "jp1",
    employer_id: 3,
    title: "철근/형틀 작업자 급구 (경력자 우대)",
    category: "rebar_form_concrete",
    start_date: "2025-10-09",
    duration_days: 30,
    shift_type: "day",
    work_hours: "08:00-17:00",
    wage_type: "day",
    wage_amount: 200000,
    wage_notes: "세전, 식대 포함",
    address_dong: "춘의동",
    address_detail: "춘의동 123-45 신축현장",
    lat: 37.503,
    lng: 126.766,
    required_positions: "철근 2명, 형틀 2명",
    contact_name: "현장소장A",
    contact_phone: "010-1234-5678",
    contact_hours: "08:00-18:00",
    meal_provided: true,
    lodging_provided: false,
    equipment_provided: true,
    preferred_experience_years: 3,
    preferred_certificates: ["안전교육 수료"],
    preferred_driver_license: false,
    additional_notes: "안전모, 안전화 필수 지참. 현장 집결 시간 07:50",
    payment_method: "주급, 계좌이체",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "jp2",
    employer_id: 3,
    title: "내부마감 보조 2명 모집 (초보 가능)",
    category: "interior_finish",
    start_date: "2025-10-10",
    shift_type: "day",
    work_hours: "09:00-18:00",
    wage_type: "day",
    wage_amount: 150000,
    address_dong: "신중동",
    address_detail: "신중동 789 아파트 현장",
    lat: 37.508,
    lng: 126.77,
    required_positions: "석고보드 보조 2명",
    contact_name: "현장소장A",
    contact_phone: "010-1234-5678",
    meal_provided: true,
    additional_notes: "초보자도 현장 교육 후 작업 가능",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
