import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days persistent cookie session
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        action: { label: "Action", type: "text" }, // "signin" | "signup"
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const action = credentials.action || "signin";
        const email = credentials.email.toLowerCase().trim();
        const roleInput = (credentials.role || "client").toUpperCase();

        let targetRole: UserRole = UserRole.CLIENT;
        if (roleInput === "TRAINER" || roleInput === "PT") targetRole = UserRole.TRAINER;
        if (roleInput === "GYM_OWNER" || roleInput === "GYMOWNER" || roleInput === "OWNER") targetRole = UserRole.GYM_OWNER;

        // SIGN UP FLOW
        if (action === "signup") {
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            throw new Error("An account with this email already exists. Please sign in instead.");
          }

          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const userName = credentials.name?.trim() || email.split("@")[0];

          const newUser = await prisma.user.create({
            data: {
              name: userName,
              email,
              password: hashedPassword,
              role: targetRole,
              avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=e11d48&color=fff`,
            },
          });

          // Create corresponding profile records if trainer
          if (targetRole === UserRole.TRAINER) {
            await prisma.trainerProfile.create({
              data: {
                userId: newUser.id,
                specialties: ["Personal Training"],
                bio: "Certified Personal Trainer",
                hourlyRate: 90.0,
              },
            });
          }

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            image: newUser.avatarUrl,
          };
        }

        // SIGN IN FLOW
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!existingUser) {
          throw new Error("No account found with this email. Please sign up first.");
        }

        // Verify Password if stored
        if (existingUser.password) {
          const isValidPassword = await bcrypt.compare(credentials.password, existingUser.password);
          if (!isValidPassword) {
            throw new Error("Invalid password. Please try again.");
          }
        } else {
          // Update password for seed users
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { password: hashedPassword },
          });
        }

        // If user signs in selecting a specific role (e.g. gymowner/trainer), update user role in DB
        if (credentials.role && existingUser.role !== targetRole) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { role: targetRole },
          });
          existingUser.role = targetRole;
        }

        return {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          image: existingUser.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = (user as any).role || "CLIENT";
      } else if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, name: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id;
        session.user.name = token.name;
        (session.user as any).role = token.role || "CLIENT";
      }
      return session;
    },
  },
};
