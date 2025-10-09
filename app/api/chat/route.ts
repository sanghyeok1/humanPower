// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import {
  chatRooms,
  chatMessages,
  findAccountById,
  jobPostings,
} from "@/lib/mockdb";

// GET: 내 채팅방 목록 조회
export async function GET(req: NextRequest) {
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

  // 내가 참여한 채팅방 필터
  const myRooms = chatRooms.filter(
    (room) => room.employer_id === userId || room.seeker_id === userId
  );

  // 각 방의 상대방 정보 추가
  const roomsWithPartner = myRooms.map((room) => {
    const partnerId =
      room.employer_id === userId ? room.seeker_id : room.employer_id;
    const partner = findAccountById(partnerId);
    const unreadCount =
      user.role === "employer"
        ? room.unread_count_employer
        : room.unread_count_seeker;

    return {
      ...room,
      partner_name: partner?.display_name || "알 수 없음",
      partner_role: partner?.role,
      unread_count: unreadCount,
    };
  });

  return NextResponse.json({ rooms: roomsWithPartner });
}

// POST: 새 채팅방 생성 또는 기존 방 조회
export async function POST(req: NextRequest) {
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

  const body = await req.json();
  const { posting_id, employer_id } = body;

  if (!posting_id || !employer_id) {
    return NextResponse.json(
      { error: "Missing posting_id or employer_id" },
      { status: 400 }
    );
  }

  if (user.role !== "seeker") {
    return NextResponse.json(
      { error: "Only seekers can initiate chat" },
      { status: 403 }
    );
  }

  // 공고 확인
  const posting = jobPostings.find((p) => p.id === posting_id);
  if (!posting) {
    return NextResponse.json({ error: "Posting not found" }, { status: 404 });
  }

  // 기존 채팅방 확인
  const existingRoom = chatRooms.find(
    (room) =>
      room.posting_id === posting_id &&
      room.employer_id === employer_id &&
      room.seeker_id === userId
  );

  if (existingRoom) {
    return NextResponse.json({ room: existingRoom });
  }

  // 새 채팅방 생성
  const newRoom = {
    id: `room_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    posting_id: posting_id,
    posting_title: posting.title,
    employer_id: employer_id,
    seeker_id: userId,
    last_message_at: new Date().toISOString(),
    unread_count_employer: 0,
    unread_count_seeker: 0,
    created_at: new Date().toISOString(),
  };

  chatRooms.push(newRoom);

  return NextResponse.json({ room: newRoom });
}
