// app/layout.tsx
import "@/styles/globals.css";
import Header from "@/components/Header";
import PartnerBanner from "@/components/PartnerBanner";
import { getServerAccount } from "@/lib/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getServerAccount(); // SSR에서 현재 계정 1회만 조회

  return (
    <html lang="ko">
      <body>
        <Header />
        {/* ★ 레이아웃에 배치: 페이지 전환(쿼리 변경)에도 배너는 유지 */}
        <PartnerBanner account={me} />
        {children}
      </body>
    </html>
  );
}
