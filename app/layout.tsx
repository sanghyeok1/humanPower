// app/layout.tsx
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PartnerBanner from "@/components/PartnerBanner";
import BannerGate from "@/components/BannerGate";
import { getServerAccount } from "@/lib/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getServerAccount(); // SSR 1회

  return (
    <html lang="ko">
      <body>
        <Header />
        {/* 홈(/)에서만 노출. searchParams 변경(동/카테고리/날짜)에도 경로는 "/" → 재마운트 없음 */}
        <BannerGate>
          <PartnerBanner account={me} />
        </BannerGate>

        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
