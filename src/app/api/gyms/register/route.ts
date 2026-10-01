import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gymRegistrationSchema } from "@/lib/validations";
import { FacilityStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate payload with Zod
    const validationResult = gymRegistrationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Fallback Mock Owner (Dominic Vance / Gym Owner)
    let owner = await prisma.user.findFirst({
      where: { role: "GYM_OWNER" },
    });

    if (!owner) {
      owner = await prisma.user.create({
        data: {
          email: "owner.default@kinetix.fit",
          name: "Dominic Vance",
          role: "GYM_OWNER",
        },
      });
    }

    // Create Gym Facility in Database
    const newFacility = await prisma.gymFacility.create({
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        phone: data.phone || null,
        amenities: data.amenities,
        verificationDoc: data.verificationDoc || null,
        status: FacilityStatus.PENDING_REVIEW,
        ownerId: owner.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Gym facility onboarding request submitted successfully.",
        data: newFacility,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/gyms/register Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register gym facility." },
      { status: 500 }
    );
  }
}
