// app/page.tsx
import PartnerBanner from "@/components/PartnerBanner";
import BoardBrowser from "@/components/BoardBrowser";
import { isLoggedIn } from "@/lib/auth";

export default async function HomePage() {
  const loggedIn = await isLoggedIn(); // ✅ JWT or 데모 둘 다 허용

  return (
    <div>
      {/* 1) 위: 현장 파트너 광고 */}
      <section style={{ marginTop: 12 }}>
        <PartnerBanner isLoggedIn={loggedIn} />
      </section>

      {/* 2) 아래: 전체/콘크리트/내부마감/설비·전기·배관 게시판 */}
      <section style={{ marginTop: 24 }}>
        <BoardBrowser isLoggedIn={loggedIn} />
      </section>
    </div>
  );
}
