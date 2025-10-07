"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * 구직자 회원가입 (프론트 전용)
 * - 비밀번호: 소문자+숫자+특수문자, 8자 이상
 * - 거주 동 제거
 * - 카카오 우편번호 서비스로 주소 선택 → 카카오 지오코더로 lat/lng
 * - 제출 시 콘솔에 payload 출력 (백엔드 붙일 때 POST로 교체)
 */

declare global {
  interface Window {
    kakao: any;
    daum: any;
  }
}

type SeekerSignupForm = {
  name: string;
  username: string; // 로그인 아이디
  phone: string;
  password: string;
  passwordConfirm: string;

  // 주소/좌표
  postalCode: string;
  roadAddress: string;
  detailAddress: string;
  lat: number | null;
  lng: number | null;

  // 선택 옵션 (필요 시)
  nightOK: boolean;
  newbieOK: boolean;
  hasGear: boolean;
  needDorm: boolean;

  // 동의
  agreeService: boolean;
  agreePolicy: boolean;
};

const PASSWORD_POLICY = {
  // 소문자 1+, 숫자 1+, 특수문자 1+, 길이 8+
  re: /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]).{8,}$/,
  hint: "소문자·숫자·특수문자를 포함해 8자 이상",
};

// 외형상 특수문자 안내 (사용자 안내용, 검증은 정규식으로 함)
const SPECIAL_HINT = `!@#$%^&* 등`;

