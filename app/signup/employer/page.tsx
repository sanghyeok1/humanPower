// app/signup/employer/page.tsx
export default function EmployerSignupPage() {
  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>구인자 회원가입</h1>
      <p style={{ marginTop: 8 }}>
        (임시) 여기에는 사업자 정보 입력/검증, 연락처, 비밀번호 설정 폼이
        들어갑니다.
      </p>
      <div style={{ marginTop: 16 }}>
        <a className="btn" href="/signup">
          ← 가입 유형 선택
        </a>
      </div>
    </main>
  );
}
