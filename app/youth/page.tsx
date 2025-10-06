// app/youth/page.tsx
export default function YouthPage() {
  return (
    <div style={{ maxWidth: 860, margin: "32px auto", lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>청소년보호정책(예시)</h1>
      <p>
        본 서비스는 청소년 유해 정보의 유통 방지를 위해 신고·차단·삭제 조치를
        수행합니다. 청소년에게 부적합한 내용(불법/유해 표현, 유해업소 채용 등)은
        금지됩니다.
      </p>
      <ul>
        <li>유해 게시물의 신속한 조치 및 재발 방지</li>
        <li>심야시간(21:00–08:00) 알림 제한</li>
        <li>신고 접수 및 이용자 보호를 위한 상담 안내</li>
      </ul>
      <p>신고/문의: support@example.com</p>
    </div>
  );
}
