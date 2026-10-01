import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";

    const gyms = await prisma.gymFacility.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { description: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          city ? { city: { contains: city, mode: "insensitive" } } : {},
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        trainers: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        packages: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: gyms.length, data: gyms });
  } catch (error: any) {
    console.error("GET /api/gyms Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gym facilities." },
      { status: 500 }
    );
  }
}
