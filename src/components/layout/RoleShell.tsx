"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  UserCheck,
  Dumbbell,
  Compass,
  CalendarCheck,
  Flame,
  MessageSquare,
  Building2,
  Users,
  Wifi,
  BatteryCharging,
  Zap,
  ShieldCheck,
  Award,
  Sparkles,
} from "lucide-react";

export type RoleType = "client" | "pt" | "gymowner";

export interface RoleShellProps {
  initialRole?: RoleType;
  children?: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onRoleChange?: (role: RoleType) => void;
}

export const RoleShell: React.FC<RoleShellProps> = ({
  initialRole = "client",
  children,
  activeTab,
  onTabChange,
  onRoleChange,
}) => {
  const [currentRole, setCurrentRole] = useState<RoleType>(initialRole);
  const [currentTab, setCurrentTab] = useState<string>(activeTab || "workout");
  const [currentTime, setCurrentTime] = useState("09:41");

  // Sync Live Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const mins = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${mins}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync default tab on role switch
  const handleRoleSwitch = (role: RoleType) => {
    setCurrentRole(role);
    let defaultTab = "workout";
    if (role === "client") defaultTab = "workout";
    else if (role === "pt") defaultTab = "architect";
    else if (role === "gymowner") defaultTab = "register";

    setCurrentTab(defaultTab);
    if (onRoleChange) onRoleChange(role);
    if (onTabChange) onTabChange(defaultTab);
  };

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  return (
    <div className="min-h-screen bg-onyx-950 text-slate-100 flex flex-col items-center justify-between p-2 md:p-6 font-sans">
      {/* Showcase Header */}
      <header className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between py-4 px-6 mb-4 rounded-2xl bg-onyx-900 border border-onyx-800 shadow-xl gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-crimson/10 border border-crimson/30 text-crimson shadow-red-neon">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-widest text-white">KINETIX</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-crimson/20 text-crimson border border-crimson/30">
                {currentRole === "client" ? "Client View" : currentRole === "pt" ? "Trainer Portal" : "Gym Owner"}
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-Role Premium Fitness Architecture Prototype</p>
          </div>
        </div>

        {/* Top Role Switcher */}
        <div className="flex items-center bg-onyx-950 p-1.5 rounded-xl border border-onyx-800">
          <button
            onClick={() => handleRoleSwitch("client")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              currentRole === "client"
                ? "bg-crimson text-white shadow-red-neon"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Client App</span>
          </button>

          <button
            onClick={() => handleRoleSwitch("pt")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              currentRole === "pt"
                ? "bg-purpleGlow text-white shadow-purple-neon"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Trainer Portal</span>
          </button>

          <button
            onClick={() => handleRoleSwitch("gymowner")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              currentRole === "gymowner"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Gym Owner</span>
          </button>
        </div>
      </header>

      {/* Main Viewport Section (Centered Phone Mock + Info Sidebar on Desktop) */}
      <main className="w-full max-w-5xl flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 py-2">
        {/* Phone Mock Outer Frame Wrapper */}
        <div className="relative w-full max-w-[390px] h-[780px] bg-onyx-900 border-[10px] border-onyx-800 rounded-[50px] shadow-phone phone-glow-effect flex flex-col overflow-hidden">
          {/* Dynamic Island / Camera Notch */}
          <div className="relative w-full h-8 bg-onyx-950 flex items-center justify-between px-6 pt-2 select-none z-30">
            {/* Status Bar Clock */}
            <span className="text-[11px] font-bold text-slate-300 font-mono">{currentTime}</span>

            {/* Dynamic Island Badge */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1.5 px-3 py-0.5 rounded-full bg-onyx-900 border border-onyx-700 flex items-center space-x-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-crimson animate-ping" />
              <span className="text-[10px] font-bold text-slate-200 tracking-wider uppercase">KINETIX CORE</span>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Wifi className="w-3.5 h-3.5" />
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Screen Content Window */}
          <div className="flex-1 bg-onyx-950 overflow-hidden flex flex-col relative">
            {children}
          </div>

          {/* Bottom Role-Aware Navigation Bar */}
          <nav className="w-full bg-onyx-900 border-t border-onyx-800 px-4 py-2 flex items-center justify-around z-30">
            {currentRole === "client" && (
              <>
                <button
                  onClick={() => handleTabClick("discover")}
                  className={`flex flex-col items-center space-y-1 transition ${
                    currentTab === "discover" ? "text-crimson font-bold" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Compass className="w-5 h-5" />
                  <span className="text-[10px]">Discover</span>
                </button>

                <button
                  onClick={() => handleTabClick("booking")}
                  className={`flex flex-col items-center space-y-1 transition ${
                    currentTab === "booking" ? "text-crimson font-bold" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <CalendarCheck className="w-5 h-5" />
                  <span className="text-[10px]">Packages</span>
                </button>

                <button
                  onClick={() => handleTabClick("workout")}
                  className={`flex flex-col items-center space-y-1 transition ${
                    currentTab === "workout" ? "text-crimson font-bold" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Flame className="w-5 h-5" />
                  <span className="text-[10px]">Active Tracker</span>
                </button>

                <button
                  onClick={() => handleTabClick("forum")}
                  className={`flex flex-col items-center space-y-1 transition ${
                    currentTab === "forum" ? "text-crimson font-bold" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-[10px]">Forum</span>
                </button>
              </>
            )}

            {currentRole === "pt" && (
              <>
                <button
                  onClick={() => handleTabClick("chat")}
                  className={`flex flex-col items-center space-y-1 transition ${
                    currentTab === "chat" ? "text-purpleGlow font-bold" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-[10px]">Client Chat</span>
                </button>

                <button
                  onClick={() => handleTabClick("architect")}
                  className={`flex flex-col items-center space-y-1 transition ${
                    currentTab === "architect" ? "text-purpleGlow font-bold" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Dumbbell className="w-5 h-5" />
                  <span className="text-[10px]">Routine Builder</span>
                </button>
              </>
            )}

            {currentRole === "gymowner" && (
              <>
                <button
                  onClick={() => handleTabClick("register")}
                  className={`flex flex-col items-center space-y-1 transition ${
                    currentTab === "register" ? "text-amber-400 font-bold" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-[10px]">Register Facility</span>
                </button>

                <button
                  onClick={() => handleTabClick("trainers")}
                  className={`flex flex-col items-center space-y-1 transition ${
                    currentTab === "trainers" ? "text-amber-400 font-bold" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-[10px]">Trainer Roster</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Info Sidebar Panel for Desktop Preview */}
        <div className="hidden lg:flex flex-col flex-1 p-6 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-4 max-w-md">
          <div className="flex items-center space-x-2 text-crimson">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Interface Architecture</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Kinetix is designed with a unified dark onyx theme, crimson red accents, and purple trainer highlights. Switch roles above to inspect live interfaces across Client, Personal Trainer, and Gym Owner perspectives.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-onyx-850 border border-onyx-800">
              <div className="w-6 h-6 rounded-full bg-crimson/20 text-crimson font-bold text-xs flex items-center justify-center mt-0.5">
                1
              </div>
              <div>
                <strong className="text-xs text-slate-200">Client View</strong>
                <p className="text-[11px] text-slate-400">Discover gyms, book membership packages, log active workout sets, and post in community forums.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-xl bg-onyx-850 border border-onyx-800">
              <div className="w-6 h-6 rounded-full bg-purpleGlow/20 text-purpleGlow font-bold text-xs flex items-center justify-center mt-0.5">
                2
              </div>
              <div>
                <strong className="text-xs text-slate-200">Trainer Portal</strong>
                <p className="text-[11px] text-slate-400">Architect workout routines, reorder exercises with up/down controls, and chat with clients in real-time.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-xl bg-onyx-850 border border-onyx-800">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center mt-0.5">
                3
              </div>
              <div>
                <strong className="text-xs text-slate-200">Gym Owner Dashboard</strong>
                <p className="text-[11px] text-slate-400">Onboard gym facilities with amenity verification and manage personal trainer roster approval statuses.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Showcase Footer */}
      <footer className="w-full max-w-5xl py-3 text-center text-xs text-slate-500 border-t border-onyx-900 mt-4">
        &copy; 2026 Kinetix Fitness Platform • Full-Stack Next.js (App Router), Prisma, Tailwind & Zod.
      </footer>
    </div>
  );
};
