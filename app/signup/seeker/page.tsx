"use client";

import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    daum: any;
  }
}

/** 카카오 우편번호 SDK */
const DAUM_POSTCODE_SDK =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

/** 환경 토글: 나중에 본인인증 켜고 싶으면 .env.local에
 *  NEXT_PUBLIC_REQUIRE_PHONE_VERIFICATION=1 추가 후 재시작
 */
const REQUIRE_PHONE_VERIFICATION =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_REQUIRE_PHONE_VERIFICATION === "1";

/** 공용 로더 */
function loadScriptOnce(src: string) {
  return new Promise<void>((resolve, reject) => {
    const exist = Array.from(document.scripts).some((s) => s.src === src);
    if (exist) return resolve();
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("script load error: " + src));
    document.head.appendChild(el);
  });
}
async function waitUntil(test: () => boolean, timeoutMs = 8000, step = 50) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (test()) return;
    await new Promise((r) => setTimeout(r, step));
  }
  throw new Error("timeout");
}

/** 비번 규칙: 소문자+숫자+특수문자 8자↑ */
const PASSWORD_POLICY = {
  re: /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]).{8,}$/,
  hint: "소문자·숫자·특수문자 포함 8자 이상",
};

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function SeekerSignupPage() {
  // ====== 필드 상태 ======
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState(""); // 직접 입력(본인인증 나중에)
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [postalCode, setPostalCode] = useState("");
  const [roadAddress, setRoadAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [agreeService, setAgreeService] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);

  // ====== UI/검증 상태 ======
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [uStatus, setUStatus] = useState<UsernameStatus>("idle");
  useEffect(() => setUStatus("idle"), [username]);

  // “어디를 채워야 하는지” 포커스 주기 위한 ref
  const refs = {
    name: useRef<HTMLInputElement>(null),
    username: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    passwordConfirm: useRef<HTMLInputElement>(null),
    addrBtn: useRef<HTMLButtonElement>(null),
  };

  // ====== 유효성 ======
  const phoneValid = useMemo(() => {
    const d = phone.replace(/\D/g, "");
    return d.length >= 10 && d.length <= 11;
  }, [phone]);
  const passwordValid = useMemo(
    () => PASSWORD_POLICY.re.test(password),
    [password]
  );
  const passwordMatch = password && password === passwordConfirm;
  const addressValid = useMemo(
    () =>
      !!roadAddress &&
      Number.isFinite(Number(lat)) &&
      Number.isFinite(Number(lng)),
    [roadAddress, lat, lng]
  );

  // 본인인증(임시): 사업자/연동 전까지는 “통과로 간주”
  const [certOK, setCertOK] = useState(!REQUIRE_PHONE_VERIFICATION);
  // 데모 버튼
  const demoCertPass = () => {
    setCertOK(true);
    if (!phone) setPhone("010-0000-0000"); // 임시 채움
    setMsg("임시(데모) 본인인증 통과 처리했습니다.");
  };

  // ====== 아이디 중복확인(서버/DB) ======
  async function checkUsername() {
    setMsg(null);
    setUStatus("checking");
    try {
      const res = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "중복 확인 실패");
      if (j.reason === "invalid_format") setUStatus("invalid");
      else setUStatus(j.available ? "available" : "taken");
    } catch (e: any) {
      setMsg(e?.message ?? "아이디 확인 중 오류");
      setUStatus("idle");
    }
  }

  // ====== 우편번호 + 좌표 ======
  async function openPostcode() {
    setMsg(null);
    try {
      await loadScriptOnce(DAUM_POSTCODE_SDK);
      await waitUntil(() => !!window.daum?.Postcode);
      new window.daum.Postcode({
        oncomplete: async (data: any) => {
          const addr = data.roadAddress || data.address || "";
          setPostalCode(data.zonecode || "");
          setRoadAddress(addr);
          setDetailAddress("");

          try {
            const r = await fetch(
              `/api/geocode?query=${encodeURIComponent(addr)}`,
              { cache: "no-store" }
            );
            const j = await r.json();
            if (!r.ok) throw new Error(j?.error || "좌표 조회 실패");
            setLat(j.lat);
            setLng(j.lng);
          } catch (e: any) {
            setLat(null);
            setLng(null);
            setMsg(e?.message ?? "좌표 변환 중 오류");
          }
        },
      }).open();
    } catch (e: any) {
      setMsg(e?.message ?? "우편번호 모듈 로딩 실패");
    }
  }

  // ====== 폼 완성도(진행바) ======
  const completeness = useMemo(() => {
    let s = 0;
    if (name.trim()) s += 12;
    if (/^[a-z0-9_]{3,20}$/.test(username)) s += 12;
    if (uStatus === "available") s += 12;
    if (phoneValid) s += 12;
    if (certOK) s += 12;
    if (passwordValid) s += 15;
    if (passwordMatch) s += 10;
    if (addressValid) s += 12;
    if (agreeService) s += 2;
    if (agreePolicy) s += 1;
    return Math.min(100, s);
  }, [
    name,
    username,
    uStatus,
    phoneValid,
    certOK,
    passwordValid,
    passwordMatch,
    addressValid,
    agreeService,
    agreePolicy,
  ]);

  // ====== 제출 ======
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    // 1) 어떤 필드가 막는지 “명확하게” 알려주고 포커스 이동
    const fail = (message: string, focus?: keyof typeof refs) => {
      setMsg(message);
      if (focus && refs[focus]?.current) refs[focus].current!.focus();
    };

    if (!name.trim()) return fail("이름을 입력해 주세요.", "name");

    if (!/^[a-z0-9_]{3,20}$/.test(username))
      return fail(
        "아이디 형식이 올바르지 않습니다. (영문소문자/숫자/언더스코어 3~20자)",
        "username"
      );
    if (uStatus !== "available")
      return fail("아이디 중복확인을 완료해 주세요.", "username");

    if (!phoneValid)
      return fail("전화번호를 정확히 입력해 주세요. (숫자 10~11자리)", "phone");

    if (REQUIRE_PHONE_VERIFICATION && !certOK)
      return fail(
        "휴대폰 본인인증이 필요합니다. (상단 버튼으로 인증)",
        "phone"
      );

    if (!PASSWORD_POLICY.re.test(password))
      return fail(
        `비밀번호 규칙을 확인해 주세요. (${PASSWORD_POLICY.hint})`,
        "password"
      );
    if (!password || password !== passwordConfirm)
      return fail("비밀번호가 서로 일치하지 않습니다.", "passwordConfirm");

    if (!addressValid)
      return fail(
        "카카오 주소 찾기로 주소를 선택해 위/경도가 입력되도록 해주세요.",
        "addrBtn"
      );

    if (!agreeService || !agreePolicy)
      return fail("필수 약관에 모두 동의해 주세요.");

    // 2) 서버 저장
    setSaving(true);
    try {
      const res = await fetch("/api/signup/seeker", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          phone,
          password,
          postalCode,
          roadAddress,
          detailAddress,
          lat,
          lng,
        }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        if (j?.error === "username_taken")
          return fail("이미 사용 중인 아이디입니다.", "username");
        if (j?.error === "phone_taken")
          return fail("이미 등록된 전화번호입니다.", "phone");
        return fail(j?.error || "가입에 실패했습니다.");
      }

      setMsg("가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
      setTimeout(() => (window.location.href = "/login"), 800);
    } catch {
      fail("네트워크 오류로 가입에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 760,
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
        {/* 이름 */}
        <label>
          이름
          <input
            ref={refs.name}
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 홍길동"
            maxLength={30}
          />
        </label>

        {/* 아이디 + 중복확인 */}
        <div style={{ display: "grid", gap: 6 }}>
          <label>
            아이디
            <div style={{ display: "flex", gap: 8 }}>
              <input
                ref={refs.username}
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="영문소문자/숫자/언더스코어 3~20자"
                autoComplete="username"
                maxLength={20}
              />
              <button
                type="button"
                className="btn"
                onClick={checkUsername}
                disabled={
                  !/^[a-z0-9_]{3,20}$/.test(username) || uStatus === "checking"
                }
              >
                {uStatus === "checking" ? "확인 중…" : "중복확인"}
              </button>
            </div>
          </label>
          {uStatus === "invalid" && (
            <div style={{ color: "#b91c1c", fontSize: 12 }}>
              형식이 올바르지 않습니다.
            </div>
          )}
          {uStatus === "taken" && (
            <div style={{ color: "#b91c1c", fontSize: 12 }}>
              이미 사용 중인 아이디입니다.
            </div>
          )}
          {uStatus === "available" && (
            <div style={{ color: "#166534", fontSize: 12 }}>
              사용 가능한 아이디입니다.
            </div>
          )}
        </div>

        {/* 전화번호 (본인인증 나중에) */}
        <div style={{ display: "grid", gap: 6 }}>
          <label>
            전화번호
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                ref={refs.phone}
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
              />
              {!REQUIRE_PHONE_VERIFICATION && (
                <button type="button" className="btn" onClick={demoCertPass}>
                  본인인증(데모) 통과
                </button>
              )}
            </div>
          </label>
          {!phoneValid && phone && (
            <div style={{ color: "#b91c1c", fontSize: 12 }}>
              숫자 10~11자리로 입력해 주세요.
            </div>
          )}
          {certOK && !REQUIRE_PHONE_VERIFICATION && (
            <div style={{ color: "#166534", fontSize: 12 }}>
              임시(데모) 인증 완료 상태입니다.
            </div>
          )}
        </div>

        {/* 비밀번호 */}
        <div style={{ display: "grid", gap: 8 }}>
          <label>
            비밀번호
            <input
              ref={refs.password}
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={PASSWORD_POLICY.hint}
              autoComplete="new-password"
            />
          </label>
          <label>
            비밀번호 확인
            <input
              ref={refs.passwordConfirm}
              type="password"
              className="input"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="다시 입력"
              autoComplete="new-password"
            />
          </label>
          {password && !passwordValid && (
            <div style={{ color: "#b91c1c", fontSize: 12 }}>
              {PASSWORD_POLICY.hint}
            </div>
          )}
          {passwordConfirm && !passwordMatch && (
            <div style={{ color: "#b91c1c", fontSize: 12 }}>
              비밀번호가 일치하지 않습니다.
            </div>
          )}
        </div>

        {/* 주소/좌표 */}
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              placeholder="우편번호"
              value={postalCode}
              readOnly
              style={{ width: 140 }}
            />
            <button
              ref={refs.addrBtn}
              type="button"
              className="btn"
              onClick={openPostcode}
            >
              카카오 주소 찾기
            </button>
          </div>
          <input
            className="input"
            placeholder="도로명 주소"
            value={roadAddress}
            readOnly
          />
          <input
            className="input"
            placeholder="상세 주소(동/호 등)"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              placeholder="위도(lat)"
              value={lat ?? ""}
              readOnly
            />
            <input
              className="input"
              placeholder="경도(lng)"
              value={lng ?? ""}
              readOnly
            />
          </div>
          {!addressValid && (roadAddress || detailAddress) && (
            <div style={{ color: "#b91c1c", fontSize: 12 }}>
              주소 선택 후 위/경도가 자동 입력되어야 합니다.
            </div>
          )}
        </div>

        {/* 동의 */}
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
            <input
              type="checkbox"
              checked={agreeService}
              onChange={(e) => setAgreeService(e.target.checked)}
            />
            <span>
              (필수) 본 서비스는 <b>정보제공형</b>이며 직업소개/알선이 아닙니다.
              게시 정보 및 활동 결과에 법적 책임을 지지 않습니다.
            </span>
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
            <input
              type="checkbox"
              checked={agreePolicy}
              onChange={(e) => setAgreePolicy(e.target.checked)}
            />
            <span>
              (필수) 개인정보 수집·이용에 동의합니다. 목적: 계정 관리 및 현장
              정보 제공, 보유기간: 탈퇴 시 파기(관련 법령 예외 포함).
            </span>
          </label>
        </div>

        {msg && (
          <div
            className="notice"
            style={{ color: msg.includes("완료") ? "#166534" : "#b91c1c" }}
          >
            {msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "제출 중…" : "가입하기"}
          </button>
          <a href="/" className="btn">
            취소
          </a>
        </div>
      </form>
    </main>
  );
}
