// app/post/[id]/page.tsx
import { getServerAccount } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { CATEGORY_LABELS } from "@/types";
import ApplyButton from "@/components/ApplyButton";
import SaveButton from "@/components/SaveButton";
import ChatButton from "@/components/ChatButton";
import PostingDetailActions from "@/components/PostingDetailActions";

// 백엔드에서 공고 상세 정보 가져오기
async function fetchPosting(id: string) {
  try {
    const res = await fetch(`${process.env.API_BASE}/api/postings/${id}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.posting || null;
  } catch (error) {
    console.error('Failed to fetch posting:', error);
    return null;
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getServerAccount();
  const { id } = await params;

  // 백엔드에서 공고 상세 정보 가져오기
  const jobPost = await fetchPosting(id);

  if (!jobPost) notFound();

  // 미로그인 → 로그인으로
  if (!me) {
    redirect(`/login?returnTo=${encodeURIComponent(`/post/${id}`)}`);
  }

  // 공고 상세 표시
    const categoryLabel = CATEGORY_LABELS[jobPost.category] || jobPost.category;
    const wageTypeLabel =
      jobPost.wage_type === "day"
        ? "일급"
        : jobPost.wage_type === "hour"
        ? "시급"
        : "월급";
    const shiftLabel = jobPost.shift_type === "day" ? "주간" : jobPost.shift_type === "night" ? "야간" : "주간";

    // TODO: postings 테이블에 employer_id 추가 필요
    // 임시로 employer만 수정/삭제 가능하도록 처리
    const isOwner = me.role === "employer";

    return (
      <main style={{ maxWidth: 800, margin: "24px auto", padding: "0 16px" }}>
        <a href="/" className="btn" style={{ marginBottom: 12 }}>
          ← 목록으로
        </a>

        <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 16 }}>
          {jobPost.title}
        </h1>

        <div
          style={{
            color: "#6b7280",
            marginTop: 8,
            fontSize: 14,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span>📁 {categoryLabel}</span>
          <span>📍 {jobPost.dong || jobPost.address_dong || "부천시"}</span>
          <span>📅 시작일: {jobPost.start_date}</span>
          {jobPost.shift_type && <span>🕐 {shiftLabel}</span>}
        </div>

        {/* 임금 정보 */}
        <div
          style={{
            border: "2px solid #3b82f6",
            borderRadius: 12,
            padding: 20,
            marginTop: 20,
            background: "#eff6ff",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1e40af" }}>
            💰 {wageTypeLabel} {jobPost.wage_amount.toLocaleString()}원
          </div>
          {jobPost.wage_notes && (
            <div style={{ marginTop: 6, fontSize: 14, color: "#374151" }}>
              {jobPost.wage_notes}
            </div>
          )}
        </div>

        {/* 주요 정보 */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 20,
            marginTop: 16,
            display: "grid",
            gap: 12,
          }}
        >
          {jobPost.required_positions && (
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>📋 필요 인원</div>
            <div>{jobPost.required_positions}</div>
          </div>
          )}

          {jobPost.duration_days && (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>📆 작업 기간</div>
              <div>{jobPost.duration_days}일</div>
            </div>
          )}

          {jobPost.work_hours && (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>⏰ 근무 시간</div>
              <div>{jobPost.work_hours}</div>
            </div>
          )}

          {(jobPost.address || jobPost.address_detail || jobPost.content) && (
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>📍 주소/상세 내용</div>
            <div>{jobPost.address_detail || jobPost.address || jobPost.content}</div>
          </div>
          )}
        </div>

        {/* 제공 사항 */}
        {(jobPost.meal_provided ||
          jobPost.lodging_provided ||
          jobPost.equipment_provided) && (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 20,
              marginTop: 16,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>✅ 제공 사항</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {jobPost.meal_provided && (
                <span
                  style={{
                    background: "#dcfce7",
                    color: "#166534",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 14,
                  }}
                >
                  🍚 식대 제공
                </span>
              )}
              {jobPost.lodging_provided && (
                <span
                  style={{
                    background: "#dbeafe",
                    color: "#1e40af",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 14,
                  }}
                >
                  🏠 숙소 제공
                </span>
              )}
              {jobPost.equipment_provided && (
                <span
                  style={{
                    background: "#fef3c7",
                    color: "#92400e",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 14,
                  }}
                >
                  🔧 장비 제공
                </span>
              )}
            </div>
          </div>
        )}

        {/* 우대 조건 */}
        {(jobPost.preferred_experience_years ||
          (jobPost.preferred_certificates &&
            jobPost.preferred_certificates.length > 0) ||
          jobPost.preferred_driver_license) && (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 20,
              marginTop: 16,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>⭐ 우대 조건</div>
            <div style={{ display: "grid", gap: 6 }}>
              {jobPost.preferred_experience_years && (
                <div>• 경력 {jobPost.preferred_experience_years}년 이상</div>
              )}
              {jobPost.preferred_certificates &&
                jobPost.preferred_certificates.map((cert, idx) => (
                  <div key={idx}>• {cert}</div>
                ))}
              {jobPost.preferred_driver_license && <div>• 운전 가능자 우대</div>}
            </div>
          </div>
        )}

        {/* 추가 메모 */}
        {jobPost.additional_notes && (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 20,
              marginTop: 16,
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>📝 추가 안내</div>
            <div style={{ whiteSpace: "pre-wrap" }}>
              {jobPost.additional_notes}
            </div>
          </div>
        )}

        {/* 연락처 정보 */}
        {(jobPost.contact_name || jobPost.contact_phone) && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 20,
            marginTop: 16,
            background: "#f9fafb",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>📞 연락처</div>
          <div style={{ display: "grid", gap: 6 }}>
            {jobPost.contact_name && <div>담당자: {jobPost.contact_name}</div>}
            {jobPost.contact_phone && <div>전화번호: {jobPost.contact_phone}</div>}
            {jobPost.contact_hours && (
              <div>통화 가능 시간: {jobPost.contact_hours}</div>
            )}
          </div>
        </div>
        )}

        {/* 결제 방식 */}
        {jobPost.payment_method && (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 20,
              marginTop: 16,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>💳 결제 방식</div>
            <div>{jobPost.payment_method}</div>
          </div>
        )}

        {/* 마감일 */}
        {jobPost.deadline && (
          <div style={{ marginTop: 16, color: "#ef4444", fontSize: 14 }}>
            ⏰ 마감일: {jobPost.deadline}
          </div>
        )}

        {/* 액션 버튼 */}
        <div style={{ marginTop: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {me.role === "seeker" && (
            <>
              <SaveButton postingId={jobPost.id} />
              <ApplyButton postingId={jobPost.id} />
              {jobPost.contact_phone && (
              <a
                className="btn"
                href={`tel:${jobPost.contact_phone}`}
              >
                📞 전화하기
              </a>
              )}
              <a className="btn" href={`/chat?postingId=${jobPost.id}`}>
                💬 채팅 문의
              </a>
            </>
          )}
          {me.role === "employer" && (
            <>
              <a href={`/post/edit/${jobPost.id}`} className="btn">✏️ 수정</a>
              <PostingDetailActions postingId={jobPost.id} />
            </>
          )}
        </div>

        {/* 등록 정보 */}
        <div
          style={{
            marginTop: 32,
            paddingTop: 16,
            borderTop: "1px solid #e5e7eb",
            fontSize: 12,
            color: "#9ca3af",
          }}
        >
          등록일: {new Date(jobPost.created_at).toLocaleString("ko-KR")}
          {jobPost.updated_at !== jobPost.created_at && (
            <> · 수정일: {new Date(jobPost.updated_at).toLocaleString("ko-KR")}</>
          )}
        </div>
      </main>
    );
}
