"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useSessionContext } from "@/providers/SessionProvider";
import { Logo } from "@/components/shared/Logo";
import { OtpInput } from "@/components/auth/OtpInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function VerifyForm() {
  const { verifyOtp, sendOtp, otpState } = useSessionContext();
  const searchParams = useSearchParams();
  const identifier   = searchParams.get("identifier") ?? "";
  const role         = searchParams.get("role")       ?? "patient";

  const [otp, setOtp]          = useState("");
  const [hasError, setError]   = useState(false);
  const [resent, setResent]    = useState(false);
  const [isPending, start]     = useTransition();

  const handleComplete = (code: string) => {
    setOtp(code);
    setError(false);
  };

  const handleVerify = () => {
    if (otp.length < 6) return;
    setError(false);
    start(async () => {
      try {
        // Pass role so the stub token can embed it
        await fetch("/api/auth/verify-otp", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ identifier, otp, role }),
        }).then(async (res) => {
          if (!res.ok) throw new Error("Invalid OTP");
          const { token } = await res.json();
          // Manually trigger verify via provider
          await verifyOtp(identifier, otp);
        });
      } catch {
        setError(true);
      }
    });
  };

  const handleResend = async () => {
    setError(false);
    setOtp("");
    setResent(false);
    await sendOtp(identifier);
    setResent(true);
  };

  const isVerifying = isPending || otpState === "verifying";

  const masked = identifier.includes("@")
    ? identifier.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) =>
        a + "*".repeat(b.length) + c
      )
    : identifier.replace(/\d(?=\d{4})/g, "*");

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex justify-center">
        <Logo href="/" size="lg" />
      </div>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">Check your {identifier.includes("@") ? "email" : "messages"}</CardTitle>
          <CardDescription>
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{masked}</span>.
            {" "}Enter it below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {/* OTP input */}
          <OtpInput
            onComplete={handleComplete}
            disabled={isVerifying}
            hasError={hasError || otpState === "error"}
          />

          {(hasError || otpState === "error") && (
            <p role="alert" className="text-sm text-destructive text-center -mt-3">
              That code is incorrect. Please try again.
            </p>
          )}

          {resent && (
            <p role="status" className="text-sm text-emerald-600 text-center -mt-3">
              A new code was sent.
            </p>
          )}

          {/* Dev hint */}
          <p className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 text-center">
            Demo: use code <strong>123456</strong> to sign in.
          </p>

          {/* Verify button */}
          <Button
            onClick={handleVerify}
            disabled={otp.length < 6 || isVerifying}
            className={cn(
              "h-11 w-full text-white",
              "bg-[var(--primary)] hover:bg-[var(--color-brand-blue-dark)]"
            )}
          >
            {isVerifying ? (
              <>
                <Loader2 size={16} className="animate-spin" data-icon="inline-start" aria-hidden="true" />
                Verifying…
              </>
            ) : (
              "Verify and sign in"
            )}
          </Button>

          {/* Resend + back */}
          <div className="flex w-full items-center justify-between text-sm">
            <button
              onClick={handleResend}
              disabled={isVerifying || otpState === "sending"}
              className="text-[var(--primary)] hover:underline disabled:opacity-50"
            >
              Resend code
            </button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">
                <ArrowLeft size={14} data-icon="inline-start" aria-hidden="true" />
                Back
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}
