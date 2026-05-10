import React, { useEffect, useRef, useState } from "react";
import { api } from "../utils/api";
import { useTheme } from "./ThemeContext";
import { Bot, Send, X, Minimize2, MessageCircle, RotateCcw } from "lucide-react";

const WELCOME = {
  role: "assistant",
  content: "Hi! I'm the SalonHub Assistant 👋\n\nI can help you with booking appointments, finding salons, the job portal, and anything else about SalonHub. What can I help you with?",
};

const SUGGESTIONS = [
  "How do I book an appointment?",
  "How do I find salons near me?",
  "How does the job portal work?",
  "How do I register my salon?",
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mt-0.5">
          <Bot className="h-3.5 w-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-slate-900 text-white rounded-tr-sm dark:bg-slate-700"
            : "bg-slate-100 text-slate-800 rounded-tl-sm dark:bg-slate-700 dark:text-slate-100"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
        <Bot className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export default function ChatBot() {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setUnread(0);
    }
  }, [open]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    const userMsg = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Send only the conversation (exclude the welcome message from API call)
      const apiMessages = newMessages.filter((m) => m !== WELCOME);
      const res = await api.post("/chat", { messages: apiMessages });
      const reply = { role: "assistant", content: res.data.reply };
      setMessages((p) => [...p, reply]);
      if (!open) setUnread((p) => p + 1);
    } catch (err) {
      const errText = err?.response?.data?.message || "Something went wrong. Please try again.";
      setMessages((p) => [...p, { role: "assistant", content: errText }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reset = () => {
    setMessages([WELCOME]);
    setInput("");
  };

  return (
    <>
      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-20 right-4 z-50 w-[340px] sm:w-[380px] flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
          style={{
            height: "520px",
            background: isDark ? "#1e293b" : "#ffffff",
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">SalonHub Assistant</p>
                <p className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={reset}
                title="New conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — show only when just the welcome message is present */}
          {messages.length === 1 && !loading && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full border transition"
                  style={{
                    background: isDark ? "#0f172a" : "#f8fafc",
                    borderColor: isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0",
                    color: isDark ? "#94a3b8" : "#475569",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            className="px-3 py-3 border-t shrink-0 flex items-end gap-2"
            style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0" }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none border transition"
              style={{
                background: isDark ? "#0f172a" : "#f8fafc",
                borderColor: isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0",
                color: isDark ? "#f1f5f9" : "#1e293b",
                minHeight: "38px",
                maxHeight: "96px",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="shrink-0 h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white transition hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* FAB toggle button */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-slate-900 shadow-lg flex items-center justify-center text-white transition hover:bg-slate-700 hover:scale-105 active:scale-95"
      >
        {open ? (
          <Minimize2 className="h-5 w-5" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
