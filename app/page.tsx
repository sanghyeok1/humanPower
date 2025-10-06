// app/page.tsx
import { cookies } from "next/headers";
import PartnerBanner from "@/components/PartnerBanner";
import BoardBrowser from "@/components/BoardBrowser";

export default async function HomePage() {
  const jar = await cookies();
  const isLoggedIn = jar.get("demo_login")?.value === "1";

  return (
    <div>
      {/* 1) 위: 현장 파트너 광고 */}
      <section style={{ marginTop: 12 }}>
        <PartnerBanner isLoggedIn={isLoggedIn} />
      </section>

      {/* 2) 아래: 전체/콘크리트/내부마감/설비·전기·배관 게시판 */}
      <section style={{ marginTop: 24 }}>
        <BoardBrowser isLoggedIn={isLoggedIn} />
      </section>
    </div>
  );
}
