// app/report/page.tsx
export default function ReportPage() {
  return (
    <div style={{ maxWidth: 860, margin: "32px auto", lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>신고/문의</h1>
      <p>
        허위임금, 연락두절, 불법·유해 게시물 등은 아래 이메일로 신고해주세요.
      </p>
      <ul>
        <li>이메일: support@example.com</li>
        <li>처리: 접수 → 사실 확인 → 게시 중단/제재(필요 시) → 결과 안내</li>
      </ul>
      <p style={{ color: "#666", fontSize: 13 }}>
        ※ 신고 내용·증빙은 사실확인 목적으로만 사용되며, 처리 완료 후 관련
        법령에 따라 보관/파기됩니다.
      </p>
    </div>
  );
}
