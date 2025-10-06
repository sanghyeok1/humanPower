// types.ts

// ===== 카테고리/게시판 =====
export type CategorySlug = "rebar_form_concrete" | "interior_finish" | "mep";

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  rebar_form_concrete: "철근/형틀/콘크리트",
  interior_finish: "내부마감",
  mep: "설비/전기/배관",
};

// types.ts (Posting 타입에 content?: string; 추가)
export type Posting = {
  id: string;
  title: string;
  category: "rebar_form_concrete" | "interior_finish" | "mep";
  wage_type: "day" | "hour" | "month";
  wage_amount: number;
  address?: string;
  flags?: {
    today?: boolean;
    night?: boolean;
    beginner_ok?: boolean;
    lodging?: boolean;
  };
  created_at: string;
  content?: string; // ← 추가
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
};

export type PartnerWithDistance = Partner & { distanceKm: number };
