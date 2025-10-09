"use client";

import { useState } from "react";
import ResumeSelectModal from "./ResumeSelectModal";

type Props = {
  postingId: string;
};

export default function ApplyButton({ postingId }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button className="btn" onClick={() => setShowModal(true)}>
        📝 지원하기
      </button>

      {showModal && (
        <ResumeSelectModal
          postingId={postingId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
