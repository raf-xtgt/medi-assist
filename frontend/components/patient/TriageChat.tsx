"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Send,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BookingFlow } from "@/components/patient/BookingFlow";
import { leadChatTranscriptService } from "@/lib/api/services/lead-chat-transcript-service";
import { patientLeadService } from "@/lib/api/services/patient-lead-service";
import { appointmentService } from "@/lib/api/services/appointment-service";
import { triageService } from "@/lib/api/services/triage-service";
import { doctorService } from "@/lib/api/services/doctor-service";
import type { DoctorResponse } from "@/lib/api/model/doctor.model";
import type { TriageTranscriptItem } from "@/lib/api/model/triage.model";
import { TESTING_DOCTOR_GUID } from "@/lib/api/model/testing-guid.model";

/* ─── Initial bot greeting (only message kept from the old script) ──────── */
const BOT_GREETING =
  "Hello! I'm your medi-assist health assistant. I'm here to help you understand your symptoms and find the right doctor. What's been bothering you today?";

interface Message {
  id: string;
  from: "bot" | "user";
  text: string;
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
  const [isTyping, setIsTyping] = useState(false);
  const [showBookingButtons, setShowBookingButtons] = useState(false);
  const [phase, setPhase] = useState<ChatPhase>("chat");
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [convertedPatientGuid, setConvertedPatientGuid] = useState<string | null>(null);
  const [recommendedDoctor, setRecommendedDoctor] = useState<DoctorResponse | null>(null);
  const [recommendedDoctorName, setRecommendedDoctorName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Message Bursting — debounce multiple rapid messages ── */
  const messageBufferRef = useRef<string[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_DELAY_MS = 15000;

  /* ── Scroll to bottom ───────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ── Cleanup debounce timer on unmount ──────────────────── */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /* ── Record a single transcript (used only for the bot greeting) ── */
  const recordGreeting = async (content: string) => {
    if (!chatHdrGuid) return;
    try {
      await leadChatTranscriptService.create({
        chat_hdr_guid: chatHdrGuid,
        msg_content: content,
        sender: "bot",
      });
    } catch {
      console.error("Failed to record greeting transcript");
    }
  };

  /* ── Boot triage on mount — show greeting only ─────────── */
  useEffect(() => {
    setIsTyping(true);
    const timeout = setTimeout(() => {
      setIsTyping(false);

      if (initialMessage) {
        // Show greeting + inject search string as first user message
        setMessages([
          { id: "bot-greeting", from: "bot", text: BOT_GREETING },
          { id: `u-init-${Date.now()}`, from: "user", text: initialMessage },
        ]);
        recordGreeting(BOT_GREETING);

        // Immediately buffer the initial message and trigger the debounce → API call
        messageBufferRef.current.push(initialMessage);
        setIsTyping(true);
        debounceTimerRef.current = setTimeout(() => {
          flushBufferToBackend();
        }, DEBOUNCE_DELAY_MS);
      } else {
        // Just show the greeting
        setMessages([{ id: "bot-greeting", from: "bot", text: BOT_GREETING }]);
        recordGreeting(BOT_GREETING);
      }
    }, 600);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Flush buffered messages to the triggerChat endpoint ── */
  async function flushBufferToBackend() {
    const bufferedMessages = [...messageBufferRef.current];
    messageBufferRef.current = [];

    if (bufferedMessages.length === 0) {
      setIsTyping(false);
      return;
    }

    const combinedMsg = bufferedMessages.join("\n");

    // Build transcript items for the payload
    const transcripts: TriageTranscriptItem[] = bufferedMessages.map((msg) => ({
      chat_hdr_guid: chatHdrGuid,
      msg_content: msg,
      sender: "patient",
    }));

    try {
      const result = await triageService.triggerChat({
        chat_hdr_guid: chatHdrGuid,
        transcripts,
        combined_user_msg: combinedMsg,
      });

      setIsTyping(false);

      // Render the AI response
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        from: "bot",
        text: result.response_text,
      };
      setMessages((prev) => [...prev, botMsg]);

      // If the agent recommends a doctor, show booking buttons
      if (result.booking_flag) {
        if (result.recommended_doctor_name) {
          setRecommendedDoctorName(result.recommended_doctor_name);
        }
        setShowBookingButtons(true);
      }
    } catch {
      setIsTyping(false);
      // Show a generic fallback message on failure
      const fallbackMsg: Message = {
        id: `bot-err-${Date.now()}`,
        from: "bot",
        text: "I'm sorry, I had trouble processing that. Could you rephrase your symptoms?",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }
  }

  /* ── Handle user message send ───────────────────────────── */
  function handleSend() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // 1. Instantly render in UI
    const userMsg: Message = { id: `u-${Date.now()}`, from: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // 2. Buffer the message (NO individual recordTranscript — triggerChat handles persistence)
    messageBufferRef.current.push(trimmed);

    // 3. Show typing indicator
    setIsTyping(true);

    // 4. Reset debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      flushBufferToBackend();
    }, DEBOUNCE_DELAY_MS);
  }

  /* ── Intent pivot: YES (triggered programmatically or by future LLM) ── */
  async function handlePivotYes() {
    const text = "Yes, please show me their availability!";
    const userMsg: Message = { id: `u-yes-${Date.now()}`, from: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    // Show processing UI
    setPhase("morphing");
    setProcessingStep("Processing appointment…");

    try {
      // Resolve the recommended doctor by name
      if (recommendedDoctorName) {
        setProcessingStep("Finding your doctor…");
        const searchResult = await doctorService.search({ search_string: recommendedDoctorName });
        if (searchResult.found_doctor && searchResult.doctor_results.length > 0) {
          const doc = searchResult.doctor_results[0];
          // Fetch full doctor record
          const fullDoctor = await doctorService.getByGuid(doc.guid);
          setRecommendedDoctor(fullDoctor);
        }
      }

      if (leadGuid) {
        setProcessingStep("Setting up your patient profile…");
        const doctorGuid = recommendedDoctor?.guid ?? TESTING_DOCTOR_GUID;
        const conversionResult = await patientLeadService.convertLeadToPatient({
          doctor_guid: doctorGuid,
          lead_guid: leadGuid,
        });
        setConvertedPatientGuid(conversionResult.patient_guid);
      }

      setProcessingStep("Opening calendar…");
      await new Promise((r) => setTimeout(r, 800));
      setProcessingStep(null);
      setPhase("booking");
    } catch {
      setProcessingStep(null);
      setPhase("booking");
    }
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
            <p className="text-white/70 text-sm">{recommendedDoctor?.name ?? recommendedDoctorName ?? "Your Doctor"}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Booking view (post-morph) ───────────────────────────── */
  if (phase === "booking") {
    const doctorDisplayName = recommendedDoctor?.name ?? recommendedDoctorName ?? "Recommended Doctor";
    const doctorGuid = recommendedDoctor?.guid ?? TESTING_DOCTOR_GUID;
    const doctorImageUrl = recommendedDoctor?.image_url;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
        <BookingFlow
          preselectedDoctorId={doctorGuid}
          preselectedDoctorInfo={{
            name: doctorDisplayName,
            specialty: recommendedDoctor?.specialty ?? undefined,
            image_url: doctorImageUrl ?? undefined,
          }}
          prefillName={userName}
          prefillMobile={userMobile}
          onConfirmed={async () => {
            try {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(9, 0, 0, 0);
              const endTime = new Date(tomorrow);
              endTime.setMinutes(endTime.getMinutes() + 30);

              await appointmentService.create({
                doctor_guid: doctorGuid,
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
        {userName && (
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <User size={10} aria-hidden="true" />
            {userName}
          </div>
        )}
      </div>

      {/* Messages */}
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

            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.from === "bot"
                    ? "rounded-tl-sm bg-[var(--color-brand-blue-light)] text-foreground"
                    : "rounded-tr-sm bg-[var(--color-brand-teal)] text-white"
                )}
              >
                {msg.text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={i}>{part.slice(2, -2)}</strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Booking action buttons — shown when agent recommends a doctor */}
        {showBookingButtons && (
          <div className="flex gap-2 self-start ml-9 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={() => {
                setShowBookingButtons(false);
                handlePivotYes();
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-teal)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-teal-dark)] transition-colors active:scale-95"
            >
              <CalendarCheck size={12} aria-hidden="true" />
              Yes, Book Appointment
            </button>
            <button
              onClick={() => {
                setShowBookingButtons(false);
                const userMsg: Message = { id: `u-later-${Date.now()}`, from: "user", text: "Maybe later." };
                setMessages((prev) => [...prev, userMsg]);
                // Buffer and flush so the agent knows
                messageBufferRef.current.push("Maybe later.");
                setIsTyping(true);
                debounceTimerRef.current = setTimeout(() => {
                  flushBufferToBackend();
                }, DEBOUNCE_DELAY_MS);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors active:scale-95"
            >
              Maybe later
            </button>
          </div>
        )}

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
            placeholder="Describe your symptoms…"
            className="flex-1 h-11 rounded-xl bg-muted border-0 focus-visible:ring-1 focus-visible:ring-[var(--color-brand-teal)] text-sm placeholder:text-muted-foreground/70"
            aria-label="Message input"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim()}
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
