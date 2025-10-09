// app/signup/page.tsx
"use client";
import Link from "next/link";
import { useState } from "react";

export default function SignupIndexPage() {
  const [hoverSeeker, setHoverSeeker] = useState(false);
  const [hoverEmployer, setHoverEmployer] = useState(false);

  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          width: "100%",
          background: "white",
          borderRadius: 16,
          padding: "48px 32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* 제목 */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              marginBottom: 8,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            회원가입
          </h1>
          <p style={{ color: "#6b7280", fontSize: 16 }}>
            회원 유형을 선택해주세요
          </p>
        </div>

        {/* 선택 카드 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
            marginBottom: 32,
          }}
        >
          {/* 구직자 카드 */}
          <Link
            href="/signup/seeker"
            style={{
              textDecoration: "none",
              display: "block",
              padding: 32,
              border: hoverSeeker ? "3px solid #667eea" : "3px solid #e5e7eb",
              borderRadius: 16,
              transition: "all 0.3s ease",
              cursor: "pointer",
              background: "white",
              transform: hoverSeeker ? "translateY(-4px)" : "translateY(0)",
              boxShadow: hoverSeeker
                ? "0 12px 24px rgba(102, 126, 234, 0.2)"
                : "none",
            }}
            onMouseEnter={() => setHoverSeeker(true)}
            onMouseLeave={() => setHoverSeeker(false)}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: 40,
              }}
            >
              👷
            </div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                textAlign: "center",
                marginBottom: 12,
                color: "#1f2937",
              }}
            >
              구직자
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "#6b7280",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              일자리를 찾고 계신가요?
              <br />
              프로필을 등록하고 공고를 확인하세요
            </p>
            <div
              style={{
                marginTop: 24,
                padding: 12,
                background: "#f3f4f6",
                borderRadius: 8,
                fontSize: 13,
                color: "#4b5563",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                • 공고 검색 및 지원
              </div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                • 이력서 작성 및 관리
              </div>
              <div style={{ fontWeight: 600 }}>• 맞춤 공고 알림</div>
            </div>
          </Link>

          {/* 구인자 카드 */}
          <Link
            href="/signup/employer"
            style={{
              textDecoration: "none",
              display: "block",
              padding: 32,
              border: hoverEmployer ? "3px solid #764ba2" : "3px solid #e5e7eb",
              borderRadius: 16,
              transition: "all 0.3s ease",
              cursor: "pointer",
              background: "white",
              transform: hoverEmployer ? "translateY(-4px)" : "translateY(0)",
              boxShadow: hoverEmployer
                ? "0 12px 24px rgba(118, 75, 162, 0.2)"
                : "none",
            }}
            onMouseEnter={() => setHoverEmployer(true)}
            onMouseLeave={() => setHoverEmployer(false)}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: 40,
              }}
            >
              🏢
            </div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                textAlign: "center",
                marginBottom: 12,
                color: "#1f2937",
              }}
            >
              구인자
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "#6b7280",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              인력을 구하고 계신가요?
              <br />
              공고를 등록하고 지원자를 관리하세요
            </p>
            <div
              style={{
                marginTop: 24,
                padding: 12,
                background: "#f3f4f6",
                borderRadius: 8,
                fontSize: 13,
                color: "#4b5563",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                • 공고 작성 및 관리
              </div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                • 지원자 확인 및 평가
              </div>
              <div style={{ fontWeight: 600 }}>• 템플릿 저장 기능</div>
            </div>
          </Link>
        </div>

        {/* 로그인 링크 */}
        <div
          style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            이미 회원이신가요?{" "}
            <a
              href="/login"
              style={{
                color: "#667eea",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              로그인
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
