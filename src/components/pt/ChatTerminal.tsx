"use client";

import React, { useState, useOptimistic, useRef, useEffect, useTransition } from "react";
import { Send, MessageSquare, Check, CheckCheck, Clock, User, Sparkles, ShieldCheck } from "lucide-react";
import { sendChatMessage } from "@/app/actions/chat";

export interface ChatUser {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  statusText?: string;
  unreadCount?: number;
}

export interface ChatMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  sentAt: string;
  isOptimistic?: boolean;
}

export interface ChatTerminalProps {
  initialClients?: ChatUser[];
  initialMessages?: ChatMessageItem[];
  currentUserId?: string;
}

const DEFAULT_CLIENTS: ChatUser[] = [
  { id: "c-1", name: "Alex Vance", role: "CLIENT", statusText: "Active Tracker • Alpha Iron Tier", unreadCount: 1 },
  { id: "c-2", name: "Sarah Jenkins", role: "CLIENT", statusText: "Session Scheduled Today @ 4PM", unreadCount: 0 },
  { id: "c-3", name: "David Miller", role: "CLIENT", statusText: "Macro Review Pending", unreadCount: 2 },
];

const DEFAULT_MESSAGES: ChatMessageItem[] = [
  {
    id: "m-1",
    senderId: "c-1",
    senderName: "Alex Vance",
    senderRole: "CLIENT",
    content: "Hey Marcus! Finished the Hypertrophy Push Alpha session today. Bench press felt super strong.",
    sentAt: "10:30 AM",
  },
  {
    id: "m-2",
    senderId: "trainer-1",
    senderName: "Marcus Vance",
    senderRole: "TRAINER",
    content: "Awesome job Alex! Keep adding micro-plates each week. Make sure to hit 180g protein today.",
    sentAt: "10:32 AM",
  },
  {
    id: "m-3",
    senderId: "c-1",
    senderName: "Alex Vance",
    senderRole: "CLIENT",
    content: "Got it! Should I increase tricep dip volume on Friday?",
    sentAt: "10:35 AM",
  },
];

export const ChatTerminal: React.FC<ChatTerminalProps> = ({
  initialClients = DEFAULT_CLIENTS,
  initialMessages = DEFAULT_MESSAGES,
  currentUserId = "trainer-1",
}) => {
  const [clients] = useState<ChatUser[]>(initialClients);
  const [selectedClient, setSelectedClient] = useState<ChatUser>(initialClients[0]);
  const [inputContent, setInputContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages);

  // React 18 / 19 Optimistic State Updates
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state: ChatMessageItem[], newMessage: ChatMessageItem) => [...state, newMessage]
  );

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto Scroll to Bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [optimisticMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    const messageText = inputContent.trim();
    setInputContent("");

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const optimisticMsg: ChatMessageItem = {
      id: `opt-${Date.now()}`,
      senderId: currentUserId,
      senderName: "Marcus Vance",
      senderRole: "TRAINER",
      content: messageText,
      sentAt: formattedTime,
      isOptimistic: true,
    };

    // Instant Optimistic UI Dispatch
    startTransition(async () => {
      addOptimisticMessage(optimisticMsg);

      // Call Server Action
      const result = await sendChatMessage({
        senderId: currentUserId,
        receiverId: selectedClient.id,
        content: messageText,
      });

      if (result.success && result.data) {
        const persistedMsg: ChatMessageItem = {
          id: result.data.id,
          senderId: result.data.senderId,
          senderName: result.data.sender?.name || "Marcus Vance",
          senderRole: result.data.sender?.role || "TRAINER",
          content: result.data.content,
          sentAt: new Date(result.data.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isOptimistic: false,
        };
        setMessages((prev) => [...prev, persistedMsg]);
      } else {
        // Fallback state update
        setMessages((prev) => [...prev, { ...optimisticMsg, isOptimistic: false }]);
      }
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
      {/* Left 1/3 Client Roster Sidebar */}
      <div className="w-full md:w-80 bg-onyx-900 border border-onyx-800 rounded-2xl p-4 flex flex-col space-y-4 shrink-0 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-onyx-800">
          <div className="flex items-center space-x-2 text-purpleGlow">
            <MessageSquare className="w-5 h-5" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Client Terminal</h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purpleGlow/20 text-purpleGlow">
            {clients.length} Clients
          </span>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto">
          {clients.map((client) => {
            const isSelected = selectedClient.id === client.id;
            return (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  isSelected
                    ? "bg-purpleGlow/15 border-purpleGlow/40 text-white shadow-purple-neon"
                    : "bg-onyx-850 border-onyx-800 text-slate-300 hover:border-onyx-700"
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-full bg-purpleGlow/20 text-purpleGlow font-bold text-xs flex items-center justify-center shrink-0 border border-purpleGlow/30">
                    {client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{client.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{client.statusText}</p>
                  </div>
                </div>

                {client.unreadCount && client.unreadCount > 0 ? (
                  <span className="w-5 h-5 rounded-full bg-purpleGlow text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {client.unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right 2/3 Active Message Canvas */}
      <div className="flex-1 bg-onyx-900 border border-onyx-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl overflow-hidden">
        {/* Header Bar */}
        <div className="pb-4 border-b border-onyx-800 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purpleGlow/20 text-purpleGlow font-bold flex items-center justify-center border border-purpleGlow/30">
              {selectedClient.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{selectedClient.name}</h3>
              <p className="text-xs text-purpleGlow font-medium">{selectedClient.statusText}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-400">Live Server Actions Sync</span>
          </div>
        </div>

        {/* Message Feed */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto my-4 space-y-4 pr-2">
          {optimisticMessages.map((msg) => {
            const isMe = msg.senderRole === "TRAINER" || msg.senderId === currentUserId;

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-md p-4 rounded-2xl text-xs leading-relaxed transition ${
                  isMe
                    ? "ml-auto bg-purpleGlow/20 border border-purpleGlow/40 text-purple-100 shadow-purple-neon"
                    : "mr-auto bg-onyx-850 border border-onyx-800 text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>{msg.senderName}</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-mono">{msg.sentAt}</span>
                    {msg.isOptimistic ? (
                      <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                    ) : (
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>
                <p className="text-xs">{msg.content}</p>
              </div>
            );
          })}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="flex space-x-3 pt-3 border-t border-onyx-800 shrink-0">
          <input
            type="text"
            placeholder={`Message ${selectedClient.name}...`}
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            className="flex-1 bg-onyx-950 border border-onyx-700 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purpleGlow transition"
          />
          <button
            type="submit"
            disabled={!inputContent.trim() || isPending}
            className="py-3.5 px-6 bg-purpleGlow text-white text-xs font-bold rounded-xl shadow-purple-neon hover:opacity-90 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isPending ? "Syncing..." : "Send Payload"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
