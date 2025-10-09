// app/chat/[roomId]/page.tsx
import { getServerAccount } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const me = await getServerAccount();
  if (!me) redirect("/login");

  const { roomId } = await params;

  return (
    <main className="page">
      <div className="board" style={{ maxWidth: 800 }}>
        <ChatWindow roomId={roomId} />
      </div>
    </main>
  );
}
