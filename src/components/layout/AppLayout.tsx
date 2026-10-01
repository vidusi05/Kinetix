"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Zap,
  User,
  UserCheck,
  Dumbbell,
  Compass,
  CalendarCheck,
  Flame,
  MessageSquare,
  Building2,
  Users,
  Search,
  Bell,
  LogOut,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar,
  CreditCard,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

export type WorkspaceRole = "client" | "pt" | "gymowner";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export interface AppLayoutProps {
  currentRole?: WorkspaceRole;
  activeTab?: string;
  onRoleChange?: (role: WorkspaceRole) => void;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentRole = "client",
  activeTab,
  onRoleChange,
  onTabChange,
  children,
}) => {
  const { data: session } = useSession();
  const [role, setRole] = useState<WorkspaceRole>(currentRole);

  React.useEffect(() => {
    setRole(currentRole);
  }, [currentRole]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // User details from session or defaults
  const userName = session?.user?.name || (role === "client" ? "Alex Vance" : role === "pt" ? "Marcus Vance" : "Dominic Vance");
  const userEmail = session?.user?.email || `${userName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@kinetix.fit`;
  const userAvatar = session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=e11d48&color=fff`;

  // Role Navigation Schemas
  const clientNav: NavItem[] = [
    { id: "discover", label: "Gym & Trainer Discovery", icon: Compass },
    { id: "booking", label: "Memberships & Booking", icon: CalendarCheck, badge: "8 Tiers" },
    { id: "workout", label: "Live Workout Tracker", icon: Flame, badge: "Active" },
    { id: "forum", label: "Community Forum", icon: MessageSquare },
  ];

  const trainerNav: NavItem[] = [
    { id: "chat", label: "Client Roster & Chat", icon: MessageSquare, badge: "3 Unread" },
    { id: "architect", label: "Routine Architect", icon: Dumbbell },
    { id: "schedule", label: "Training Schedule", icon: Calendar },
  ];

  const ownerNav: NavItem[] = [
    { id: "overview", label: "Facility Analytics", icon: BarChart3 },
    { id: "register", label: "Facility Profile & Verification", icon: Building2 },
    { id: "trainers", label: "Trainer Roster Management", icon: Users, badge: "1 Pending" },
    { id: "billing", label: "Revenue & Billing", icon: CreditCard },
  ];

  const currentNavItems =
    role === "client" ? clientNav : role === "pt" ? trainerNav : ownerNav;

  const defaultTab = currentNavItems[0].id;
  const activeNavId = activeTab || defaultTab;

  const handleRoleSelect = (newRole: WorkspaceRole) => {
    setRole(newRole);
    let firstTab = "discover";
    if (newRole === "client") firstTab = "workout";
    else if (newRole === "pt") firstTab = "architect";
    else if (newRole === "gymowner") firstTab = "register";

    if (onRoleChange) onRoleChange(newRole);
    if (onTabChange) onTabChange(firstTab);
  };

  const handleNavClick = (navId: string) => {
    if (onTabChange) onTabChange(navId);
  };

  return (
    <div className="flex h-screen w-screen bg-onyx-950 text-slate-100 overflow-hidden font-sans">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`flex flex-col bg-onyx-900 border-r border-onyx-800 transition-all duration-300 z-30 select-none ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand & User Profile Header (Top Left Profile Display) */}
        <div className="flex flex-col p-4 border-b border-onyx-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="p-2.5 rounded-xl bg-crimson/10 border border-crimson/30 text-crimson shadow-red-neon shrink-0">
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-widest text-white leading-tight">
                    KINETIX
                  </span>
                  <span className="text-[10px] font-bold text-crimson uppercase tracking-wider">
                    SaaS Engine
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-onyx-800 transition"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* User Profile Info Card on Top Left */}
          {!sidebarCollapsed && (
            <div className="p-2.5 rounded-xl bg-onyx-950 border border-onyx-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full border border-crimson/50 object-cover shrink-0"
                />
                <div className="flex flex-col truncate">
                  <span className="text-xs font-extrabold text-white truncate">{userName}</span>
                  <span className="text-[10px] text-slate-400 truncate">{userEmail}</span>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-slate-400 hover:text-crimson p-1.5 rounded-lg hover:bg-onyx-850 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Active Role Workspace Badge */}
        <div className="p-3 border-b border-onyx-800">
          {!sidebarCollapsed ? (
            <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-onyx-950 border border-onyx-800">
              {role === "client" ? (
                <>
                  <User className="w-4 h-4 text-crimson" />
                  <span className="text-xs font-bold text-white">Client Portal</span>
                </>
              ) : role === "pt" ? (
                <>
                  <UserCheck className="w-4 h-4 text-purpleGlow" />
                  <span className="text-xs font-bold text-white">Personal Trainer Portal</span>
                </>
              ) : (
                <>
                  <Dumbbell className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Gym Owner Console</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex justify-center p-1">
              {role === "client" ? (
                <User className="w-5 h-5 text-crimson" />
              ) : role === "pt" ? (
                <UserCheck className="w-5 h-5 text-purpleGlow" />
              ) : (
                <Dumbbell className="w-5 h-5 text-amber-400" />
              )}
            </div>
          )}
        </div>

        {/* Dynamic Contextual Navigation Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? role === "client"
                      ? "bg-crimson/15 text-crimson border border-crimson/30"
                      : role === "pt"
                      ? "bg-purpleGlow/15 text-purpleGlow border border-purpleGlow/30"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "text-slate-400 hover:text-white hover:bg-onyx-850"
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "animate-pulse" : ""}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!sidebarCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-onyx-800 text-slate-400 group-hover:bg-onyx-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-onyx-800 bg-onyx-950/50">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold text-slate-400 hover:text-crimson hover:bg-onyx-850 transition"
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-onyx-950">
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 bg-onyx-900 border-b border-onyx-800 px-6 flex items-center justify-between z-20 shrink-0">
          {/* Global Search Bar */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search gyms, trainers, routines, discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-onyx-950 border border-onyx-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-crimson transition"
            />
          </div>

          {/* Right Header User Profile Display */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-onyx-850 border border-onyx-800">
              <img
                src={userAvatar}
                alt={userName}
                className="w-5 h-5 rounded-full border border-crimson/50 object-cover"
              />
              <span className="text-xs font-extrabold text-white">{userName}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                ({role === "client" ? "Client" : role === "pt" ? "Trainer" : "Owner"})
              </span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-onyx-850 border border-onyx-800 text-slate-300 hover:text-white hover:border-onyx-700 transition relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-crimson" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-onyx-900 border border-onyx-800 rounded-2xl shadow-2xl p-3 z-50 space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-onyx-800">
                    <span className="text-xs font-bold text-white">Notifications</span>
                    <span className="text-[10px] text-crimson font-bold">2 New</span>
                  </div>
                  <div className="text-xs space-y-2">
                    <div className="p-2 rounded-lg bg-onyx-850 text-slate-300">
                      💪 Marcus Vance commented on your Bench Press form.
                    </div>
                    <div className="p-2 rounded-lg bg-onyx-850 text-slate-300">
                      🏋️ Iron Forge Athletics updated sauna hours.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN FLUID VIEWPORT CANVAS */}
        <main className="flex-1 overflow-y-auto p-6 bg-onyx-950 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
