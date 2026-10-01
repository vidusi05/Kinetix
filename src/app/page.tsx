"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { AppLayout, WorkspaceRole } from "@/components/layout/AppLayout";
import { ActiveWorkoutSession } from "@/components/client/ActiveWorkoutSession";
import { RoutineArchitect } from "@/components/pt/RoutineArchitect";
import { ChatTerminal } from "@/components/pt/ChatTerminal";
import { AuthModal } from "@/components/auth/AuthModal";
import { useNotification } from "@/components/providers/NotificationProvider";
import {
  Zap,
  User,
  UserCheck,
  Dumbbell,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Compass,
  CalendarCheck,
  Flame,
  MessageSquare,
  Building2,
  Users,
  MapPin,
  Star,
  Check,
  Plus,
  CheckCircle2,
  UploadCloud,
  Lock,
  CreditCard,
  DollarSign,
  Download,
  Receipt,
  Banknote,
  X,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const { showToast, showModal } = useNotification();

  // Dashboard Role & Tab State
  const [role, setRole] = useState<WorkspaceRole>("client");
  const [activeTab, setActiveTab] = useState<string>("workout");

  // Sync initial workspace role from user session role in DB
  React.useEffect(() => {
    if (session?.user) {
      const userRole = String((session.user as any).role || "").toUpperCase();
      if (userRole === "TRAINER" || userRole === "PT") {
        setRole("pt");
        setActiveTab("architect");
      } else if (userRole === "GYM_OWNER" || userRole === "GYMOWNER" || userRole === "OWNER") {
        setRole("gymowner");
        setActiveTab("overview");
      } else {
        setRole("client");
        setActiveTab("workout");
      }
    }
  }, [session]);

  // Auth Modal State for Landing Page
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"client" | "trainer" | "gymowner">("client");

  // Client Dashboard State
  const [forumCategory, setForumCategory] = useState<string>("All");
  const [tierFilter, setTierFilter] = useState<"all" | "pt-only" | "pt-gym" | "gym-only">("all");

  // All 9 Package Tiers Data
  const allPackages = [
    // PT ONLY
    {
      id: "rookie-pt",
      name: "Rookie PT",
      price: 150,
      type: "pt-only",
      tierLabel: "PT ONLY",
      desc: "Introductory 1-on-1 coaching for beginners",
      features: ["4 PT Sessions / Month", "Basic Macro Guidance", "App Custom Workout Plan"],
      popular: false,
    },
    {
      id: "alpha-iron",
      name: "Alpha Iron",
      price: 280,
      type: "pt-only",
      tierLabel: "PT ONLY",
      desc: "High-intensity coaching & support",
      features: [
        "8 PT Sessions / Month",
        "Detailed Meal Plan Sync",
        "Direct PT 24/7 Chat Access",
        "Form Assessment Reviews",
      ],
      popular: true,
    },
    {
      id: "elite-savage",
      name: "Elite Savage",
      price: 450,
      type: "pt-only",
      tierLabel: "PT ONLY",
      desc: "Premium competitive conditioning",
      features: [
        "12 PT Sessions / Month",
        "Bespoke Competition Prep",
        "Bi-weekly Strength Metrics Review",
        "Priority Scheduler",
      ],
      popular: false,
    },
    // PT + GYM
    {
      id: "iron-hybrid",
      name: "Iron Hybrid",
      price: 210,
      type: "pt-gym",
      tierLabel: "PT + GYM",
      desc: "Gym access with professional training",
      features: ["All Gym Facilities Access", "4 PT Sessions / Month", "Custom Program Builder"],
      popular: false,
    },
    {
      id: "titan-force",
      name: "Titan Force",
      price: 340,
      type: "pt-gym",
      tierLabel: "PT + GYM",
      desc: "The ultimate hybrid transformation program",
      features: [
        "All Gym Facilities Access",
        "8 PT Sessions / Month",
        "Custom Meal Plans",
        "Premium Recovery Room Access",
      ],
      popular: true,
    },
    {
      id: "apex-elite",
      name: "Apex Elite",
      price: 520,
      type: "pt-gym",
      tierLabel: "PT + GYM",
      desc: "Fully managed fitness and recovery lifestyle",
      features: [
        "24/7 VIP Gym Access",
        "12 PT Sessions / Month",
        "Dedicated PT Coach",
        "Unlimited Sauna & Cold Plunge",
      ],
      popular: false,
    },
    // GYM ONLY
    {
      id: "standard-club",
      name: "Standard Club",
      price: 49,
      type: "gym-only",
      tierLabel: "GYM ONLY",
      desc: "General facility entry during hours",
      features: [
        "Gym Floor & Free Weights Access",
        "Locker Room & Shower Access",
        "Standard Gym Hours (6AM - 10PM)",
      ],
      popular: false,
    },
    {
      id: "iron-club-vip",
      name: "Iron Club VIP",
      price: 79,
      type: "gym-only",
      tierLabel: "GYM ONLY",
      desc: "Unrestricted 24/7 access with premium perks",
      features: [
        "24/7 Full Keycard Access",
        "Sauna & Steam Access",
        "1 Free Trainer Consult / Month",
        "1 Guest Pass Per Visit",
      ],
      popular: true,
    },
    {
      id: "compound-pass",
      name: "The Compound Pass",
      price: 119,
      type: "gym-only",
      tierLabel: "GYM ONLY",
      desc: "All recovery amenities and facilities included",
      features: [
        "24/7 Keycard Access",
        "Sauna & Cold Plunge Access",
        "Group Boxing & HIIT Classes",
        "Free Towel Service",
      ],
      popular: false,
    },
  ];

  // Payment Gateway Checkout Modal State
  const [selectedPackageForPayment, setSelectedPackageForPayment] = useState<any | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Gym Owner Add Trainer Modal State
  const [addTrainerModalOpen, setAddTrainerModalOpen] = useState(false);
  const [newTrainerName, setNewTrainerName] = useState("");
  const [newTrainerEmail, setNewTrainerEmail] = useState("");
  const [newTrainerSpecialty, setNewTrainerSpecialty] = useState("");
  const [newTrainerRate, setNewTrainerRate] = useState("85");

  // Revenue & Billing Transactions Data State
  const [transactions] = useState([
    { id: "tx-901", client: "Alex Vance", plan: "Alpha Iron (PT ONLY)", amount: 280, date: "2026-10-01", status: "COMPLETED" },
    { id: "tx-902", client: "Sarah Jenkins", plan: "Titan Force (PT + GYM)", amount: 340, date: "2026-09-29", status: "COMPLETED" },
    { id: "tx-903", client: "David Miller", plan: "Iron Club VIP (GYM ONLY)", amount: 79, date: "2026-09-28", status: "COMPLETED" },
    { id: "tx-904", client: "Elena Rostova", plan: "Apex Elite (PT + GYM)", amount: 520, date: "2026-09-25", status: "COMPLETED" },
    { id: "tx-905", client: "Marcus Vance", plan: "Elite Savage (PT ONLY)", amount: 450, date: "2026-09-22", status: "COMPLETED" },
  ]);

  const handleAddTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainerName.trim() || !newTrainerEmail.trim()) return;

    const newTrainer = {
      id: `t-${Date.now()}`,
      name: newTrainerName.trim(),
      email: newTrainerEmail.trim(),
      specialty: newTrainerSpecialty.trim() || "Personal Training & Strength",
      rate: Number(newTrainerRate) || 85,
      status: "APPROVED",
    };

    setRoster((prev) => [newTrainer, ...prev]);
    setNewTrainerName("");
    setNewTrainerEmail("");
    setNewTrainerSpecialty("");
    setNewTrainerRate("85");
    setAddTrainerModalOpen(false);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
    }, 1200);
  };

  const closePaymentModal = () => {
    setSelectedPackageForPayment(null);
    setPaymentSuccess(false);
    setIsProcessingPayment(false);
    setCardHolder("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
  };

  // Facility Registration Form State
  const [facilityName, setFacilityName] = useState("Iron Forge Athletics");
  const [facilityAddress, setFacilityAddress] = useState("742 Evergreen Terrace");
  const [facilityCity, setFacilityCity] = useState("Metropolis");
  const [facilityDescription, setFacilityDescription] = useState("State-of-the-art strength compound & recovery facility.");
  const [registerStatus, setRegisterStatus] = useState<string | null>(null);

  // Gym Owner Roster State
  const [roster, setRoster] = useState([
    { id: "t-1", name: "Marcus Vance", email: "marcus.vance@kinetix.fit", specialty: "Hypertrophy & Powerlifting", rate: 95, status: "APPROVED" },
    { id: "t-2", name: "Elena Rostova", email: "elena.rostova@kinetix.fit", specialty: "Functional Mobility & HIIT", rate: 85, status: "APPROVED" },
    { id: "t-3", name: "Jake Sterling", email: "jake.sterling@kinetix.fit", specialty: "Calisthenics & Strength", rate: 75, status: "PENDING" },
  ]);

  const toggleRosterStatus = (id: string) => {
    setRoster((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === "APPROVED" ? "PENDING" : "APPROVED" } : t))
    );
  };

  const openAuth = (r: "client" | "trainer" | "gymowner") => {
    setSelectedRole(r);
    setAuthModalOpen(true);
  };

  const handleRegisterFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterStatus("Submitting...");

    try {
      const res = await fetch("/api/gyms/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: facilityName,
          description: facilityDescription,
          address: facilityAddress,
          city: facilityCity,
          phone: "+1 (555) 019-2831",
          amenities: ["Sauna & Cold Plunge", "24/7 Keycard Entry"],
          verificationDoc: "iron_forge_permit_2026.pdf",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegisterStatus("Facility Registered & Persisted to Prisma DB ✅");
      } else {
        setRegisterStatus(`Error: ${data.error || "Validation failed"}`);
      }
    } catch (err) {
      setRegisterStatus("Failed to submit registration.");
    }
  };

  // =========================================================================
  // 1. PUBLIC LANDING PAGE (Shown when user is logged out)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-onyx-950 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-crimson selection:text-white">
        {/* Marketing Header */}
        <header className="w-full border-b border-onyx-800 bg-onyx-900/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-crimson/10 border border-crimson/30 text-crimson shadow-red-neon">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-widest text-white leading-tight">
                  KINETIX
                </span>
                <span className="text-[10px] font-bold text-crimson uppercase tracking-wider">
                  Multi-Role Fitness Ecosystem
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => openAuth("client")}
                className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuth("client")}
                className="py-2.5 px-5 bg-crimson text-white text-xs font-bold rounded-xl shadow-red-neon hover:opacity-95 transition flex items-center space-x-1.5"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col">
          <section className="relative py-20 px-6 max-w-7xl mx-auto text-center space-y-8 flex flex-col items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-crimson/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-crimson/10 border border-crimson/30 text-crimson text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Next-Generation SaaS Enterprise Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-5xl leading-none">
              Elite Fitness Engine Built For <br />
              <span className="gradient-text-crimson">Athletes, Trainers & Gym Owners</span>
            </h1>

            <p className="text-base md:text-lg text-slate-400 max-w-3xl leading-relaxed">
              Kinetix converges client workout tracking, personal trainer routine building, and gym owner facility management into one unified SaaS platform.
            </p>

            {/* Role Selector Portal (3 Interactive Cards) */}
            <div className="w-full pt-10">
              <div className="text-center mb-8">
                <h2 className="text-xs font-black uppercase tracking-widest text-crimson">
                  Choose Your Workspace Path
                </h2>
                <p className="text-2xl font-extrabold text-white mt-1">Select a Perspective to Begin</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
                {/* CARD 1: CLIENT / ATHLETE */}
                <div
                  onClick={() => openAuth("client")}
                  className="group p-8 rounded-3xl bg-onyx-900 border border-onyx-800 hover:border-crimson transition-all duration-300 shadow-xl cursor-pointer flex flex-col justify-between hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-crimson/10 border border-crimson/30 text-crimson w-fit group-hover:scale-110 transition">
                      <User className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-extrabold text-white">Client / Athlete</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Discover elite gyms, book tiered PT coaching packages, track active workout sessions with live set timers, and participate in community forums.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-300 pt-2">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-crimson" />
                        <span>Live Active Stopwatch & Set Matrix</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-crimson" />
                        <span>Tiered Package Membership Booking</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8 flex items-center justify-between text-xs font-bold text-crimson group-hover:translate-x-1 transition">
                    <span>Enter Client Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* CARD 2: PERSONAL TRAINER */}
                <div
                  onClick={() => openAuth("trainer")}
                  className="group p-8 rounded-3xl bg-onyx-900 border border-onyx-800 hover:border-purpleGlow transition-all duration-300 shadow-xl cursor-pointer flex flex-col justify-between hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-purpleGlow/10 border border-purpleGlow/30 text-purpleGlow w-fit group-hover:scale-110 transition">
                      <UserCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-extrabold text-white">Personal Trainer</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Architect custom exercise routines, reorder sets/reps matrices, manage client rosters, and send real-time coaching messages.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-300 pt-2">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-purpleGlow" />
                        <span>Routine Architect Builder</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-purpleGlow" />
                        <span>Optimistic Dual-Pane Client Chat</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8 flex items-center justify-between text-xs font-bold text-purpleGlow group-hover:translate-x-1 transition">
                    <span>Enter Trainer Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* CARD 3: GYM OWNER */}
                <div
                  onClick={() => openAuth("gymowner")}
                  className="group p-8 rounded-3xl bg-onyx-900 border border-onyx-800 hover:border-amber-400 transition-all duration-300 shadow-xl cursor-pointer flex flex-col justify-between hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 w-fit group-hover:scale-110 transition">
                      <Dumbbell className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-extrabold text-white">Gym Owner</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      List facility amenities, upload official verification documentation, track revenue analytics, and manage coaching staff rosters.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-300 pt-2">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>Facility Onboarding & File Verification</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>Trainer Roster Approval Table</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
                    <span>Enter Owner Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Feature Highlights */}
          <section className="py-16 bg-onyx-900/50 border-t border-onyx-800">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-2">
                <span className="text-2xl font-black text-crimson font-mono">30-Day Session</span>
                <h4 className="text-sm font-bold text-white">Persistent JWT Tokens</h4>
                <p className="text-xs text-slate-400">Stay logged in across browser restarts until explicit logout.</p>
              </div>
              <div className="space-y-2">
                <span className="text-2xl font-black text-purpleGlow font-mono">BCrypt Hash</span>
                <h4 className="text-sm font-bold text-white">Native Encrypted Auth</h4>
                <p className="text-xs text-slate-400">Secure password verification against PostgreSQL database.</p>
              </div>
              <div className="space-y-2">
                <span className="text-2xl font-black text-amber-400 font-mono">Server Actions</span>
                <h4 className="text-sm font-bold text-white">Optimistic Chat Sync</h4>
                <p className="text-xs text-slate-400">Instant message delivery feedback via React Server Actions.</p>
              </div>
              <div className="space-y-2">
                <span className="text-2xl font-black text-emerald-400 font-mono">Prisma ORM</span>
                <h4 className="text-sm font-bold text-white">PostgreSQL Persistence</h4>
                <p className="text-xs text-slate-400">Atomic transactions for workout set logs and routine building.</p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-onyx-900 py-6 text-center text-xs text-slate-500">
          &copy; 2026 Kinetix Fitness Platform • Next.js, NextAuth, Prisma & Tailwind CSS.
        </footer>

        {/* Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          selectedRole={selectedRole}
        />
      </div>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED WORKSPACE DASHBOARD (Shown when user is logged in)
  // =========================================================================
  return (
    <AppLayout
      currentRole={role}
      activeTab={activeTab}
      onRoleChange={(r) => {
        setRole(r);
        if (r === "client") setActiveTab("workout");
        else if (r === "pt") setActiveTab("architect");
        else if (r === "gymowner") setActiveTab("overview");
      }}
      onTabChange={(t) => setActiveTab(t)}
    >
      {/* CLIENT ROLE VIEWS */}
      {role === "client" && (
        <>
          {/* Active Workout Session */}
          {activeTab === "workout" && (
            <ActiveWorkoutSession
              routineTitle="Hypertrophy Push Alpha"
              targetGroup="Chest, Shoulders & Triceps"
              onComplete={async (duration, logs) => {
                try {
                  const res = await fetch("/api/workouts/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      routineId: "push-alpha-1",
                      durationSeconds: duration,
                      status: "COMPLETED",
                      setLogs: logs.map((l) => ({
                        exerciseId: l.exerciseId,
                        setNumber: l.setNumber,
                        repsCompleted: l.repsCompleted,
                        weightLbs: l.weightLbs,
                        isCompleted: l.isCompleted,
                      })),
                    }),
                  });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    showModal({
                      title: "Workout Session Persisted! ✅",
                      message: `Session ID: ${data.data.id}\nDuration: ${duration}s`,
                      type: "success",
                      confirmText: "View Summary",
                    });
                  }
                } catch (err) {
                  showToast({
                    title: "Workout Completed",
                    message: `Duration: ${duration}s`,
                    type: "info",
                  });
                }
              }}
            />
          )}

          {/* Gym & Trainer Discovery */}
          {activeTab === "discover" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Gym & Trainer Discovery</h1>
                  <p className="text-xs text-slate-400">Explore top-rated fitness facilities and certified personal trainers</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-semibold">Location:</span>
                  <span className="text-xs text-crimson font-bold bg-crimson/10 px-3 py-1.5 rounded-xl border border-crimson/30 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Metropolis (5 mile radius)</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Gym Card */}
                <div className="p-6 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-4 hover:border-crimson/50 transition shadow-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        VERIFIED COMPOUND
                      </span>
                      <h2 className="text-lg font-extrabold text-white mt-2">Iron Forge Athletics</h2>
                      <p className="text-xs text-slate-400 flex items-center mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 mr-1" />
                        742 Evergreen Terrace • Metropolis
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold bg-amber-400/10 px-2 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>4.9</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    State-of-the-art strength compound & recovery facility with 24/7 keycard entry and competition platforms.
                  </p>
                  <div className="pt-4 border-t border-onyx-800 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-mono">From <strong className="text-white">$49/mo</strong></span>
                    <button onClick={() => setActiveTab("booking")} className="py-2 px-4 bg-crimson text-white text-xs font-bold rounded-xl shadow-red-neon">
                      Book Membership
                    </button>
                  </div>
                </div>

                {/* Trainer Card */}
                <div className="p-6 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-4 hover:border-purpleGlow/50 transition shadow-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-purpleGlow/20 border border-purpleGlow/40 text-purpleGlow font-black flex items-center justify-center text-lg">
                      MV
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Marcus Vance</h2>
                      <p className="text-xs text-purpleGlow font-semibold">IFBB Pro & Hypertrophy Specialist</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Over 10 years experience coaching bodybuilders & strength athletes.
                  </p>
                  <div className="pt-4 border-t border-onyx-800 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-mono"><strong className="text-white">$95</strong> / hour</span>
                    <button onClick={() => setActiveTab("booking")} className="py-2 px-4 bg-purpleGlow text-white text-xs font-bold rounded-xl shadow-purple-neon">
                      Book PT Coaching
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Memberships & Booking */}
          {activeTab === "booking" && (
            <div className="space-y-8 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Elite Memberships & Packages</h1>
                  <p className="text-xs text-slate-400">Choose your intensity level and lock in your rate across 9 specialized package tiers</p>
                </div>

                {/* Tiered Package Segmented Controls */}
                <div className="inline-flex p-1 rounded-xl bg-onyx-900 border border-onyx-800 space-x-1">
                  <button
                    onClick={() => setTierFilter("all")}
                    className={`py-2 px-4 rounded-lg text-xs font-bold transition ${
                      tierFilter === "all"
                        ? "bg-crimson text-white shadow-red-neon"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All Tiers (9)
                  </button>
                  <button
                    onClick={() => setTierFilter("pt-only")}
                    className={`py-2 px-4 rounded-lg text-xs font-bold transition ${
                      tierFilter === "pt-only"
                        ? "bg-crimson text-white shadow-red-neon"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    PT Only (3)
                  </button>
                  <button
                    onClick={() => setTierFilter("pt-gym")}
                    className={`py-2 px-4 rounded-lg text-xs font-bold transition ${
                      tierFilter === "pt-gym"
                        ? "bg-crimson text-white shadow-red-neon"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    PT + Gym (3)
                  </button>
                  <button
                    onClick={() => setTierFilter("gym-only")}
                    className={`py-2 px-4 rounded-lg text-xs font-bold transition ${
                      tierFilter === "gym-only"
                        ? "bg-crimson text-white shadow-red-neon"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Gym Only (3)
                  </button>
                </div>
              </div>

              {/* Package Tier Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allPackages
                  .filter((pkg) => tierFilter === "all" || pkg.type === tierFilter)
                  .map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`relative p-6 rounded-3xl bg-onyx-900 border transition-all duration-300 flex flex-col justify-between shadow-xl overflow-hidden hover:-translate-y-1 ${
                        pkg.popular
                          ? "border-crimson shadow-red-neon/20"
                          : "border-onyx-800 hover:border-purpleGlow/50"
                      }`}
                    >
                      {/* Popular Ribbon Badge */}
                      {pkg.popular && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-crimson to-crimson-dark text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-red-neon">
                          MOST POPULAR
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Tier Category Pill */}
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider inline-block ${
                            pkg.type === "pt-only"
                              ? "bg-purpleGlow/10 text-purpleGlow border-purpleGlow/30"
                              : pkg.type === "pt-gym"
                              ? "bg-crimson/10 text-crimson border-crimson/30"
                              : "bg-amber-400/10 text-amber-400 border-amber-400/30"
                          }`}
                        >
                          {pkg.tierLabel}
                        </span>

                        <div>
                          <h3 className="text-xl font-extrabold text-white">{pkg.name}</h3>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pkg.desc}</p>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline space-x-1 py-2 border-y border-onyx-850">
                          <span className="text-3xl font-black text-white font-mono">${pkg.price}</span>
                          <span className="text-xs text-slate-400 font-medium">/ month</span>
                        </div>

                        {/* Features List */}
                        <ul className="space-y-2.5 pt-1">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center space-x-2 text-xs text-slate-300">
                              <CheckCircle2
                                className={`w-4 h-4 shrink-0 ${
                                  pkg.popular ? "text-crimson" : "text-purpleGlow"
                                }`}
                              />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <div className="pt-6 mt-4">
                        <button
                          onClick={() => {
                            setSelectedPackageForPayment(pkg);
                            setCardHolder(session?.user?.name || "Alex Vance");
                          }}
                          className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 ${
                            pkg.popular
                              ? "bg-crimson text-white shadow-red-neon hover:opacity-95"
                              : "bg-onyx-800 text-white hover:bg-onyx-700 border border-onyx-700"
                          }`}
                        >
                          <span>Purchase Package</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Custom Request Plan Box */}
              <div className="p-6 rounded-2xl bg-onyx-900 border border-dashed border-purpleGlow/40 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-purpleGlow/10 border border-purpleGlow/30 text-purpleGlow shrink-0">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Need a custom training program?</h3>
                    <p className="text-xs text-slate-400">Configure a bespoke coaching schedule & facility access directly with our consultants.</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    showToast({
                      title: "Consultant Contact Requested",
                      message: "A bespoke training consultant will reach out to you within 24 hours.",
                      type: "info",
                    })
                  }
                  className="py-2.5 px-5 bg-purpleGlow text-white text-xs font-bold rounded-xl shadow-purple-neon shrink-0"
                >
                  Contact Consultant
                </button>
              </div>
            </div>
          )}

          {/* Forum */}
          {activeTab === "forum" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Community Forum</h1>
                <p className="text-xs text-slate-400">Discuss training protocols, nutrition strategies, and recovery with athletes & coaches</p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "How do you structure progressive overload on Bench Press?", author: "Alex Vance", replies: 8 },
                  { title: "Pre-workout hydration and sodium intake protocol", author: "Elena Rostova", replies: 15 },
                ].map((thread, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-2">
                    <h3 className="text-base font-bold text-white">{thread.title}</h3>
                    <p className="text-xs text-slate-400">Posted by {thread.author} • {thread.replies} Replies</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* TRAINER ROLE VIEWS */}
      {role === "pt" && (
        <>
          {activeTab === "chat" && <ChatTerminal />}
          {activeTab === "architect" && (
            <RoutineArchitect
              onSave={async (routine) => {
                try {
                  const res = await fetch("/api/routines", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title: routine.title,
                      targetGroup: routine.targetGroup,
                      exercises: routine.exercises.map((ex, idx) => ({
                        name: ex.name,
                        targetSets: ex.targetSets,
                        targetReps: ex.targetReps,
                        orderIndex: idx,
                      })),
                    }),
                  });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    showModal({
                      title: "Routine Schema Persisted! ✅",
                      message: `Routine Title: ${routine.title}\nRoutine ID: ${data.data.id}`,
                      type: "success",
                      confirmText: "Done",
                    });
                  }
                } catch (err) {
                  console.error("Failed to save routine", err);
                }
              }}
            />
          )}
          {activeTab === "schedule" && (
            <div className="p-6 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-4">
              <h2 className="text-base font-bold text-white">Training Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { time: "09:00 AM", client: "Alex Vance", type: "Hypertrophy Push Alpha" },
                  { time: "11:30 AM", client: "Sarah Jenkins", type: "Mobility & Conditioning" },
                  { time: "03:00 PM", client: "David Miller", type: "Strength Review" },
                ].map((s, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-onyx-850 border border-onyx-800 space-y-2">
                    <span className="text-xs font-mono font-bold text-purpleGlow">{s.time}</span>
                    <h4 className="text-sm font-bold text-white">{s.client}</h4>
                    <p className="text-xs text-slate-400">{s.type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* GYM OWNER ROLE VIEWS */}
      {role === "gymowner" && (
        <>
          {activeTab === "overview" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <h1 className="text-2xl font-extrabold text-white">Facility Analytics Overview</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Members</span>
                  <div className="text-3xl font-black text-white font-mono">428</div>
                </div>
                <div className="p-6 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Revenue</span>
                  <div className="text-3xl font-black text-emerald-400 font-mono">$38,450</div>
                </div>
                <div className="p-6 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active PT Coaches</span>
                  <div className="text-3xl font-black text-amber-400 font-mono">{roster.length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupancy Rate</span>
                  <div className="text-3xl font-black text-purpleGlow font-mono">84%</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "register" && (
            <form onSubmit={handleRegisterFacility} className="p-8 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-6 max-w-7xl mx-auto">
              <h1 className="text-2xl font-extrabold text-white">Facility Profile & Verification</h1>
              {registerStatus && (
                <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                  {registerStatus}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Facility Name</label>
                  <input
                    type="text"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    className="w-full bg-onyx-950 border border-onyx-700 rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">City & Address</label>
                  <input
                    type="text"
                    value={facilityAddress}
                    onChange={(e) => setFacilityAddress(e.target.value)}
                    className="w-full bg-onyx-950 border border-onyx-700 rounded-xl p-3 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">Verification Document</label>
                <div className="p-8 rounded-2xl border-2 border-dashed border-onyx-700 bg-onyx-950 text-center">
                  <UploadCloud className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <span className="text-sm font-bold text-slate-200">iron_forge_permit_2026.pdf</span>
                </div>
              </div>

              <button type="submit" className="py-3 px-6 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                Submit Registration Payload
              </button>
            </form>
          )}

          {/* Trainer Roster Management Tab */}
          {activeTab === "trainers" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Trainer Roster Management</h1>
                  <p className="text-xs text-slate-400">Manage certified coaching staff, approve applications, and register new PTs</p>
                </div>
                <button
                  onClick={() => setAddTrainerModalOpen(true)}
                  className="py-2.5 px-4 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-amber-neon flex items-center space-x-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Trainer</span>
                </button>
              </div>

              {/* Roster Table */}
              <div className="p-6 rounded-2xl bg-onyx-900 border border-onyx-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-onyx-800 uppercase font-semibold">
                      <th className="py-3 px-4">Trainer Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Specialty</th>
                      <th className="py-3 px-4">Hourly Rate</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-onyx-800/50">
                    {roster.map((t) => (
                      <tr key={t.id} className="hover:bg-onyx-850 transition">
                        <td className="py-4 px-4 font-bold text-white">{t.name}</td>
                        <td className="py-4 px-4 text-slate-400 font-mono">{t.email}</td>
                        <td className="py-4 px-4 text-slate-300">{t.specialty}</td>
                        <td className="py-4 px-4 font-mono font-bold text-amber-400">${t.rate}/hr</td>
                        <td className="py-4 px-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              t.status === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => toggleRosterStatus(t.id)}
                            className="py-1.5 px-3 bg-onyx-800 text-xs font-bold rounded-lg hover:bg-onyx-700 text-slate-300"
                          >
                            Toggle Approval
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Revenue & Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-8 max-w-7xl mx-auto">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Revenue & Billing Console</h1>
                <p className="text-xs text-slate-400">Track monthly recurring revenue, active subscription tiers, and payout settlements</p>
              </div>

              {/* Billing Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Recurring Revenue</span>
                  <div className="text-3xl font-black text-emerald-400 font-mono">$38,450</div>
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+12.4% vs last month</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Subscriptions</span>
                  <div className="text-3xl font-black text-white font-mono">428</div>
                  <div className="text-[11px] text-slate-400">312 PT+Gym, 116 Gym Only</div>
                </div>

                <div className="p-6 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Next Payout</span>
                  <div className="text-3xl font-black text-amber-400 font-mono">$34,605</div>
                  <div className="text-[11px] text-slate-400">Processing on Oct 15, 2026</div>
                </div>

                <div className="p-6 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Merchant Payout Status</span>
                  <div className="text-sm font-bold text-emerald-400 flex items-center space-x-1 pt-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Chase Commercial (*8492)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Verified & Active</div>
                </div>
              </div>

              {/* Transactions History Table */}
              <div className="p-6 rounded-2xl bg-onyx-900 border border-onyx-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white">Recent Package Transactions</h3>
                  <button className="py-1.5 px-3 rounded-lg bg-onyx-800 border border-onyx-700 text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-onyx-800 uppercase font-semibold">
                        <th className="py-3 px-4">Tx ID</th>
                        <th className="py-3 px-4">Client Name</th>
                        <th className="py-3 px-4">Package Plan</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-onyx-800/50">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-onyx-850 transition">
                          <td className="py-4 px-4 font-mono text-slate-400">{tx.id}</td>
                          <td className="py-4 px-4 font-bold text-white">{tx.client}</td>
                          <td className="py-4 px-4 text-slate-300">{tx.plan}</td>
                          <td className="py-4 px-4 text-slate-400 font-mono">{tx.date}</td>
                          <td className="py-4 px-4 font-mono font-bold text-emerald-400">${tx.amount}.00</td>
                          <td className="py-4 px-4">
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() =>
                                showToast({
                                  title: "Receipt Downloaded",
                                  message: `Downloaded receipt PDF for transaction ${tx.id}`,
                                  type: "success",
                                })
                              }
                              className="py-1 px-2.5 bg-onyx-800 text-[11px] font-bold rounded-lg hover:bg-onyx-700 text-slate-300 inline-flex items-center space-x-1"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ADD TRAINER MODAL */}
      {addTrainerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-onyx-900 border border-onyx-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <button
              onClick={() => setAddTrainerModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-onyx-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Add Certified PT Trainer</h3>
                <p className="text-xs text-slate-400">Register a new coach to your facility roster</p>
              </div>
            </div>

            <form onSubmit={handleAddTrainer} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={newTrainerName}
                  onChange={(e) => setNewTrainerName(e.target.value)}
                  required
                  className="w-full bg-onyx-950 border border-onyx-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="trainer@kinetix.fit"
                  value={newTrainerEmail}
                  onChange={(e) => setNewTrainerEmail(e.target.value)}
                  required
                  className="w-full bg-onyx-950 border border-onyx-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Specialty</label>
                  <input
                    type="text"
                    placeholder="Hypertrophy"
                    value={newTrainerSpecialty}
                    onChange={(e) => setNewTrainerSpecialty(e.target.value)}
                    className="w-full bg-onyx-950 border border-onyx-700 rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    placeholder="85"
                    value={newTrainerRate}
                    onChange={(e) => setNewTrainerRate(e.target.value)}
                    className="w-full bg-onyx-950 border border-onyx-700 rounded-xl p-3 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-amber-neon hover:opacity-95"
              >
                Add Trainer to Roster
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT GATEWAY CHECKOUT MODAL */}
      {selectedPackageForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-onyx-900 border border-onyx-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <button
              onClick={closePaymentModal}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-onyx-800"
            >
              <X className="w-5 h-5" />
            </button>

            {!paymentSuccess ? (
              <>
                {/* Header */}
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-crimson/10 border border-crimson/30 text-crimson shadow-red-neon">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-lg font-black tracking-widest text-white block">
                      SECURE CHECKOUT
                    </span>
                    <span className="text-xs text-crimson font-bold uppercase tracking-wider">
                      256-Bit SSL Encrypted Payment Gateway
                    </span>
                  </div>
                </div>

                {/* Selected Package Breakdown */}
                <div className="p-4 rounded-2xl bg-onyx-950 border border-onyx-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-crimson/10 text-crimson border border-crimson/30 uppercase">
                        {selectedPackageForPayment.tierLabel}
                      </span>
                      <h4 className="text-base font-extrabold text-white mt-1">
                        {selectedPackageForPayment.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-white font-mono">
                        ${selectedPackageForPayment.price}
                      </div>
                      <span className="text-[10px] text-slate-400">per month</span>
                    </div>
                  </div>
                </div>

                {/* Order Total Breakdown */}
                <div className="space-y-1.5 text-xs border-y border-onyx-800 py-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Package Monthly Fee</span>
                    <span className="font-mono text-white">${selectedPackageForPayment.price}.00</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Platform Tax & Processing</span>
                    <span className="font-mono text-white">$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-white pt-1">
                    <span>Total Due Today</span>
                    <span className="font-mono text-crimson">${selectedPackageForPayment.price}.00</span>
                  </div>
                </div>

                {/* Credit Card Form */}
                <form onSubmit={handleProcessPayment} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Alex Vance"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      required
                      className="w-full bg-onyx-950 border border-onyx-700 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                      Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8892"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                        className="w-full bg-onyx-950 border border-onyx-700 rounded-xl pl-9 pr-4 py-3 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                        Expiration
                      </label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required
                        className="w-full bg-onyx-950 border border-onyx-700 rounded-xl px-4 py-3 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                        CVC Code
                      </label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        required
                        className="w-full bg-onyx-950 border border-onyx-700 rounded-xl px-4 py-3 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-crimson to-crimson-dark text-white font-bold text-xs shadow-red-neon hover:opacity-95 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>
                      {isProcessingPayment
                        ? "Processing Payment..."
                        : `Pay $${selectedPackageForPayment.price}.00 & Activate Subscription`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              /* Success Confirmation Screen */
              <div className="py-6 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
                <h3 className="text-2xl font-black text-white">Payment Successful!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Your subscription to <strong className="text-white">{selectedPackageForPayment.name}</strong> is now active. You have full access to your plan features.
                </p>
                <div className="p-4 rounded-2xl bg-onyx-950 border border-onyx-800 text-left space-y-1.5 text-xs font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span>Receipt Code:</span>
                    <span className="text-emerald-400">KNX-REC-{Math.floor(100000 + Math.random() * 900000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Charged:</span>
                    <span className="text-white">${selectedPackageForPayment.price}.00</span>
                  </div>
                </div>

                <button
                  onClick={closePaymentModal}
                  className="w-full py-3 bg-crimson text-white text-xs font-bold rounded-xl shadow-red-neon"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
