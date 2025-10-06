// app/ad/page.tsx
export default function AdPolicyPage() {
  return (
    <div style={{ maxWidth: 860, margin: "32px auto", lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>광고표시정책(예시)</h1>
      <p>
        파트너 배너·상단고정·강조배지 등 유료 노출은 <strong>광고</strong>이며,
        광고임을 식별 가능하게 표시합니다. 광고는 내부 심사를 통과한 경우에만
        게재되며, 허위·과장·불법 광고는 중단될 수 있습니다.
      </p>
      <ul>
        <li>광고 영역에는 “광고” 또는 이에 준하는 표기</li>
        <li>정책 위반 시 노출 중단/계약 해지/환수 등 조치</li>
        <li>문의: ads@example.com</li>
      </ul>
    </div>
  );
}
