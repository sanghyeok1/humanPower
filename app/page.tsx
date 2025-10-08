import { getServerAccount } from "@/lib/auth";
import PartnerBanner from "@/components/PartnerBanner";

export default async function HomePage() {
  const me = await getServerAccount(); // SSR
  return (
    <main>
      <PartnerBanner account={me} />
      {/* 여기 아래에 게시판 등 메인 콘텐츠 */}
    </main>
  );
}
