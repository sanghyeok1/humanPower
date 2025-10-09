// app/post/[id]/page.tsx
import { getServerAccount } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { postings, jobPostings } from "@/lib/mockdb";
import { CATEGORY_LABELS } from "@/types";
import ApplyButton from "@/components/ApplyButton";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getServerAccount();
  const { id } = await params;

  // 기존 postings와 jobPostings 모두 검색
  const oldPost = postings.find((p) => p.id === id);
  const jobPost = jobPostings.find((jp) => jp.id === id);

  if (!oldPost && !jobPost) notFound();

  // 미로그인 → 로그인으로
  if (!me) {
    redirect(`/login?returnTo=${encodeURIComponent(`/post/${id}`)}`);
  }

  // 기존 postings 표시 (기존 로직 유지)
  if (oldPost) {
    const catLabel =
      oldPost.cat === "rc"
        ? "철근/형틀/콘크리트"
        : oldPost.cat === "int"
        ? "내부마감"
        : "설비/전기/배관";

    return (
      <main style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
        <a href="/" className="btn" style={{ marginBottom: 12 }}>
          ← 목록으로
        </a>

        <h1 style={{ fontSize: 22, fontWeight: 800 }}>{oldPost.title}</h1>
        <div style={{ color: "#6b7280", marginTop: 6 }}>
          {catLabel} · {oldPost.dong} · 시작일 {oldPost.startDate}
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            marginTop: 16,
          }}
        >
          <p style={{ margin: 0, fontSize: 16 }}>{oldPost.pay}</p>
          {oldPost.summary && (
            <p style={{ marginTop: 8, color: "#374151" }}>{oldPost.summary}</p>
          )}
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <a className="btn btn-primary" href="tel:010-0000-0000">
            전화하기
          </a>
          <a className="btn" href="#">
            채팅 문의
          </a>
        </div>
      </main>
    );
  }

  // jobPostings 상세 표시
  if (jobPost) {
    const categoryLabel = CATEGORY_LABELS[jobPost.category];
    const wageTypeLabel =
      jobPost.wage_type === "day"
        ? "일급"
        : jobPost.wage_type === "hour"
        ? "시급"
        : "월급";
    const shiftLabel = jobPost.shift_type === "day" ? "주간" : "야간";

    const isOwner = me.role === "employer" && me.id === jobPost.employer_id;

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
          <span>📍 {jobPost.address_dong}</span>
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
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>📋 필요 인원</div>
            <div>{jobPost.required_positions}</div>
          </div>

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

          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>📍 주소</div>
            <div>{jobPost.address_detail}</div>
          </div>
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
            <div>담당자: {jobPost.contact_name}</div>
            <div>전화번호: {jobPost.contact_phone}</div>
            {jobPost.contact_hours && (
              <div>통화 가능 시간: {jobPost.contact_hours}</div>
            )}
          </div>
        </div>

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
          {!isOwner && me.role === "seeker" && (
            <>
              <a
                className="btn btn-primary"
                href={`tel:${jobPost.contact_phone}`}
              >
                📞 전화하기
              </a>
              <button className="btn">💬 채팅 문의</button>
              <button className="btn">❤️ 찜하기</button>
              <ApplyButton postingId={jobPost.id} />
            </>
          )}
          {isOwner && (
            <>
              <button className="btn">✏️ 수정</button>
              <button className="btn" style={{ color: "#ef4444" }}>
                🗑️ 삭제
              </button>
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

  return notFound();
}
