// components/AuthChoiceModal.tsx
"use client";

import { useEffect } from "react";

export default function AuthChoiceModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const goto = (href: string) => {
    window.location.href = href;
  };

  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-card" role="document">
        <h3 className="modal-title">어떤 작업을 하실까요?</h3>
        <p className="modal-sub">로그인 또는 회원 유형을 선택하세요.</p>

        <div className="modal-actions">
          <button className="btn w-full" onClick={() => goto("/login")}>
            로그인
          </button>
          <button
            className="btn w-full"
            onClick={() => goto("/signup?role=seeker")}
          >
            구직자 회원가입
          </button>
          <button
            className="btn w-full"
            onClick={() => goto("/signup?role=employer")}
          >
            구인자 회원가입
          </button>
        </div>

        <button className="modal-close" aria-label="Close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
