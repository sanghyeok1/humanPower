// app/page.tsx
import PartnerBanner from "@/components/PartnerBanner"; // 클라 컴포넌트지만 그냥 임포트 OK
import { cookies } from "next/headers";
import { CATEGORY_LABELS, type CategorySlug } from "@/types";

const CATS: CategorySlug[] = ["rebar_form_concrete", "interior_finish", "mep"];

export default async function HomePage() {
  const jar = await cookies();
  const isLoggedIn = jar.get("demo_login")?.value === "1";

  return (
    <div>
      <section style={{ marginTop: 12 }}>
        <div className="cat-grid">
          {CATS.map((c) => (
            <a key={c} href={`/board/${c}`} className="cat-card">
              <div className="cat-title">{CATEGORY_LABELS[c]}</div>
              <div className="cat-sub">
                {isLoggedIn ? "최근 공고 보기" : "로그인 후 열람"}
              </div>
            </a>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <PartnerBanner isLoggedIn={isLoggedIn} />
      </section>
    </div>
  );
}
