"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BookingFlow } from "@/components/patient/BookingFlow";
import { leadChatTranscriptService } from "@/lib/api/services/lead-chat-transcript-service";
import { patientLeadService } from "@/lib/api/services/patient-lead-service";
import { appointmentService } from "@/lib/api/services/appointment-service";
import { TESTING_DOCTOR_GUID } from "@/lib/api/model/testing-guid.model";

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

type ChatPhase = "chat" | "morphing" | "booking" | "done";

interface TriageChatProps {
  /** If provided, inject this as the first user message */
  initialMessage?: string;
  /** User identity (already collected by UnifiedBookingTriage gate) */
  userName?: string;
  userMobile?: string;
  /** Chat header guid for recording transcripts */
  chatHdrGuid?: string;
  /** Lead guid for tracking */
  leadGuid?: string;
  /** Custom back handler */
  onBack?: () => void;
  /** Called when booking is confirmed from within triage */
  onBookingConfirmed?: () => void;
}

export function TriageChat({
  initialMessage,
  userName = "",
  userMobile = "",
  chatHdrGuid,
  leadGuid,
  onBack,
  onBookingConfirmed,
}: TriageChatProps) {
  const router = useRouter();

  /* ── Chat state ─────────────────────────────────────────── */
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [scriptIdx, setScriptIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [awaitingPivotReply, setAwaitingPivotReply] = useState(false);
  const [phase, setPhase] = useState<ChatPhase>("chat");
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [convertedPatientGuid, setConvertedPatientGuid] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Scroll to bottom ───────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ── Record transcript to backend ───────────────────────── */
  const recordTranscript = async (content: string, sender: "patient" | "bot") => {
    if (!chatHdrGuid) return;
    try {
      await leadChatTranscriptService.create({
        chat_hdr_guid: chatHdrGuid,
        msg_content: content,
        sender,
      });
    } catch {
      // Non-blocking — don't disrupt chat UX
      console.error("Failed to record transcript");
    }
  };

  /* ── Boot triage on mount ──────────────────────────────── */
  useEffect(() => {
    setIsTyping(true);
    const first = triageScript[0];
    const timeout = setTimeout(() => {
      setIsTyping(false);
      if (initialMessage) {
        // Inject bot greeting + initial user message, then advance script
        setMessages([
          { id: first.id, from: "bot", text: first.text },
          { id: `u-init-${Date.now()}`, from: "user", text: initialMessage },
        ]);
        setScriptIdx(1);
        // Record both messages
        recordTranscript(first.text, "bot");
        recordTranscript(initialMessage, "patient");
        // Trigger the next bot reply after a short delay
        setTimeout(() => {
          const next = triageScript[1];
          if (next) {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              setMessages((prev) => [...prev, { id: next.id, from: "bot", text: next.text, isIntentPivot: next.isIntentPivot }]);
              setScriptIdx(2);
              recordTranscript(next.text, "bot");
            }, next.delay);
          }
        }, 400);
      } else {
        setMessages([{ id: first.id, from: "bot", text: first.text }]);
        setScriptIdx(1);
        recordTranscript(first.text, "bot");
      }
    }, first.delay);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Advance bot script after user sends a message ─────── */
  function advanceBot() {
    if (scriptIdx >= triageScript.length) return;
    const next = triageScript[scriptIdx];
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: next.id, from: "bot", text: next.text, isIntentPivot: next.isIntentPivot },
      ]);
      recordTranscript(next.text, "bot");
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
            recordTranscript(pivot.text, "bot");
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
    recordTranscript(trimmed, "patient");
    setTimeout(advanceBot, 400);
  }

  /* ── Intent pivot: YES ──────────────────────────────────── */
  async function handlePivotYes() {
    setAwaitingPivotReply(false);
    const text = "Yes, please show me her availability!";
    const userMsg: Message = { id: `u-yes-${Date.now()}`, from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    recordTranscript(text, "patient");

    // Show processing UI
    setPhase("morphing");
    setProcessingStep("Processing appointment…");

    try {
      // Convert lead to patient
      if (leadGuid) {
        setProcessingStep("Setting up your patient profile…");
        const conversionResult = await patientLeadService.convertLeadToPatient({
          doctor_guid: TESTING_DOCTOR_GUID,
          lead_guid: leadGuid,
        });
        // Store patient_guid for use in BookingFlow's appointment creation
        setConvertedPatientGuid(conversionResult.patient_guid);
      }

      setProcessingStep("Opening calendar…");
      // Brief delay so user sees the message transition
      await new Promise((r) => setTimeout(r, 800));
      setProcessingStep(null);
      setPhase("booking");
    } catch {
      // On failure, fall back to booking flow anyway
      setProcessingStep(null);
      setPhase("booking");
    }
  }

  /* ── Intent pivot: NO ───────────────────────────────────── */
  function handlePivotNo() {
    setAwaitingPivotReply(false);
    const userText = "Maybe later.";
    const botText = "No problem! You can always book through the main menu. Is there anything else I can help you with?";
    const userMsg: Message = { id: `u-no-${Date.now()}`, from: "user", text: userText };
    const botReply: Message = { id: `b-ok-${Date.now()}`, from: "bot", text: botText };
    setMessages((prev) => [...prev, userMsg, botReply]);
    recordTranscript(userText, "patient");
    recordTranscript(botText, "bot");
  }

  const handleBack = () => {
    onBack ? onBack() : router.push("/patient/landing");
  };

  /* ────────────────────────────────────────────────────────── */
  /* RENDER                                                      */
  /* ────────────────────────────────────────────────────────── */

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

            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-3xl border-4 border-white/30"
              style={{ animation: "pulse-ring 1s ease-out infinite" }}
            />

            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/20">
              <CalendarCheck size={32} className="text-white" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <p className="text-white font-bold text-xl mb-1">
              {processingStep || "Opening calendar…"}
            </p>
            <p className="text-white/70 text-sm">Dr. Priya Nair</p>
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
          prefillName={userName}
          prefillMobile={userMobile}
          onConfirmed={async () => {
            // Create appointment record after slot selection and confirmation
            try {
              // Use tomorrow 9:00 AM as the scheduled time (matching triage recommendation)
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(9, 0, 0, 0);
              const endTime = new Date(tomorrow);
              endTime.setMinutes(endTime.getMinutes() + 30);

              await appointmentService.create({
                doctor_guid: TESTING_DOCTOR_GUID,
                patient_guid: convertedPatientGuid ?? undefined,
                scheduled_start: tomorrow.toISOString(),
                scheduled_end: endTime.toISOString(),
                appointment_status: "scheduled",
                status: "active",
              });
            } catch {
              console.error("Failed to create appointment record");
            }

            if (onBookingConfirmed) onBookingConfirmed();
            else setPhase("done");
          }}
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
          <h1 className="text-2xl font-bold text-foreground mb-2">All set, {userName}!</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Your appointment is confirmed. We&apos;ll send updates to {userMobile}.
          </p>
          <Button
            onClick={handleBack}
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
    <div className="flex flex-col mx-auto w-full md:max-w-3xl md:border md:border-border md:rounded-2xl md:my-6 md:shadow-sm bg-background">
      {/* Chat header */}
      <div className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-4 md:rounded-t-2xl">
        <button
          onClick={handleBack}
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
        {userName && (
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <User size={10} aria-hidden="true" />
            {userName}
          </div>
        )}
      </div>

      {/* Messages — grows dynamically, no nested scroll */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="px-4 py-4 flex flex-col gap-3"
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
                    ? "rounded-tl-sm bg-[var(--color-brand-blue-light)] text-foreground"
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
            <div className="rounded-2xl rounded-tl-sm bg-[var(--color-brand-blue-light)] px-4 py-3">
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
      <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 md:rounded-b-2xl">
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
