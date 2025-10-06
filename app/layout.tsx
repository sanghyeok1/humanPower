import "../styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReactNode } from "react";

export const metadata = {
  title: "오늘 일감 – 부천",
  description: "동 단위 현장 파트너 광고 데모",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main style={{ maxWidth: 960, margin: "0 auto", padding: "16px" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
