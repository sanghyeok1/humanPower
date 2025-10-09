// app/mypage/page.tsx
import { getServerAccount } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileEditForm from "@/components/ProfileEditForm";
import TemplateManager from "@/components/TemplateManager";
import ApplicantManager from "@/components/ApplicantManager";
import NotificationSettings from "@/components/NotificationSettings";
import RatingManager from "@/components/RatingManager";
import SeekerProfileForm from "@/components/SeekerProfileForm";
import ApplicationsManager from "@/components/ApplicationsManager";
import SavedPostingsManager from "@/components/SavedPostingsManager";
import SeekerNotificationSettings from "@/components/SeekerNotificationSettings";
import SeekerReputation from "@/components/SeekerReputation";
import ResumeManager from "@/components/ResumeManager";
import PostingsManager from "@/components/PostingsManager";

type EmployerTab = "profile" | "postings" | "applicants" | "notifications" | "ratings" | "templates";
type SeekerTab = "profile" | "resumes" | "applications" | "saved" | "notifications" | "reputation";

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const me = await getServerAccount();
  if (!me) redirect("/login");

  const sp = await searchParams;
  const tab = sp?.tab ?? "profile";

  // 역할에 따라 다른 UI 표시
  if (me.role === "employer") {
    return <EmployerMyPage account={me} tab={tab as EmployerTab} />;
  } else {
    return <SeekerMyPage account={me} tab={tab as SeekerTab} />;
  }
}

// ========== 고용주용 마이페이지 ==========
function EmployerMyPage({ account, tab }: { account: any; tab: EmployerTab }) {
  return (
    <main className="page">
      <div className="board">
        <h1 className="page-title">마이페이지 (고용주)</h1>

        <div className="tabs" style={{ marginBottom: 20 }}>
          <Link href="/mypage?tab=profile" className={`tab ${tab === "profile" ? "active" : ""}`}>프로필</Link>
          <Link href="/mypage?tab=postings" className={`tab ${tab === "postings" ? "active" : ""}`}>공고 관리</Link>
          <Link href="/mypage?tab=applicants" className={`tab ${tab === "applicants" ? "active" : ""}`}>지원자 관리</Link>
          <Link href="/mypage?tab=notifications" className={`tab ${tab === "notifications" ? "active" : ""}`}>알림 설정</Link>
          <Link href="/mypage?tab=ratings" className={`tab ${tab === "ratings" ? "active" : ""}`}>평가 관리</Link>
        </div>

        {tab === "profile" && <ProfileTab account={account} />}
        {tab === "postings" && <PostingsManager />}
        {tab === "templates" && <TemplateManager />}
        {tab === "applicants" && <ApplicantManager />}
        {tab === "notifications" && <NotificationsTab account={account} />}
        {tab === "ratings" && <RatingManager />}
      </div>
    </main>
  );
}

// ========== 구직자용 마이페이지 ==========
function SeekerMyPage({ account, tab }: { account: any; tab: SeekerTab }) {
  return (
    <main className="page">
      <div className="board">
        <h1 className="page-title">마이페이지 (구직자)</h1>

        <div className="tabs" style={{ marginBottom: 20 }}>
          <Link href="/mypage?tab=profile" className={`tab ${tab === "profile" ? "active" : ""}`}>프로필</Link>
          <Link href="/mypage?tab=resumes" className={`tab ${tab === "resumes" ? "active" : ""}`}>이력서 관리</Link>
          <Link href="/mypage?tab=applications" className={`tab ${tab === "applications" ? "active" : ""}`}>지원 현황</Link>
          <Link href="/mypage?tab=saved" className={`tab ${tab === "saved" ? "active" : ""}`}>저장/추천</Link>
          <Link href="/mypage?tab=notifications" className={`tab ${tab === "notifications" ? "active" : ""}`}>알림 설정</Link>
          <Link href="/mypage?tab=reputation" className={`tab ${tab === "reputation" ? "active" : ""}`}>평판</Link>
        </div>

        {tab === "profile" && <SeekerProfileTab account={account} />}
        {tab === "resumes" && <SeekerResumesTab />}
        {tab === "applications" && <SeekerApplicationsTab />}
        {tab === "saved" && <SeekerSavedTab />}
        {tab === "notifications" && <SeekerNotificationsTab account={account} />}
        {tab === "reputation" && <SeekerReputationTab />}
      </div>
    </main>
  );
}

