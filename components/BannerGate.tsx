// components/BannerGate.tsx
"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

/** 현재 경로가 "/"일 때만 children을 보여줍니다. */
export default function BannerGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname !== "/") return null; // 홈이 아니면 숨김
  return <>{children}</>;
}
