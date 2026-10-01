import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const specialty = searchParams.get("specialty") || "";

    const trainers = await prisma.trainerProfile.findMany({
      where: {
        AND: [
          query
            ? {
                user: {
                  name: { contains: query, mode: "insensitive" },
                },
              }
            : {},
          specialty
            ? {
                specialties: {
                  has: specialty,
                },
              }
            : {},
        ],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        gym: {
          select: { id: true, name: true, city: true },
        },
        routines: {
          select: { id: true, title: true, targetGroup: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: trainers.length, data: trainers });
  } catch (error: any) {
    console.error("GET /api/trainers Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trainer profiles." },
      { status: 500 }
    );
  }
}
