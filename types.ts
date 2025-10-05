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
