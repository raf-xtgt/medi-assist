export type UserRole = "admin" | "doctor" | "patient";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  clinicId?: string;
  avatarUrl?: string;
}

export interface Session {
  user: SessionUser;
  accessToken: string;
  expiresAt: number;
}

export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  clinicId?: string;
  avatarUrl?: string;
  iat: number;
  exp: number;
}

export type OtpState =
  | "idle"
  | "sending"
  | "awaiting_otp"
  | "verifying"
  | "authenticated"
  | "error";

export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  admin:   "/admin/dashboard",
  doctor:  "/doctor/dashboard",
  patient: "/patient/home",
};

export const PROTECTED_PREFIXES: Record<UserRole, string> = {
  admin:   "/admin",
  doctor:  "/doctor",
  patient: "/patient",
};
