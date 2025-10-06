// lib/geo.ts
export type LatLng = { lat: number; lng: number };

// 부천시청(기본 좌표)
export const DEFAULT_CENTER: LatLng = { lat: 37.503, lng: 126.766 };

// (옵션) 하버사인 거리 km
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371; // km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
