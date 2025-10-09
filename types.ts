// types.ts

// ===== 카테고리/게시판 =====
export type CategorySlug = "rebar_form_concrete" | "interior_finish" | "mep";

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  rebar_form_concrete: "철근/형틀/콘크리트",
  interior_finish: "내부마감",
  mep: "설비/전기/배관",
};

// 시작일 필터 그룹
export type StartGroup = "today" | "dayAfterTomorrow" | "plus3";

// 게시글 타입
export type Posting = {
  id: string;
  title: string;
  category: CategorySlug;
  wage_type: "day" | "hour" | "month";
  wage_amount: number;
  address?: string;
  dong?: string; // ← 동 단위 필터용
  start_date?: string; // ← ISO (예: 2025-10-06T00:00:00.000Z)
  flags?: {
    today?: boolean;
    night?: boolean;
    beginner_ok?: boolean;
    lodging?: boolean;
  };
  created_at: string;
  content?: string;
};

// ===== 파트너 배너 =====
export type Partner = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  logoUrl: string;
  linkUrl: string;
  address?: string;
  tags?: string[];
  distanceKm?: number;
};

export type PartnerWithDistance = Partner & { distanceKm: number };

// ===== 구인자 공고 작성 =====
export type WageType = "day" | "hour" | "month";
export type ShiftType = "day" | "night";

export type JobPosting = {
  id: string;
  employer_id: string;
  title: string; // 10-60자
  category: CategorySlug;
  start_date: string; // YYYY-MM-DD
  duration_days?: number;
  estimated_end_date?: string;
  shift_type: ShiftType;
  work_hours?: string; // 예: "08:00-17:00"
  wage_type: WageType;
  wage_amount: number;
  wage_notes?: string; // 세전/식대포함 여부 등
  address_dong: string;
  address_detail: string;
  lat: number;
  lng: number;
  required_positions: string; // 예: "형틀 2, 타설 1"
  contact_name: string;
  contact_phone: string;
  contact_hours?: string; // 통화 가능 시간
  meal_provided?: boolean;
  lodging_provided?: boolean;
  equipment_provided?: boolean;
  preferred_experience_years?: number;
  preferred_certificates?: string[];
  preferred_driver_license?: boolean;
  site_photos?: string[]; // 최대 3장
  additional_notes?: string;
  deadline?: string; // 마감일
  payment_method?: string; // 당일·주급·월급, 계좌/현금
  template_name?: string; // 템플릿 저장용
  created_at: string;
  updated_at: string;
};

// ===== 구직자 프로필/이력서 =====
export type SeekerProfile = {
  id: string;
  user_id: string;
  name: string;
  display_name?: string; // 닉네임
  phone: string;
  base_address_dong: string;
  base_lat: number;
  base_lng: number;
  search_radius_km: number;
  main_category: CategorySlug;
  detailed_skills?: string[]; // 예: ["형틀", "미장", "전기배선"]
  total_experience_years?: number;
  recent_work_history?: WorkHistory[];
  desired_wage_type?: WageType;
  desired_wage_amount?: number;
  available_start_date?: string; // 즉시 또는 날짜
  available_shift?: ShiftType[];
  profile_photo?: string;
  owned_equipment?: string[];
  licenses?: string[]; // 안전교육, 전기기능사, 1종 운전 등
  certificates?: string[]; // 이미지 URL
  introduction?: string; // 한 줄 소개
  rating_average?: number;
  rating_count?: number;
  created_at: string;
  updated_at: string;
};

export type WorkHistory = {
  period: string; // 예: "2024.01 - 2024.06"
  site_name?: string;
  company_name?: string;
  role: string;
  main_tasks?: string;
};

// ===== 구직자 알림 설정 =====
export type SeekerNotificationSettings = {
  user_id: string;
  enabled: boolean;
  radius_km: number;
  start_date_filters: string[]; // ["today", "tomorrow"]
  category_filters: CategorySlug[];
  wage_min?: number;
};
