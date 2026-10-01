"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Zap,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  id?: string;
  title: string;
  message?: string;
  type?: NotificationType;
  durationSeconds?: number;
}

export interface ModalNotificationOptions {
  title: string;
  message: string;
  type?: NotificationType;
  confirmText?: string;
  onConfirm?: () => void;
}

interface NotificationContextType {
  showToast: (options: ToastOptions) => void;
  showModal: (options: ModalNotificationOptions) => void;
  closeModal: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);
  const [activeModal, setActiveModal] = useState<ModalNotificationOptions | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, type = "success", durationSeconds = 4 }: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastOptions = { id, title, message, type };

      setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

      setTimeout(() => {
        removeToast(id);
      }, durationSeconds * 1000);
    },
    [removeToast]
  );

  const showModal = useCallback((options: ModalNotificationOptions) => {
    setActiveModal(options);
  }, []);

  const closeModal = useCallback(() => {
    if (activeModal?.onConfirm) {
      activeModal.onConfirm();
    }
    setActiveModal(null);
  }, [activeModal]);

  return (
    <NotificationContext.Provider value={{ showToast, showModal, closeModal }}>
      {children}

      {/* FLOATING TOAST CONTAINER (TOP-RIGHT) */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col space-y-3 pointer-events-none max-w-sm w-full px-4 md:px-0">
        {toasts.map((toast) => {
          const type = toast.type || "success";
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto relative p-4 rounded-2xl bg-onyx-900/95 border backdrop-blur-md shadow-2xl flex items-start space-x-3 transition-all duration-300 animate-slideInRight ${
                type === "success"
                  ? "border-emerald-500/40 text-emerald-400"
                  : type === "error"
                  ? "border-crimson/50 text-crimson"
                  : type === "info"
                  ? "border-purpleGlow/50 text-purpleGlow"
                  : "border-amber-400/50 text-amber-400"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {type === "error" && <AlertCircle className="w-5 h-5 text-crimson" />}
                {type === "info" && <Zap className="w-5 h-5 text-purpleGlow" />}
                {type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              </div>

              <div className="flex-1 overflow-hidden pr-2">
                <h4 className="text-xs font-extrabold text-white leading-tight">{toast.title}</h4>
                {toast.message && (
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed whitespace-pre-line">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => toast.id && removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-onyx-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* STATUS MODAL DIALOG (REPLACING NATIVE ALERTS & CONFIRMS) */}
      {activeModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-onyx-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-onyx-900 border border-onyx-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
            <button
              onClick={closeModal}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-onyx-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="flex items-center space-x-3">
              <div
                className={`p-3 rounded-2xl border shadow-lg ${
                  activeModal.type === "error"
                    ? "bg-crimson/10 border-crimson/30 text-crimson shadow-red-neon"
                    : activeModal.type === "warning"
                    ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
                    : activeModal.type === "info"
                    ? "bg-purpleGlow/10 border-purpleGlow/30 text-purpleGlow shadow-purple-neon"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                }`}
              >
                {activeModal.type === "error" && <AlertCircle className="w-6 h-6 animate-pulse" />}
                {activeModal.type === "warning" && <AlertTriangle className="w-6 h-6" />}
                {activeModal.type === "info" && <Sparkles className="w-6 h-6 animate-spin" />}
                {(!activeModal.type || activeModal.type === "success") && (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>
              <div>
                <span className="text-lg font-black tracking-wider text-white block">
                  {activeModal.title}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Kinetix System Notification
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div className="p-4 rounded-2xl bg-onyx-950 border border-onyx-800 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
              {activeModal.message}
            </div>

            {/* Confirmation CTA Button */}
            <button
              onClick={closeModal}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center space-x-2 ${
                activeModal.type === "error"
                  ? "bg-crimson text-white shadow-red-neon hover:opacity-95"
                  : activeModal.type === "warning"
                  ? "bg-amber-500 text-slate-950 font-black shadow-amber-neon"
                  : activeModal.type === "info"
                  ? "bg-purpleGlow text-white shadow-purple-neon hover:opacity-95"
                  : "bg-gradient-to-r from-crimson to-crimson-dark text-white shadow-red-neon hover:opacity-95"
              }`}
            >
              <span>{activeModal.confirmText || "Acknowledge"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
