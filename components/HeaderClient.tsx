// components/HeaderClient.tsx
"use client";

import { useState } from "react";
import AuthChoiceModal from "@/components/AuthChoiceModal";

export default function HeaderClient() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="nav">
        {/* 둘 중 아무 버튼이나 눌러도 동일 모달 오픈 */}
        <button className="nav-link" onClick={() => setOpen(true)}>
          로그인
        </button>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          회원가입
        </button>
      </nav>

      <AuthChoiceModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
