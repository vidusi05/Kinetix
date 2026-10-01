"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface SendMessagePayload {
  senderId?: string;
  receiverId?: string;
  content: string;
}

export async function sendChatMessage(payload: SendMessagePayload) {
  try {
    // Fallback Mock Users if IDs not provided
    let sender = payload.senderId
      ? await prisma.user.findUnique({ where: { id: payload.senderId } })
      : await prisma.user.findFirst({ where: { role: "TRAINER" } });

    let receiver = payload.receiverId
      ? await prisma.user.findUnique({ where: { id: payload.receiverId } })
      : await prisma.user.findFirst({ where: { role: "CLIENT" } });

    if (!sender) {
      sender = await prisma.user.findFirst();
    }
    if (!receiver) {
      receiver = await prisma.user.findFirst({ where: { id: { not: sender?.id } } });
    }

    if (!sender || !receiver) {
      throw new Error("Sender or receiver user missing in database.");
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        content: payload.content,
      },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
    });

    revalidatePath("/api/chat");
    return { success: true, data: message };
  } catch (error: any) {
    console.error("Server Action sendChatMessage Error:", error);
    return { success: false, error: error.message || "Failed to send message via Server Action" };
  }
}

export async function getChatHistory(senderId?: string, receiverId?: string) {
  try {
    const messages = await prisma.chatMessage.findMany({
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
      orderBy: { sentAt: "asc" },
    });

    return { success: true, data: messages };
  } catch (error: any) {
    console.error("Server Action getChatHistory Error:", error);
    return { success: false, error: "Failed to fetch chat history." };
  }
}
