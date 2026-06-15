"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Phone,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BookingFlow } from "@/components/patient/BookingFlow";

/* ─── Triage script ─────────────────────────────────────────── */
const triageScript: Array<{
  id: string;
  from: "bot";
  text: string;
  delay: number;
  isIntentPivot?: boolean;
}> = [
  {
    id: "t0",
    from: "bot",
    text: "Hello! I'm your medi-assist health assistant. I'm here to help you understand your symptoms and find the right doctor. What's been bothering you today?",
    delay: 600,
  },
  {
    id: "t1",
    from: "bot",
    text: "I see. How long have you been experiencing these symptoms?",
    delay: 1200,
  },
  {
    id: "t2",
    from: "bot",
    text: "On a scale of 1–10, how would you rate the severity right now?",
    delay: 1200,
  },
  {
    id: "t3",
    from: "bot",
    text: "Have you experienced this before, or is this the first time?",
    delay: 1200,
  },
  {
    id: "t4",
    from: "bot",
    text: "Based on what you've told me, this sounds like it could be related to **General Practice** concerns. I'd recommend you see **Dr. Priya Nair** — she has excellent experience in this area and has availability as early as tomorrow.",
    delay: 1600,
  },
  {
    id: "t5",
    from: "bot",
    text: "Would you like me to pull up Dr. Priya Nair's calendar so you can lock in a slot right now? She's booked up fast this week.",
    delay: 1400,
    isIntentPivot: true,
  },
];

interface Message {
  id: string;
  from: "bot" | "user";
  text: string;
  isIntentPivot?: boolean;
}

type ChatPhase = "gate" | "chat" | "morphing" | "booking" | "done";

