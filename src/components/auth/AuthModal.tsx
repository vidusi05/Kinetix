"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { X, Zap, Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRole?: "client" | "trainer" | "gymowner";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  selectedRole = "client",
}) => {
  const [activeTab, setActiveTab] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (activeTab === "signup" && !name.trim()) {
      setErrorMessage("Full name is required to sign up.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setLoading(true);

    const callbackPath = "/";

    const res = await signIn("credentials", {
      action: activeTab,
      name,
      email,
      password,
      role: selectedRole,
      redirect: false,
      callbackUrl: callbackPath,
    });

    setLoading(false);

    if (res?.error) {
      setErrorMessage(res.error);
    } else if (res?.ok && res?.url) {
      window.location.href = res.url;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-onyx-900 border border-onyx-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-onyx-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-crimson/10 border border-crimson/30 text-crimson shadow-red-neon">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-black tracking-widest text-white block">
              KINETIX AUTH
            </span>
            <span className="text-xs text-crimson font-bold uppercase tracking-wider">
              {selectedRole === "client"
                ? "Client / Athlete"
                : selectedRole === "trainer"
                ? "Personal Trainer Portal"
                : "Gym Owner Console"}
            </span>
          </div>
        </div>

        {/* Tab Switcher: Sign Up vs Sign In */}
        <div className="grid grid-cols-2 gap-1 bg-onyx-950 p-1 rounded-xl border border-onyx-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab("signup");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "signup"
                ? "bg-crimson text-white shadow-red-neon"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("signin");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "signin"
                ? "bg-crimson text-white shadow-red-neon"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-crimson/20 border border-crimson/40 text-crimson text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Native Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "signup" && (
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Alex Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-onyx-950 border border-onyx-700 rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-crimson transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-onyx-950 border border-onyx-700 rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-crimson transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-onyx-950 border border-onyx-700 rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-crimson transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-crimson to-crimson-dark text-white font-bold text-xs shadow-red-neon hover:opacity-95 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>
              {loading
                ? "Verifying Account..."
                : activeTab === "signup"
                ? "Complete Registration"
                : "Sign In & Enter Dashboard"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Password Database • 30-Day Session</span>
        </div>
      </div>
    </div>
  );
};
