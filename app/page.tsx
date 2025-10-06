// app/page.tsx
import { cookies } from "next/headers";
import BoardBrowser from "@/components/BoardBrowser";
import PartnerBanner from "@/components/PartnerBanner";

export default async function HomePage() {
  const jar = await cookies();
  const isLoggedIn = jar.get("demo_login")?.value === "1";

  return (
    <div>
      {/* 카테고리 칩 + 게시판 (더미데이터) */}
      <section style={{ marginTop: 12 }}>
        <BoardBrowser isLoggedIn={isLoggedIn} />
      </section>

      {/* 위치기반 파트너 배너 */}
      <section style={{ marginTop: 24 }}>
        <PartnerBanner isLoggedIn={isLoggedIn} />
      </section>
    </div>
  );
}
