import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { NotificationProvider } from "@/components/providers/NotificationProvider";

export const metadata: Metadata = {
  title: "Kinetix - Premium Multi-Role Fitness Platform",
  description: "Production-ready full-stack fitness application built with Next.js, Prisma, Zod, and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-onyx-950 text-slate-100 min-h-screen antialiased">
        <SessionProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
