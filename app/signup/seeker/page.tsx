"use client";

import { useMemo, useState } from "react";

/**
 * 구직자 회원가입 (프론트 전용)
 * - 아직 백엔드 연동 없음. 제출 시 콘솔/알림만.
 * - 필수값 체크 + 폼 완성도(%) 진행바 표시
 * - 향후 /api/signup/seeker 로 POST 연동만 붙이면 바로 작동 가능
 */

type SeekerSignupForm = {
  name: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  categories: string[]; // 선호 분야
  dong: string; // 거주 동
  startDate: string; // 시작 가능일 (YYYY-MM-DD)
  nightOK: boolean;
  newbieOK: boolean;
  hasGear: boolean;
  needDorm: boolean;
  agreeService: boolean; // 이용약관 동의(필수)
  agreePolicy: boolean; // 개인정보 동의(필수)
};

const CAT_OPTIONS = [
  { v: "rebar_form_concrete", label: "철근/형틀/콘크리트" },
  { v: "interior_finish", label: "내부마감" },
  { v: "mep", label: "설비/전기/배관" },
];

const DONG_OPTIONS = [
  "춘의동",
  "신중동",
  "중동",
  "상동",
  "범박동",
  "소사동",
  "심곡동",
  "괴안동",
  "옥길동",
];

