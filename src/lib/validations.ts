import { z } from "zod";

// ==========================================
// GYM REGISTRATION & FACILITY SCHEMA
// ==========================================

export const gymRegistrationSchema = z.object({
  name: z.string().min(2, "Gym name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  city: z.string().min(2, "City is required."),
  phone: z.string().optional(),
  amenities: z.array(z.string()).min(1, "Select at least one amenity."),
  verificationDoc: z.string().optional(),
});

export type GymRegistrationInput = z.infer<typeof gymRegistrationSchema>;

// ==========================================
// ROUTINE ARCHITECT & EXERCISE CREATION SCHEMA
// ==========================================

export const exerciseInputSchema = z.object({
  name: z.string().min(2, "Exercise name is required."),
  targetSets: z.number().min(1, "Target sets must be at least 1.").max(20, "Maximum 20 sets allowed."),
  targetReps: z.string().min(1, "Target reps required (e.g. '8-12' or 'x10')."),
  orderIndex: z.number().int().min(0),
});

export const routineCreationSchema = z.object({
  title: z.string().min(3, "Routine title must be at least 3 characters."),
  description: z.string().optional(),
  targetGroup: z.string().min(2, "Target muscle group is required."),
  exercises: z.array(exerciseInputSchema).min(1, "Routine must contain at least 1 exercise."),
});

export type RoutineCreationInput = z.infer<typeof routineCreationSchema>;

// ==========================================
// WORKOUT SESSION & LIVE SET LOGGING SCHEMA
// ==========================================

export const workoutSetLogSchema = z.object({
  exerciseId: z.string().min(1, "Exercise ID is required."),
  setNumber: z.number().int().min(1),
  repsCompleted: z.number().int().min(0),
  weightLbs: z.number().min(0, "Weight cannot be negative."),
  isCompleted: z.boolean().default(false),
});

export const workoutSessionSchema = z.object({
  routineId: z.string().min(1, "Routine ID is required."),
  durationSeconds: z.number().int().min(0),
  status: z.enum(["IN_PROGRESS", "COMPLETED", "ABANDONED"]).default("IN_PROGRESS"),
  setLogs: z.array(workoutSetLogSchema),
});

export type WorkoutSessionInput = z.infer<typeof workoutSessionSchema>;

// ==========================================
// PACKAGE BOOKING & MEMBERSHIP SCHEMA
// ==========================================

export const membershipBookingSchema = z.object({
  packageId: z.string().min(1, "Package ID is required."),
  tierType: z.enum(["PT_ONLY", "PT_GYM", "GYM_ONLY"]),
});

export type MembershipBookingInput = z.infer<typeof membershipBookingSchema>;

// ==========================================
// CHAT & COMMUNITY FORUM SCHEMAS
// ==========================================

export const chatMessageSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID is required."),
  content: z.string().min(1, "Message content cannot be empty.").max(1000, "Message too long."),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

export const forumThreadSchema = z.object({
  title: z.string().min(5, "Thread title must be at least 5 characters."),
  content: z.string().min(15, "Post content must be at least 15 characters long."),
  category: z.string().min(2, "Category is required."),
});

export type ForumThreadInput = z.infer<typeof forumThreadSchema>;

export const forumCommentSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required."),
  content: z.string().min(2, "Comment content cannot be empty."),
});

export type ForumCommentInput = z.infer<typeof forumCommentSchema>;
