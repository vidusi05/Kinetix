import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatMessageSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const senderId = searchParams.get("senderId");
    const receiverId = searchParams.get("receiverId");

    const messages = await prisma.chatMessage.findMany({
      where:
        senderId && receiverId
          ? {
              OR: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId },
              ],
            }
          : {},
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
      orderBy: { sentAt: "asc" },
    });

    return NextResponse.json({ success: true, count: messages.length, data: messages });
  } catch (error: any) {
    console.error("GET /api/chat Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chat messages." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = chatMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { receiverId, content } = validation.data;

    // Fallback Mock Sender (Alex Vance or Marcus Vance)
    const senderUser = await prisma.user.findFirst({
      where: { role: "TRAINER" },
    });

    if (!senderUser) {
      return NextResponse.json(
        { success: false, error: "Sender user not found." },
        { status: 404 }
      );
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId: senderUser.id,
        receiverId,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json(
      { success: true, message: "Chat message sent.", data: message },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/chat Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send chat message." },
      { status: 500 }
    );
  }
}