export default function SeekerSignupPage() {
  const [form, setForm] = useState<SeekerSignupForm>({
    name: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    categories: [],
    dong: "",
    startDate: "",
    nightOK: false,
    newbieOK: true,
    hasGear: false,
    needDorm: false,
    agreeService: false,
    agreePolicy: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const phoneValid = useMemo(() => {
    const onlyDigits = form.phone.replace(/\D/g, "");
    return onlyDigits.length >= 10 && onlyDigits.length <= 11;
  }, [form.phone]);

  const passwordValid = form.password.length >= 4;
  const passwordMatch = form.password && form.password === form.passwordConfirm;

  // 필수 항목 체크(프론트 전용)
  const requiredOk = useMemo(() => {
    return (
      !!form.name.trim() &&
      phoneValid &&
      passwordValid &&
      passwordMatch &&
      form.categories.length > 0 &&
      !!form.dong &&
      !!form.startDate &&
      form.agreeService &&
      form.agreePolicy
    );
  }, [
    form.name,
    phoneValid,
    passwordValid,
    passwordMatch,
    form.categories.length,
    form.dong,
    form.startDate,
    form.agreeService,
    form.agreePolicy,
  ]);

  // 진행바: 주요 10개 포인트로 가중치 없이 10%씩(단순)
  const completeness = useMemo(() => {
    let score = 0;
    if (form.name.trim()) score += 10;
    if (phoneValid) score += 10;
    if (passwordValid) score += 10;
    if (passwordMatch) score += 10;
    if (form.categories.length > 0) score += 10;
    if (form.dong) score += 10;
    if (form.startDate) score += 10;
    if (form.nightOK) score += 5;
    if (form.newbieOK) score += 5;
    if (form.hasGear) score += 5;
    if (form.needDorm) score += 5;
    if (form.agreeService) score += 10;
    if (form.agreePolicy) score += 10;
    return Math.min(100, score);
  }, [form]);

  const toggleCategory = (v: string) => {
    setForm((f) => {
      const on = new Set(f.categories);
      if (on.has(v)) on.delete(v);
      else on.add(v);
      return { ...f, categories: Array.from(on) };
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!requiredOk) {
      setError("필수 항목을 확인해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      // 아직 백엔드 연동 전이므로 콘솔에만 출력
      // 나중에 여기서 /api/signup/seeker 로 POST 하면 됨.
      // await fetch("/api/signup/seeker", { method: "POST", body: JSON.stringify(form) })
      console.log("[SeekerSignup] payload:", {
        ...form,
        phoneNorm: form.phone.replace(/\D/g, ""),
      });
      setDone(true);
    } catch (e) {
      setError("제출 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main style={{ maxWidth: 640, margin: "24px auto", padding: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>구직자 회원가입</h1>
        <div className="notice" style={{ marginTop: 12, color: "#166534" }}>
          임시로 제출이 완료되었습니다. (현재는 프론트만 구성)
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <a className="btn btn-primary" href="/">
            홈으로
          </a>
          <a className="btn" href="/login">
            로그인 페이지로
          </a>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "24px auto",
        padding: 16,
        display: "grid",
        gap: 16,
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>구직자 회원가입</h1>

      {/* 진행바 */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 12, color: "#666" }}>폼 완성도</span>
          <b>{completeness}%</b>
        </div>
        <div
          style={{
            width: "100%",
            height: 8,
            background: "#eee",
            borderRadius: 999,
          }}
        >
          <div
            style={{
              width: `${completeness}%`,
              height: 8,
              borderRadius: 999,
              background:
                completeness >= 80
                  ? "#16a34a"
                  : completeness >= 50
                  ? "#f59e0b"
                  : "#ef4444",
              transition: "width .2s ease",
            }}
          />
        </div>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        {/* 기본 정보 */}
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            이름
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예: 홍길동"
              maxLength={30}
            />
          </label>

          <label>
            전화번호
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="010-0000-0000"
            />
            {!phoneValid && form.phone && (
              <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 4 }}>
                10~11자리 숫자로 입력해 주세요.
              </div>
            )}
          </label>

          <div style={{ display: "grid", gap: 8 }}>
            <label>
              비밀번호
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="최소 4자리"
              />
            </label>
            <label>
              비밀번호 확인
              <input
                type="password"
                className="input"
                value={form.passwordConfirm}
                onChange={(e) =>
                  setForm({ ...form, passwordConfirm: e.target.value })
                }
                placeholder="다시 입력"
              />
            </label>
            {(!passwordValid || !passwordMatch) &&
              (form.password || form.passwordConfirm) && (
                <div style={{ color: "#b91c1c", fontSize: 12 }}>
                  {!passwordValid
                    ? "비밀번호는 최소 4자리입니다."
                    : "비밀번호가 일치하지 않습니다."}
                </div>
              )}
          </div>
        </div>

        {/* 선호 분야(멀티 선택) */}
        <div>
          <div style={{ marginBottom: 6, fontWeight: 700 }}>
            선호 분야 (복수 선택 가능)
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CAT_OPTIONS.map((c) => {
              const active = form.categories.includes(c.v);
              return (
                <button
                  key={c.v}
                  type="button"
                  className={`btn ${active ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => toggleCategory(c.v)}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          {form.categories.length === 0 && (
            <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>
              최소 1개 이상 선택해 주세요.
            </div>
          )}
        </div>

        {/* 거주 동 + 시작 가능일 */}
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            거주 동
            <select
              className="input"
              value={form.dong}
              onChange={(e) => setForm({ ...form, dong: e.target.value })}
            >
              <option value="">선택하세요</option>
              {DONG_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label>
            시작 가능일
            <input
              type="date"
              className="input"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </label>
        </div>

        {/* 근무/장비/숙소 */}
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={form.nightOK}
              onChange={(e) => setForm({ ...form, nightOK: e.target.checked })}
            />
            야간 가능
          </label>

          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={form.newbieOK}
              onChange={(e) => setForm({ ...form, newbieOK: e.target.checked })}
            />
            초보 가능
          </label>

          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={form.hasGear}
              onChange={(e) => setForm({ ...form, hasGear: e.target.checked })}
            />
            개인 장비 보유
          </label>

          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={form.needDorm}
              onChange={(e) => setForm({ ...form, needDorm: e.target.checked })}
            />
            숙소 필요
          </label>
        </div>

        {/* 동의 (필수) */}
        <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
          <label style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
            <input
              type="checkbox"
              checked={form.agreeService}
              onChange={(e) =>
                setForm({ ...form, agreeService: e.target.checked })
              }
            />
            <span>
              (필수) 서비스 이용에 동의합니다. 본 서비스는 <b>정보제공형</b>
              으로, 직업소개/알선이 아니며 게시 정보의 사실 여부와 구직/구인
              활동의 결과에 대해서 법적 책임을 지지 않습니다. (주말/야간 알림
              기본 차단 21–08 정책)
            </span>
          </label>

          <label style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
            <input
              type="checkbox"
              checked={form.agreePolicy}
              onChange={(e) =>
                setForm({ ...form, agreePolicy: e.target.checked })
              }
            />
            <span>
              (필수) 개인정보 수집·이용에 동의합니다. 목적: 계정 관리 및 현장
              정보 제공, 보유기간: 탈퇴 시 즉시 파기(관련 법령 예외 포함).
            </span>
          </label>
        </div>

        {error && (
          <div className="notice" style={{ color: "#b91c1c" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "제출 중…" : "가입하기"}
          </button>
          <a href="/" className="btn">
            취소
          </a>
        </div>
      </form>
    </main>
  );
}
