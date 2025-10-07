"use client";

import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    daum: any;
  }
}

const DAUM_POSTCODE_SDK =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

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

/** 비밀번호: 소문자+숫자+특수문자 포함 8자 이상 */
const PASSWORD_POLICY = {
  re: /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]).{8,}$/,
  hint: "소문자·숫자·특수문자 포함 8자 이상",
};

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";
type SendStatus = "idle" | "sending" | "sent";
type VerifyStatus = "idle" | "verifying" | "ok" | "fail";

export default function SeekerSignupPage() {
  // 기본 정보 (이름만)
  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); // 아이디
  const [phone, setPhone] = useState("");

  // 비밀번호
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // 주소/좌표
  const [postalCode, setPostalCode] = useState("");
  const [roadAddress, setRoadAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // 동의
  const [agreeService, setAgreeService] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);

  // 상태
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 아이디 중복 체크
  const [uStatus, setUStatus] = useState<UsernameStatus>("idle");
  useEffect(() => {
    setUStatus("idle"); // 입력 바뀌면 초기화
  }, [username]);

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

  // 전화번호 인증
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("idle");
  const [code, setCode] = useState("");
  const [count, setCount] = useState(0); // 재전송 카운트다운
  const timerRef = useRef<any>(null);

  function startCountdown(sec: number) {
    setCount(sec);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCount((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function sendCode() {
    setMsg(null);
    setVerifyStatus("idle");
    setSendStatus("sending");
    try {
      const res = await fetch("/api/auth/phone/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "전송 실패");
      setSendStatus("sent");
      startCountdown(60);
      setMsg("인증번호가 전송되었습니다. (데모: 서버 콘솔에 코드 출력)");
    } catch (e: any) {
      setMsg(e?.message ?? "인증번호 전송 중 오류");
      setSendStatus("idle");
    }
  }

  async function verifyCode() {
    setMsg(null);
    setVerifyStatus("verifying");
    try {
      const res = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const j = await res.json();
      if (!res.ok || !j.verified) {
        setVerifyStatus("fail");
        setMsg(j?.error || "인증번호가 올바르지 않습니다.");
        return;
      }
      setVerifyStatus("ok");
      setMsg("전화번호가 인증되었습니다.");
    } catch (e: any) {
      setVerifyStatus("fail");
      setMsg(e?.message ?? "인증 확인 중 오류");
    }
  }

  // 유효성
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
    () => !!roadAddress && Number.isFinite(lat) && Number.isFinite(lng),
    [roadAddress, lat, lng]
  );

  const requiredOk = useMemo(
    () =>
      !!name.trim() &&
      /^[a-z0-9_]{3,20}$/.test(username) &&
      uStatus === "available" &&
      phoneValid &&
      verifyStatus === "ok" &&
      passwordValid &&
      passwordMatch &&
      addressValid &&
      agreeService &&
      agreePolicy,
    [
      name,
      username,
      uStatus,
      phoneValid,
      verifyStatus,
      passwordValid,
      passwordMatch,
      addressValid,
      agreeService,
      agreePolicy,
    ]
  );

  const completeness = useMemo(() => {
    let s = 0;
    if (name.trim()) s += 10;
    if (/^[a-z0-9_]{3,20}$/.test(username)) s += 10;
    if (uStatus === "available") s += 10;
    if (phoneValid) s += 10;
    if (verifyStatus === "ok") s += 10;
    if (passwordValid) s += 15;
    if (passwordMatch) s += 10;
    if (addressValid) s += 15;
    if (agreeService) s += 5;
    if (agreePolicy) s += 5;
    return Math.min(100, s);
  }, [
    name,
    username,
    uStatus,
    phoneValid,
    verifyStatus,
    passwordValid,
    passwordMatch,
    addressValid,
    agreeService,
    agreePolicy,
  ]);

  // 우편번호 팝업 + 좌표 변환
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

  // 제출(이제 서버에 저장)
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    // 필수 체크(당신의 페이지 기준에 맞춰 수정 가능)
    const passwordValid =
      /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]).{8,}$/.test(
        password
      );
    const passwordMatch = password && password === passwordConfirm;
    const addressValid =
      !!roadAddress &&
      Number.isFinite(Number(lat)) &&
      Number.isFinite(Number(lng));

    if (!name.trim()) return setMsg("이름을 입력해 주세요.");
    if (!/^[a-z0-9_]{3,20}$/.test(username))
      return setMsg("아이디 형식이 올바르지 않습니다.");
    if (uStatus !== "available")
      return setMsg("아이디 중복확인을 완료해 주세요.");
    if (!passwordValid) return setMsg("비밀번호 규칙을 확인해 주세요.");
    if (!passwordMatch) return setMsg("비밀번호가 일치하지 않습니다.");
    if (!addressValid)
      return setMsg("주소를 선택해 위/경도가 입력되도록 해주세요.");
    if (!agreeService || !agreePolicy)
      return setMsg("필수 동의에 체크해 주세요.");

    setSaving(true);
    try {
      const res = await fetch("/api/signup/seeker", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          phone, // 본인인증 붙이기 전이므로 입력값 그대로 보냄(추후 normalize는 서버에서 진행)
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
          return setMsg("이미 사용중인 아이디입니다.");
        if (j?.error === "phone_taken")
          return setMsg("이미 등록된 전화번호입니다.");
        return setMsg(j?.error || "가입에 실패했습니다.");
      }

      setMsg("가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
      // 필요 시 자동 이동
      setTimeout(() => {
        window.location.href = "/login";
      }, 800);
    } catch {
      setMsg("네트워크 오류로 가입에 실패했습니다.");
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

        {/* 전화번호 + 인증 */}
        <div style={{ display: "grid", gap: 6 }}>
          <label>
            전화번호
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
              />
              <button
                type="button"
                className="btn"
                onClick={sendCode}
                disabled={!phoneValid || sendStatus === "sending" || count > 0}
                title={!phoneValid ? "전화번호를 정확히 입력하세요" : ""}
              >
                {sendStatus === "sending"
                  ? "전송 중…"
                  : count > 0
                  ? `재전송(${count}s)`
                  : "인증번호 전송"}
              </button>
            </div>
          </label>
          {!phoneValid && phone && (
            <div style={{ color: "#b91c1c", fontSize: 12 }}>
              10~11자리 숫자로 입력하세요.
            </div>
          )}

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="인증번호 6자리"
              maxLength={6}
              inputMode="numeric"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn"
              onClick={verifyCode}
              disabled={code.length < 4 || verifyStatus === "verifying"}
            >
              {verifyStatus === "verifying" ? "확인 중…" : "인증확인"}
            </button>
          </div>
          {verifyStatus === "ok" && (
            <div style={{ color: "#166534", fontSize: 12 }}>
              전화번호 인증 완료
            </div>
          )}
          {verifyStatus === "fail" && (
            <div style={{ color: "#b91c1c", fontSize: 12 }}>
              인증 실패. 번호/코드를 확인하세요.
            </div>
          )}
        </div>

        {/* 비밀번호 */}
        <div style={{ display: "grid", gap: 8 }}>
          <label>
            비밀번호
            <input
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
            <button type="button" className="btn" onClick={openPostcode}>
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
              주소 선택 후 좌표가 자동 입력되어야 합니다. (다시 “카카오 주소
              찾기”)
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
          <button
            className="btn btn-primary"
            type="submit"
            disabled={saving || !requiredOk}
          >
            {saving ? "제출 중…" : "가입하기 (프론트 데모)"}
          </button>
          <a href="/" className="btn">
            취소
          </a>
        </div>
      </form>
    </main>
  );
}
