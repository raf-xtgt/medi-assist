"use client";

import { Suspense, useState, useTransition } from "react";
import { useSessionContext } from "@/providers/SessionProvider";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

function LoginForm() {
  const { sendOtp, otpState }  = useSessionContext();
  const [identifier, setId]    = useState("");
  const [role, setRole]        = useState<"admin" | "doctor" | "patient">("patient");
  const [error, setError]      = useState("");
  const router                 = useRouter();
  const searchParams           = useSearchParams();
  const [isPending, start]     = useTransition();

  const isEmail = identifier.includes("@");
  const isValid = identifier.trim().length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValid) { setError("Please enter a valid email or phone number."); return; }
    start(async () => {
      await sendOtp(identifier);
      const params = new URLSearchParams({
        identifier,
        role,
        ...(searchParams.get("from") ? { from: searchParams.get("from")! } : {}),
      });
      router.push(`/verify?${params.toString()}`);
    });
  };

  const roles = [
    { value: "patient" as const, label: "Patient" },
    { value: "doctor"  as const, label: "Doctor" },
    { value: "admin"   as const, label: "Admin" },
  ];

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex justify-center">
        <Logo href="/" size="lg" />
      </div>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>
            Enter your email or phone to receive a one-time code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* Role selector */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">I am a</Label>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Select role">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    role="radio"
                    aria-checked={role === r.value}
                    onClick={() => setRole(r.value)}
                    className={cn(
                      "rounded-lg border py-2.5 text-sm font-medium transition-colors",
                      role === r.value
                        ? "border-[var(--primary)] bg-[var(--color-brand-blue-light)] text-[var(--primary)]"
                        : "border-input text-muted-foreground hover:border-[var(--primary)]/40 hover:text-foreground"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Identifier */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="identifier">
                {isEmail ? "Email address" : "Email or phone"}
              </Label>
              <Input
                id="identifier"
                type="text"
                inputMode="email"
                autoComplete="email"
                placeholder="you@clinic.com or +1 555 000 0000"
                value={identifier}
                onChange={(e) => { setId(e.target.value); setError(""); }}
                aria-invalid={!!error}
                aria-describedby={error ? "id-error" : undefined}
                className={cn(error && "border-destructive")}
              />
              {error && (
                <p id="id-error" role="alert" className="text-xs text-destructive">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isValid || isPending || otpState === "sending"}
              className="h-11 w-full bg-[var(--primary)] hover:bg-[var(--color-brand-blue-dark)] text-white"
            >
              {isPending || otpState === "sending" ? (
                <>
                  <Loader2 size={16} className="animate-spin" data-icon="inline-start" aria-hidden="true" />
                  Sending code...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={16} data-icon="inline-end" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            By continuing you agree to our{" "}
            <a href="#" className="underline underline-offset-2 hover:text-foreground">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
