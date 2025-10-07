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
  id: number;
  name: string;
  address?: string | null;

  // 기본(snake_case)
  logo_url?: string | null;
  link_url?: string | null;
  tags_json?: string[] | null;

  lat: number | string;
  lng: number | string;

  dist_m?: number; // 서버가 미터로 주는 경우
  distanceKm?: number; // 프록시/클라이언트에서 km로 계산한 경우
} & Partial<{
  // 호환용(camelCase) — 선택적
  logoUrl: string | null;
  linkUrl: string | null;
  tags: string[];
}>;

export type PartnerWithDistance = Partner & { distanceKm: number };
