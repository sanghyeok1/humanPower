// app/chat/page.tsx
import { getServerAccount } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatList from "@/components/ChatList";

export default async function ChatListPage() {
  const me = await getServerAccount();
  if (!me) redirect("/login");

  return (
    <main className="page">
      <div className="board">
        <h1 className="page-title">채팅</h1>
        <ChatList />
      </div>
    </main>
  );
}