export function TriageChat() {
  const router = useRouter();

  /* ── Gate state ─────────────────────────────────────────── */
  const [gateName, setGateName] = useState("");
  const [gateMobile, setGateMobile] = useState("");
  const [phase, setPhase] = useState<ChatPhase>("gate");

  /* ── Chat state ─────────────────────────────────────────── */
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [scriptIdx, setScriptIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [awaitingPivotReply, setAwaitingPivotReply] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Scroll to bottom ───────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ── Boot triage when gate dismissed ───────────────────── */
  useEffect(() => {
    if (phase !== "chat") return;
    // Fire first bot message
    setIsTyping(true);
    const first = triageScript[0];
    const timeout = setTimeout(() => {
      setIsTyping(false);
      setMessages([{ id: first.id, from: "bot", text: first.text }]);
      setScriptIdx(1);
    }, first.delay);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── Advance bot script after user sends a message ─────── */
  function advanceBot(autoChain = false) {
    if (scriptIdx >= triageScript.length) return;
    const next = triageScript[scriptIdx];
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: next.id, from: "bot", text: next.text, isIntentPivot: next.isIntentPivot },
      ]);
      const nextIdx = scriptIdx + 1;
      setScriptIdx(nextIdx);
      if (next.isIntentPivot) {
        setAwaitingPivotReply(true);
      } else if (nextIdx < triageScript.length && triageScript[nextIdx].isIntentPivot) {
        // Auto-chain into the pivot message without waiting for user input
        setTimeout(() => {
          const pivot = triageScript[nextIdx];
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setMessages((prev) => [
              ...prev,
              { id: pivot.id, from: "bot", text: pivot.text, isIntentPivot: pivot.isIntentPivot },
            ]);
            setScriptIdx(nextIdx + 1);
            setAwaitingPivotReply(true);
          }, pivot.delay);
        }, 600);
      }
    }, next.delay);
  }

  function handleSend() {
    const trimmed = inputValue.trim();
    if (!trimmed || awaitingPivotReply) return;
    const userMsg: Message = { id: `u-${Date.now()}`, from: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setTimeout(advanceBot, 400);
  }

  /* ── Intent pivot: YES ──────────────────────────────────── */
  function handlePivotYes() {
    setAwaitingPivotReply(false);
    const userMsg: Message = { id: `u-yes-${Date.now()}`, from: "user", text: "Yes, please show me her availability!" };
    setMessages((prev) => [...prev, userMsg]);
    // Trigger morphing animation
    setTimeout(() => setPhase("morphing"), 500);
    setTimeout(() => setPhase("booking"), 1600);
  }

  /* ── Intent pivot: NO ───────────────────────────────────── */
  function handlePivotNo() {
    setAwaitingPivotReply(false);
    const userMsg: Message = { id: `u-no-${Date.now()}`, from: "user", text: "Maybe later." };
    const botReply: Message = {
      id: `b-ok-${Date.now()}`,
      from: "bot",
      text: "No problem! You can always book through the main menu. Is there anything else I can help you with?",
    };
    setMessages((prev) => [...prev, userMsg, botReply]);
  }

  /* ── Gate submit ────────────────────────────────────────── */
  function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gateName.trim() || !gateMobile.trim()) return;
    setPhase("chat");
  }

  /* ────────────────────────────────────────────────────────── */
  /* RENDER                                                      */
  /* ────────────────────────────────────────────────────────── */

  /* ── Disconnection gate — un-dismissible modal ──────────── */
  if (phase === "gate") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-5 bg-background">
        {/* Blurred backdrop hint of the chat behind */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
          <div className="flex flex-col gap-3 p-5 pt-16">
            {[80, 60, 72, 55, 90].map((w, i) => (
              <div
                key={i}
                className={cn(
                  "h-8 rounded-2xl bg-muted",
                  i % 2 === 0 ? "self-start" : "self-end"
                )}
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>

        {/* Modal card */}
        <div className="relative z-10 w-full max-w-sm rounded-3xl bg-background border border-border shadow-2xl px-6 py-7">
          {/* Icon */}
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--color-brand-blue-light)]">
            <Sparkles size={26} className="text-[var(--color-brand-blue)]" strokeWidth={1.8} aria-hidden="true" />
          </div>

          <h2 className="text-xl font-bold text-foreground text-center mb-1">Save your progress</h2>
          <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
            Enter your details so we can restore this conversation if you get disconnected.
          </p>

          <form onSubmit={handleGateSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="gate-name" className="text-sm font-medium mb-1.5 block">
                Your Name
              </Label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="gate-name"
                  placeholder="Full name"
                  value={gateName}
                  onChange={(e) => setGateName(e.target.value)}
                  required
                  className="pl-9 h-11 rounded-xl"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <Label htmlFor="gate-mobile" className="text-sm font-medium mb-1.5 block">
                Mobile Number
              </Label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="gate-mobile"
                  type="tel"
                  placeholder="+1 555 000 0000"
                  value={gateMobile}
                  onChange={(e) => setGateMobile(e.target.value)}
                  required
                  className="pl-9 h-11 rounded-xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={!gateName.trim() || !gateMobile.trim()}
              className="h-12 w-full rounded-xl bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-dark)] text-white font-semibold mt-1 disabled:opacity-40"
            >
              Start Chat
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              We&apos;ll only use this to restore your session.
            </p>
          </form>
        </div>
      </div>
    );
  }

  /* ── Morphing transition ─────────────────────────────────── */
  if (phase === "morphing") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5">
        <div className="w-full max-w-sm">
          <div
            className="relative overflow-hidden rounded-3xl bg-[var(--color-brand-teal)] px-6 py-8 text-center"
            style={{ animation: "morphExpand 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
          >
            <style>{`
              @keyframes morphExpand {
                0%   { transform: scale(0.9); opacity: 0.6; border-radius: 1.5rem; }
                60%  { transform: scale(1.03); opacity: 1; border-radius: 2rem; }
                100% { transform: scale(1); opacity: 1; border-radius: 1.5rem; }
              }
              @keyframes pulse-ring {
                0%   { transform: scale(0.95); opacity: 0.7; }
                70%  { transform: scale(1.15); opacity: 0; }
                100% { transform: scale(0.95); opacity: 0; }
              }
            `}</style>

            {/* Pulse ring */}
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-3xl border-4 border-white/30"
              style={{ animation: "pulse-ring 1s ease-out infinite" }}
            />

            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/20">
              <CalendarCheck size={32} className="text-white" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <p className="text-white font-bold text-xl mb-1">Opening calendar…</p>
            <p className="text-white/70 text-sm">Dr. Priya Nair · Finding available slots</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Booking view (post-morph) ───────────────────────────── */
  if (phase === "booking") {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
        {/* Banner: context from chat */}
        <div className="px-4 pt-4">
          <div className="mx-auto max-w-md">
            <div className="flex items-center gap-3 rounded-xl bg-[var(--color-brand-teal-light)] border border-[var(--color-brand-teal)]/20 px-4 py-3 mb-1">
              <div className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src="/doctors/dr-priya-nair.png"
                  alt="Dr. Priya Nair"
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--color-brand-teal)] flex items-center gap-1.5">
                  <Sparkles size={11} aria-hidden="true" />
                  AI recommended
                </p>
                <p className="text-sm font-semibold text-foreground truncate">Dr. Priya Nair</p>
              </div>
            </div>
          </div>
        </div>
        <BookingFlow
          preselectedDoctorId="priya-nair"
          onConfirmed={() => setPhase("done")}
        />
      </div>
    );
  }

  /* ── Done (post-booking from triage) ────────────────────── */
  if (phase === "done") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 text-center">
        <div className="mx-auto max-w-sm">
          <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-[var(--color-brand-teal-light)]">
            <CheckCircle2 size={52} className="text-[var(--color-brand-teal)]" strokeWidth={1.6} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">All set, {gateName}!</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Your appointment is confirmed. We&apos;ll send updates to {gateMobile}.
          </p>
          <Button
            onClick={() => router.push("/patient/landing")}
            className="w-full h-12 rounded-xl bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-dark)] text-white font-semibold"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  /* ── Chat view ───────────────────────────────────────────── */
  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>
      {/* Chat header */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <button
          onClick={() => router.push("/patient/landing")}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-brand-blue)] shrink-0">
            <Bot size={16} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">Health Assistant</p>
            <p className="text-[10px] text-[var(--color-brand-teal)] font-medium mt-0.5">AI-powered triage</p>
          </div>
        </div>
        {/* User identity pill */}
        <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <User size={10} aria-hidden="true" />
          {gateName}
        </div>
      </div>

      {/* Messages */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-2.5 max-w-[88%]",
              msg.from === "user" ? "self-end flex-row-reverse" : "self-start"
            )}
          >
            {/* Avatar */}
            {msg.from === "bot" && (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-blue)] mt-0.5">
                <Bot size={13} className="text-white" aria-hidden="true" />
              </div>
            )}
            {msg.from === "user" && (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-teal)] mt-0.5">
                <User size={13} className="text-white" aria-hidden="true" />
              </div>
            )}

            {/* Bubble */}
            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.from === "bot"
                    ? "rounded-tl-sm bg-muted text-foreground"
                    : "rounded-tr-sm bg-[var(--color-brand-teal)] text-white"
                )}
              >
                {/* Render bold (**text**) inline */}
                {msg.text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={i}>{part.slice(2, -2)}</strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </div>

              {/* Intent pivot buttons */}
              {msg.isIntentPivot && awaitingPivotReply && (
                <div className="flex gap-2 mt-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <button
                    onClick={handlePivotYes}
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-teal)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-teal-dark)] transition-colors active:scale-95"
                  >
                    <CalendarCheck size={12} aria-hidden="true" />
                    Yes, book now
                  </button>
                  <button
                    onClick={handlePivotNo}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors active:scale-95"
                  >
                    <X size={12} aria-hidden="true" />
                    Maybe later
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2.5 self-start max-w-[88%] animate-in fade-in duration-200">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-blue)] mt-0.5">
              <Bot size={13} className="text-white" aria-hidden="true" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
              <span className="flex gap-1" aria-label="Assistant is typing">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-muted-foreground/60"
                    style={{
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
                <style>{`
                  @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30%           { transform: translateY(-5px); }
                  }
                `}</style>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 pb-safe">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={awaitingPivotReply ? "Use the buttons above to respond…" : "Describe your symptoms…"}
            disabled={awaitingPivotReply}
            className="flex-1 h-11 rounded-xl bg-muted border-0 focus-visible:ring-1 focus-visible:ring-[var(--color-brand-teal)] text-sm placeholder:text-muted-foreground/70"
            aria-label="Message input"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || awaitingPivotReply}
            className="size-11 shrink-0 rounded-xl bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-dark)] text-white disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={16} aria-hidden="true" />
          </Button>
        </form>
      </div>
    </div>
  );
}