export default function SeekerSignupPage() {
  const [form, setForm] = useState<SeekerSignupForm>({
    name: "",
    username: "",
    phone: "",
    password: "",
    passwordConfirm: "",

    postalCode: "",
    roadAddress: "",
    detailAddress: "",
    lat: null,
    lng: null,

    nightOK: false,
    newbieOK: true,
    hasGear: false,
    needDorm: false,

    agreeService: false,
    agreePolicy: false,
  });

  const [loadingScripts, setLoadingScripts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  /* ---------------- Scripts loader (카카오지도 + 우편번호) ---------------- */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // 이미 로드되어 있으면 패스
        const hasKakao = typeof window !== "undefined" && window.kakao?.maps;
        const hasPostcode =
          typeof window !== "undefined" && window.daum?.Postcode;

        // 1) 카카오 지도 + services(지오코더)
        if (!hasKakao) {
          const appkey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
          if (!appkey) {
            setMsg("카카오 JS 키(NEXT_PUBLIC_KAKAO_JS_KEY)가 없습니다.");
            setLoadingScripts(false);
            return;
          }
          await loadScript(
            `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=services`
          );
          await new Promise<void>((resolve) => {
            // @ts-ignore
            window.kakao.maps.load(() => resolve());
          });
        }

        // 2) 카카오 우편번호
        if (!hasPostcode) {
          await loadScript(
            "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          );
        }

        if (!cancelled) setLoadingScripts(false);
      } catch {
        if (!cancelled) {
          setMsg("지도/우편번호 스크립트를 불러오지 못했어요.");
          setLoadingScripts(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("script load error: " + src));
      document.head.appendChild(s);
    });
  }

  /* ---------------- Validators ---------------- */
  const phoneValid = useMemo(() => {
    const onlyDigits = form.phone.replace(/\D/g, "");
    return onlyDigits.length >= 10 && onlyDigits.length <= 11;
  }, [form.phone]);

  const passwordValid = useMemo(() => {
    return PASSWORD_POLICY.re.test(form.password);
  }, [form.password]);

  const passwordMatch = form.password && form.password === form.passwordConfirm;

  const addressValid = useMemo(() => {
    return (
      !!form.roadAddress &&
      Number.isFinite(form.lat) &&
      Number.isFinite(form.lng)
    );
  }, [form.roadAddress, form.lat, form.lng]);

  const requiredOk = useMemo(() => {
    return (
      !!form.name.trim() &&
      !!form.username.trim() &&
      phoneValid &&
      passwordValid &&
      passwordMatch &&
      addressValid &&
      form.agreeService &&
      form.agreePolicy
    );
  }, [form, phoneValid, passwordValid, passwordMatch, addressValid]);

  const completeness = useMemo(() => {
    // 간단 가중치 (필수 중심)
    let s = 0;
    if (form.name.trim()) s += 10;
    if (form.username.trim()) s += 10;
    if (phoneValid) s += 10;
    if (passwordValid) s += 15;
    if (passwordMatch) s += 10;
    if (addressValid) s += 25;
    if (form.agreeService) s += 10;
    if (form.agreePolicy) s += 10;

    // 선택 체크박스 5p씩
    if (form.nightOK) s += 5;
    if (form.newbieOK) s += 5;
    if (form.hasGear) s += 5;
    if (form.needDorm) s += 5;

    return Math.min(100, s);
  }, [form, phoneValid, passwordValid, passwordMatch, addressValid]);

  /* ---------------- Kakao Postcode + Geocoding ---------------- */
  const openPostcode = () => {
    setMsg(null);
    if (!window.daum?.Postcode) {
      setMsg("우편번호 서비스를 불러오지 못했습니다.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: async (data: any) => {
        // 선택 완료 시
        const addr = data.roadAddress || data.address;
        setForm((f) => ({
          ...f,
          postalCode: data.zonecode || "",
          roadAddress: addr || "",
          detailAddress: "",
          lat: null,
          lng: null,
        }));
        // 좌표 변환
        await geocodeByKakao(addr);
      },
    }).open();
  };

  async function geocodeByKakao(address: string) {
    setMsg(null);
    try {
      const geocoder = new window.kakao.maps.services.Geocoder();
      await new Promise<void>((resolve) => {
        geocoder.addressSearch(address, (result: any[], status: string) => {
          if (status === window.kakao.maps.services.Status.OK && result?.[0]) {
            const r = result[0];
            const lat = Number(r.y);
            const lng = Number(r.x);
            setForm((f) => ({ ...f, lat, lng }));
          } else {
            setMsg("선택한 주소의 좌표를 찾지 못했습니다.");
          }
          resolve();
        });
      });
    } catch {
      setMsg("좌표 변환 중 오류가 발생했습니다.");
    }
  }

  /* ---------------- Submit ---------------- */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!requiredOk) {
      setMsg("필수 항목을 확인해 주세요.");
      return;
    }
    setSaving(true);
    try {
      // TODO: 백엔드 붙을 때 여기서 POST
      // await fetch("/api/signup/seeker", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(form) })
      console.log("[SeekerSignup payload]", {
        ...form,
        phoneNorm: form.phone.replace(/\D/g, ""),
      });
      setMsg("임시 제출 완료 (현재는 프론트만 구성). 콘솔을 확인하세요.");
    } catch {
      setMsg("제출 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

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

      {/* 로더 안내 */}
      {loadingScripts && (
        <div className="notice" style={{ color: "#666" }}>
          지도/우편번호 모듈 로딩 중…
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        {/* 기본 정보 */}
        <label>
          이름/닉네임
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="예: 홍길동 / 길동이"
            maxLength={30}
          />
        </label>

        <label>
          아이디
          <input
            className="input"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="예: worker01"
            autoComplete="username"
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
              placeholder={PASSWORD_POLICY.hint}
              autoComplete="new-password"
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
              autoComplete="new-password"
            />
          </label>
          {form.password && !passwordValid && (
            <div style={{ color: "#b91c1c", fontSize: 12 }}>
              {PASSWORD_POLICY.hint} ({SPECIAL_HINT})
            </div>
          )}
          {form.passwordConfirm && !passwordMatch && (
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
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              style={{ width: 140 }}
              readOnly
            />
            <button
              type="button"
              className="btn"
              onClick={openPostcode}
              disabled={loadingScripts}
            >
              카카오 주소 찾기
            </button>
          </div>

          <input
            className="input"
            placeholder="도로명 주소"
            value={form.roadAddress}
            onChange={(e) => setForm({ ...form, roadAddress: e.target.value })}
            readOnly
          />

          <input
            className="input"
            placeholder="상세 주소 (동/호 등)"
            value={form.detailAddress}
            onChange={(e) =>
              setForm({ ...form, detailAddress: e.target.value })
            }
          />

          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              placeholder="위도(lat)"
              value={form.lat ?? ""}
              readOnly
            />
            <input
              className="input"
              placeholder="경도(lng)"
              value={form.lng ?? ""}
              readOnly
            />
          </div>

          {!addressValid && (form.roadAddress || form.detailAddress) && (
            <div style={{ color: "#b91c1c", fontSize: 12 }}>
              주소 선택 후 좌표가 자동 입력되어야 합니다. (다시 “카카오 주소
              찾기”를 눌러주세요)
            </div>
          )}
        </div>

        {/* 선택 옵션 */}
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

        {/* 동의 */}
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
              (필수) 본 서비스는 <b>정보제공형</b>으로 직업소개/알선이 아니며,
              게시 정보의 사실 여부 및 활동 결과에 대해 법적 책임을 지지
              않습니다.
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
            type="submit"
            className="btn btn-primary"
            disabled={saving || loadingScripts}
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
