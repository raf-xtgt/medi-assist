import type { JwtPayload, Session, SessionUser } from "./types";

const SESSION_COOKIE = "medi-session";

/**
 * Decode a JWT without verification (Edge-safe, no crypto needed for reading claims).
 * Real verification happens server-side when setting the cookie.
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payloadB64] = token.split(".");
    const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function payloadToSession(token: string, payload: JwtPayload): Session {
  const user: SessionUser = {
    id:        payload.sub,
    name:      payload.name,
    email:     payload.email,
    phone:     payload.phone,
    role:      payload.role,
    clinicId:  payload.clinicId,
    avatarUrl: payload.avatarUrl,
  };
  return { user, accessToken: token, expiresAt: payload.exp * 1000 };
}

export function isExpired(session: Session): boolean {
  return Date.now() > session.expiresAt - 30_000; // 30s buffer
}

export { SESSION_COOKIE };
