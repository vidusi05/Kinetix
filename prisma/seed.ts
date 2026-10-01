import { PrismaClient, UserRole, FacilityStatus, TierType, RosterStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Kinetix database seeding...");

  // Clear existing data to ensure idempotent seed runs
  await prisma.forumComment.deleteMany();
  await prisma.forumThread.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.workoutSetLog.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.routine.deleteMany();
  await prisma.userPackage.deleteMany();
  await prisma.membershipPackage.deleteMany();
  await prisma.trainerProfile.deleteMany();
  await prisma.gymFacility.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const clientUser = await prisma.user.create({
    data: {
      email: "alex.vance@kinetix.fit",
      name: "Alex Vance",
      role: UserRole.CLIENT,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    },
  });

  const gymOwnerUser = await prisma.user.create({
    data: {
      email: "owner@ironforge.fit",
      name: "Dominic Vance",
      role: UserRole.GYM_OWNER,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
  });

  const trainerMarcusUser = await prisma.user.create({
    data: {
      email: "marcus.vance@kinetix.fit",
      name: "Marcus Vance",
      role: UserRole.TRAINER,
      avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150",
    },
  });

  const trainerElenaUser = await prisma.user.create({
    data: {
      email: "elena.rostova@kinetix.fit",
      name: "Elena Rostova",
      role: UserRole.TRAINER,
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    },
  });

  console.log("✅ Users created.");

  // 2. Create Gym Facility
  const gymFacility = await prisma.gymFacility.create({
    data: {
      name: "Iron Forge Athletics",
      description: "State-of-the-art strength compound & recovery facility with competition equipment and 24/7 keycard access.",
      address: "742 Evergreen Terrace, Suite 100",
      city: "Metropolis",
      phone: "+1 (555) 019-2831",
      status: FacilityStatus.VERIFIED,
      verificationDoc: "iron_forge_permit_2026.pdf",
      amenities: ["Sauna & Cold Plunge", "24/7 Keycard Entry", "Powerlifting Platforms", "Personal Training Studio", "Turf Sprint Track"],
      ownerId: gymOwnerUser.id,
    },
  });

  console.log("✅ Gym Facility created:", gymFacility.name);

  // 3. Create Trainer Profiles
  const marcusProfile = await prisma.trainerProfile.create({
    data: {
      userId: trainerMarcusUser.id,
      gymId: gymFacility.id,
      specialties: ["Bodybuilding", "Powerlifting", "Hypertrophy"],
      bio: "IFBB Pro Trainer with over 10 years of experience coaching national strength athletes.",
      hourlyRate: 95.0,
      rosterStatus: RosterStatus.APPROVED,
    },
  });

  const elenaProfile = await prisma.trainerProfile.create({
    data: {
      userId: trainerElenaUser.id,
      gymId: gymFacility.id,
      specialties: ["Functional Fitness", "Mobility", "HIIT Conditioning"],
      bio: "Elite Athletic Conditioning Coach specializing in mobility restoration and high-performance cardiovascular endurance.",
      hourlyRate: 85.0,
      rosterStatus: RosterStatus.APPROVED,
    },
  });

  console.log("✅ Trainer Profiles created.");

  // 4. Create Membership Packages
  const packages = await Promise.all([
    // PT Only Tiers
    prisma.membershipPackage.create({
      data: {
        name: "Rookie PT",
        price: 150,
        tierType: TierType.PT_ONLY,
        description: "Introductory 1-on-1 coaching for fitness beginners",
        features: ["4 PT Sessions / Month", "Basic Macro Guidance", "App Custom Workout Plan"],
        isPopular: false,
        gymId: gymFacility.id,
      },
    }),
    prisma.membershipPackage.create({
      data: {
        name: "Alpha Iron",
        price: 280,
        tierType: TierType.PT_ONLY,
        description: "High-intensity coaching & 24/7 active support",
        features: ["8 PT Sessions / Month", "Detailed Meal Plan Sync", "Direct PT 24/7 Chat Access", "Form Assessment Reviews"],
        isPopular: true,
        gymId: gymFacility.id,
      },
    }),
    prisma.membershipPackage.create({
      data: {
        name: "Elite Savage",
        price: 450,
        tierType: TierType.PT_ONLY,
        description: "Premium competitive body conditioning & peak prep",
        features: ["12 PT Sessions / Month", "Bespoke Competition Prep", "Bi-weekly Strength Metrics Review", "Priority Scheduler"],
        isPopular: false,
        gymId: gymFacility.id,
      },
    }),
    // PT + Gym Hybrid Tiers
    prisma.membershipPackage.create({
      data: {
        name: "Iron Hybrid",
        price: 210,
        tierType: TierType.PT_GYM,
        description: "Gym access paired with professional 1-on-1 coaching",
        features: ["All Gym Facilities Access", "4 PT Sessions / Month", "Custom Program Builder"],
        isPopular: false,
        gymId: gymFacility.id,
      },
    }),
    prisma.membershipPackage.create({
      data: {
        name: "Titan Force",
        price: 340,
        tierType: TierType.PT_GYM,
        description: "The ultimate hybrid body transformation program",
        features: ["All Gym Facilities Access", "8 PT Sessions / Month", "Custom Meal Plans", "Premium Recovery Room Access"],
        isPopular: true,
        gymId: gymFacility.id,
      },
    }),
    prisma.membershipPackage.create({
      data: {
        name: "Apex Elite",
        price: 520,
        tierType: TierType.PT_GYM,
        description: "Fully managed fitness and recovery lifestyle membership",
        features: ["24/7 VIP Gym Access", "12 PT Sessions / Month", "Dedicated PT Coach", "Unlimited Sauna & Cold Plunge"],
        isPopular: false,
        gymId: gymFacility.id,
      },
    }),
    // Gym Only Tiers
    prisma.membershipPackage.create({
      data: {
        name: "Standard Club",
        price: 49,
        tierType: TierType.GYM_ONLY,
        description: "General facility entry during standard operational hours",
        features: ["Gym Floor & Free Weights Access", "Locker Room & Shower Access", "Standard Gym Hours (6AM - 10PM)"],
        isPopular: false,
        gymId: gymFacility.id,
      },
    }),
    prisma.membershipPackage.create({
      data: {
        name: "Iron Club VIP",
        price: 79,
        tierType: TierType.GYM_ONLY,
        description: "Unrestricted 24/7 access with premium recovery perks",
        features: ["24/7 Full Keycard Access", "Sauna & Steam Access", "1 Free Trainer Consult / Month", "1 Guest Pass Per Visit"],
        isPopular: true,
        gymId: gymFacility.id,
      },
    }),
  ]);

  console.log(`✅ ${packages.length} Membership Packages created.`);

  // Assign active package to client
  await prisma.userPackage.create({
    data: {
      userId: clientUser.id,
      packageId: packages[1].id, // Alpha Iron
      active: true,
    },
  });

  // 5. Create Routines & Exercises
  const pushRoutine = await prisma.routine.create({
    data: {
      title: "Hypertrophy Push Alpha",
      slug: "hypertrophy-push-alpha",
      description: "High volume chest, shoulder, and triceps hypertrophy builder designed by Marcus Vance.",
      targetGroup: "Chest, Shoulders & Triceps",
      authorId: marcusProfile.id,
      exercises: {
        create: [
          { name: "Barbell Bench Press", targetSets: 3, targetReps: "x10", orderIndex: 0 },
          { name: "Incline Dumbbell Chest Press", targetSets: 3, targetReps: "x8-12", orderIndex: 1 },
          { name: "Overhead Barbell Press", targetSets: 3, targetReps: "x10", orderIndex: 2 },
          { name: "Weighted Chest Dips", targetSets: 3, targetReps: "x Max reps", orderIndex: 3 },
          { name: "Skull Crushers (EZ Bar)", targetSets: 3, targetReps: "x12", orderIndex: 4 },
        ],
      },
    },
  });

  const pullRoutine = await prisma.routine.create({
    data: {
      title: "Pull & Back Power",
      slug: "pull-back-power",
      description: "Posterior chain hypertrophy and lats width routine.",
      targetGroup: "Back & Biceps",
      authorId: elenaProfile.id,
      exercises: {
        create: [
          { name: "Deadlift (Heavy)", targetSets: 4, targetReps: "x5", orderIndex: 0 },
          { name: "Weighted Pullups", targetSets: 3, targetReps: "x8", orderIndex: 1 },
          { name: "Bent Over Barbell Rows", targetSets: 3, targetReps: "x10", orderIndex: 2 },
        ],
      },
    },
  });

  console.log("✅ Routines & Exercises seeded.");

  // 6. Create Chat Messages
  await prisma.chatMessage.createMany({
    data: [
      {
        senderId: clientUser.id,
        receiverId: trainerMarcusUser.id,
        content: "Hey Marcus, just finished the Hypertrophy Push Alpha workout! Felt great on the bench press today.",
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        senderId: trainerMarcusUser.id,
        receiverId: clientUser.id,
        content: "Awesome work Alex! Keep pushing progressive overload. Make sure to hit your protein goal tonight.",
        sentAt: new Date(Date.now() - 1000 * 60 * 30),
      },
    ],
  });

  console.log("✅ Chat Messages seeded.");

  // 7. Create Forum Threads & Comments
  const thread1 = await prisma.forumThread.create({
    data: {
      title: "How do you structure progressive overload on Bench Press?",
      content: "I've been stuck at 225lbs for 3 weeks. Should I drop the weight and add volume, or start using micro-plates?",
      category: "Training & Form",
      authorId: clientUser.id,
      comments: {
        create: [
          {
            content: "Focus on adding 2.5lb micro-plates each week while locking in standard RPE 8-9. Also check your shoulder blade retraction!",
            authorId: trainerMarcusUser.id,
          },
        ],
      },
    },
  });

  const thread2 = await prisma.forumThread.create({
    data: {
      title: "Pre-workout hydration and sodium intake protocol",
      content: "Here is a breakdown of optimal intra-workout electrolytes and sodium timing for maximal muscle pump during heavy training sessions.",
      category: "Nutrition & Recovery",
      authorId: trainerElenaUser.id,
    },
  });

  console.log("✅ Forum Threads & Comments seeded.");
  console.log("🚀 Kinetix Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
