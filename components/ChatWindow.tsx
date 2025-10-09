"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  sender_id: number;
  sender_role: "employer" | "seeker";
  message: string;
  created_at: string;
  read: boolean;
};

export default function ChatWindow({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const prevMessagesLengthRef = useRef(0);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // 3초마다 새 메시지 확인
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    // 메시지가 새로 추가되었을 때만 스크롤 (사용자가 입력 중일 때는 포커스 유지)
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom();
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/chat/${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        if (data.current_user_id) {
          setCurrentUserId(data.current_user_id);
        }
      } else {
        alert("메시지를 불러올 수 없습니다");
        router.push("/");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/chat/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      if (res.ok) {
        setNewMessage("");
        await loadMessages();
      } else {
        alert("메시지 전송 실패");
      }
    } catch (err) {
      alert("오류가 발생했습니다");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 100px)",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: 16,
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          className="btn"
          onClick={() => router.back()}
          style={{ padding: "6px 12px" }}
        >
          ← 뒤로
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>채팅</h2>
      </div>

      {/* 메시지 목록 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#9ca3af", marginTop: 40 }}>
            첫 메시지를 보내보세요!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = currentUserId !== null && msg.sender_id === currentUserId;

            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      background: isMe ? "#3b82f6" : "#f3f4f6",
                      color: isMe ? "#fff" : "#1f2937",
                      padding: "10px 14px",
                      borderRadius: 16,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.message}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      textAlign: isMe ? "right" : "left",
                    }}
                  >
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: 16,
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
          style={{
            flex: 1,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={sending || !newMessage.trim()}
        >
          {sending ? "전송 중..." : "전송"}
        </button>
      </form>
    </div>
  );
}
