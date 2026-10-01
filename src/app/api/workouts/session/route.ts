import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { workoutSessionSchema } from "@/lib/validations";
import { WorkoutStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate payload against Zod Schema
    const validation = workoutSessionSchema.safeParse(body);
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

    const { routineId, durationSeconds, status, setLogs } = validation.data;

    // Fallback Mock Client User (Alex Vance)
    let clientUser = await prisma.user.findFirst({
      where: { role: "CLIENT" },
    });

    if (!clientUser) {
      clientUser = await prisma.user.create({
        data: {
          email: "alex.vance@kinetix.fit",
          name: "Alex Vance",
          role: "CLIENT",
        },
      });
    }

    // Verify or fallback Routine ID
    let targetRoutine = await prisma.routine.findUnique({
      where: { id: routineId },
    });

    if (!targetRoutine) {
      // Find seeded push routine or default routine
      targetRoutine = await prisma.routine.findFirst();
    }

    if (!targetRoutine) {
      return NextResponse.json(
        { success: false, error: "No target routine schema found in database." },
        { status: 404 }
      );
    }

    // Execute Atomic Transaction with prisma.$transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Workout Session Record
      const session = await tx.workoutSession.create({
        data: {
          userId: clientUser!.id,
          routineId: targetRoutine!.id,
          status: status as WorkoutStatus,
          durationSeconds: durationSeconds,
          completedAt: status === "COMPLETED" ? new Date() : null,
        },
      });

      // 2. Create Set Logs for the session
      if (setLogs && setLogs.length > 0) {
        await tx.workoutSetLog.createMany({
          data: setLogs.map((log) => ({
            workoutSessionId: session.id,
            exerciseId: log.exerciseId,
            setNumber: log.setNumber,
            repsCompleted: log.repsCompleted,
            weightLbs: log.weightLbs,
            isCompleted: log.isCompleted,
          })),
        });
      }

      return await tx.workoutSession.findUnique({
        where: { id: session.id },
        include: {
          routine: true,
          setLogs: {
            include: { exercise: true },
          },
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Workout session metrics successfully persisted to database.",
        data: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/workouts/session Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to persist workout session metrics." },
      { status: 500 }
    );
  }
}