// ========== 구직자 이력서 관리 탭 ==========
function SeekerResumesTab() {
  return (
    <div className="card">
      <ResumeManager />
    </div>
  );
}

// ========== 구직자 프로필 탭 ==========
function SeekerProfileTab({ account }: { account: any }) {
  return (
    <div className="card">
      <SeekerProfileForm initialData={{
        display_name: account.display_name,
        phone: account.phone,
        nickname: account.nickname,
        skills: account.skills,
        experience_years: account.experience_years,
        recent_work: account.recent_work,
        equipment: account.equipment,
        licenses: account.licenses,
        work_hours: account.work_hours,
        desired_wage_type: account.desired_wage_type,
        desired_wage_amount: account.desired_wage_amount,
        available_immediately: account.available_immediately,
        available_from: account.available_from,
        radius_km: account.radius_km,
        preferred_categories: account.preferred_categories,
      }} />
    </div>
  );
}

// ========== 구직자 지원 현황 탭 ==========
function SeekerApplicationsTab() {
  return (
    <div className="card">
      <ApplicationsManager />
    </div>
  );
}

// ========== 구직자 저장/추천 탭 ==========
function SeekerSavedTab() {
  return (
    <div className="card">
      <SavedPostingsManager />
    </div>
  );
}

// ========== 구직자 알림 설정 탭 ==========
function SeekerNotificationsTab({ account }: { account: any }) {
  const initialSettings = {
    nearby_postings: account.seeker_notifications?.nearby_postings ?? true,
    category_match: account.seeker_notifications?.category_match ?? true,
    wage_match: account.seeker_notifications?.wage_match ?? false,
  };

  return (
    <div className="card">
      <SeekerNotificationSettings initialSettings={initialSettings} />
    </div>
  );
}

// ========== 구직자 평판 탭 ==========
function SeekerReputationTab() {
  return (
    <div className="card">
      <SeekerReputation />
    </div>
  );
}

// ============ 프로필 탭 ============
function ProfileTab({ account }: { account: any }) {
  const initialData = {
    display_name: account.display_name || "",
    phone: account.phone || "",
    company_name: account.company_name || "",
    contact_method: (account.contact_method || "phone") as "phone" | "kakao",
    radius_km: account.radius_km || 5,
    preferred_categories: account.preferred_categories || [],
  };

  return (
    <div className="card">
      <h3 className="card-title">프로필 정보</h3>
      <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
        기본 정보와 활동 지역, 선호 카테고리를 설정하세요.
      </p>

      <ProfileEditForm initialData={initialData} />

      {/* 기본 활동 지역 표시 */}
      <div
        className="notice"
        style={{ marginTop: 16 }}
      >
        <strong>현재 저장된 위치:</strong>{" "}
        {account.lat && account.lng
          ? `위도 ${account.lat.toFixed(5)}, 경도 ${account.lng.toFixed(5)}`
          : "미설정 (헤더에서 '내 위치 저장' 클릭)"}
      </div>
    </div>
  );
}


// ============ 알림 설정 탭 ============
function NotificationsTab({ account }: { account: any }) {
  const initialSettings = {
    new_applicant: account.notifications?.new_applicant ?? true,
    new_message: account.notifications?.new_message ?? true,
    deadline_reminder: account.notifications?.deadline_reminder ?? false,
  };

  return <NotificationSettings initialSettings={initialSettings} />;
}

