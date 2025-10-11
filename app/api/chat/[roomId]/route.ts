// app/api/chat/[roomId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { chatRooms, chatMessages, findAccountById } from "@/lib/mockdb";

// GET: 채팅방 메시지 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const token = req.cookies.get("hp_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === "string") {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = Number((decoded as any).sub);
  const user = findAccountById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const { roomId } = await params;

  // 채팅방 확인
  const room = chatRooms.find((r) => r.id === roomId);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // 권한 확인
  if (room.employer_id !== userId && room.seeker_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 메시지 조회
  const messages = chatMessages.filter((msg) => msg.room_id === roomId);

  // 읽음 처리
  chatMessages.updateRead(roomId, userId);

  // 읽지 않은 메시지 수 초기화
  const updateData: Partial<typeof room> = {};
  if (user.role === "employer") {
    updateData.unread_count_employer = 0;
  } else {
    updateData.unread_count_seeker = 0;
  }
  chatRooms.update(roomId, updateData);

  return NextResponse.json({ messages, current_user_id: userId });
}

// POST: 메시지 전송
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const token = req.cookies.get("hp_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === "string") {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = Number((decoded as any).sub);
  const user = findAccountById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const { roomId } = await params;
  const body = await req.json();
  const { message } = body;

  if (!message || !message.trim()) {
    return NextResponse.json(
      { error: "Message cannot be empty" },
      { status: 400 }
    );
  }

  // 채팅방 확인
  const room = chatRooms.find((r) => r.id === roomId);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // 권한 확인
  if (room.employer_id !== userId && room.seeker_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 메시지 생성
  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    room_id: roomId,
    sender_id: userId,
    sender_role: user.role,
    message: message.trim(),
    created_at: new Date().toISOString(),
    read: false,
  };

  chatMessages.push(newMessage);

  // 채팅방 업데이트
  const updateData: Partial<typeof room> = {
    last_message: message.trim(),
    last_message_at: newMessage.created_at,
  };

  // 상대방 읽지 않은 메시지 수 증가
  if (user.role === "employer") {
    updateData.unread_count_seeker = room.unread_count_seeker + 1;
  } else {
    updateData.unread_count_employer = room.unread_count_employer + 1;
  }

  chatRooms.update(roomId, updateData);

  return NextResponse.json({ message: newMessage });
}
