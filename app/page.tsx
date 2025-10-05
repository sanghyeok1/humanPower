// app/page.tsx
import PartnerBanner from "@/components/PartnerBanner";
import { cookies } from "next/headers";

export default async function HomePage() {
  const jar = await cookies();
  const isLoggedIn = jar.get("demo_login")?.value === "1";

  return (
    <div>
      <section style={{ marginTop: 16 }}>
        <PartnerBanner isLoggedIn={isLoggedIn} />
      </section>
      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>메인 콘텐츠(예시)</h2>
        <p style={{ color: "#555" }}>
          여기에 최근 공고 리스트 등 이어서 붙이면 됩니다.
        </p>
      </section>
    </div>
  );
}
