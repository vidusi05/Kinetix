import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { routineCreationSchema } from "@/lib/validations";

export async function GET() {
  try {
    const routines = await prisma.routine.findMany({
      include: {
        author: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        exercises: {
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: routines.length, data: routines });
  } catch (error: any) {
    console.error("GET /api/routines Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch routines." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate payload against Zod Schema
    const validation = routineCreationSchema.safeParse(body);
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

    const { title, description, targetGroup, exercises } = validation.data;

    // Fallback Mock Trainer Author (Marcus Vance)
    let trainerProfile = await prisma.trainerProfile.findFirst({
      include: { user: true },
    });

    if (!trainerProfile) {
      const defaultUser = await prisma.user.create({
        data: {
          email: "marcus.default@kinetix.fit",
          name: "Marcus Vance",
          role: "TRAINER",
        },
      });

      trainerProfile = await prisma.trainerProfile.create({
        data: {
          userId: defaultUser.id,
          specialties: ["Hypertrophy"],
          bio: "IFBB Trainer",
          hourlyRate: 95.0,
        },
        include: { user: true },
      });
    }

    // Generate unique slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Date.now()}`;

    // Create Routine with Nested Exercises using Prisma Transaction
    const newRoutine = await prisma.routine.create({
      data: {
        title,
        slug,
        description: description || null,
        targetGroup,
        authorId: trainerProfile.id,
        exercises: {
          create: exercises.map((ex, idx) => ({
            name: ex.name,
            targetSets: ex.targetSets,
            targetReps: ex.targetReps,
            orderIndex: ex.orderIndex !== undefined ? ex.orderIndex : idx,
          })),
        },
      },
      include: {
        exercises: {
          orderBy: { orderIndex: "asc" },
        },
        author: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Routine schema successfully created.",
        data: newRoutine,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/routines Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create routine." },
      { status: 500 }
    );
  }
}
