// app/layout.tsx
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PartnerBanner from "@/components/PartnerBanner";
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
        {/* 페이지 전환(쿼리 변경)에도 마운트 유지 */}
        <PartnerBanner account={me} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
