Here's a clear overview of how authentication works in this app:

---

## How Login Works (The Big Picture)

The app uses **passwordless OTP (one-time password) login**. There's no username/password — instead, you enter your email or phone, receive a 6-digit code, and enter that code to sign in.

---

## When Does a User Get Redirected to the Login Page?

The **middleware** (`middleware.ts`) runs on every page request and decides who can go where. A user gets sent to `/login` when:

1. They try to visit a **protected route** (anything starting with `/admin`, `/doctor`, or `/patient`) ...
2. AND they either have **no session cookie** (`medi-session`) or their cookie contains an **expired token**.

The middleware saves the page they were trying to visit in a `?from=` query parameter so they can be sent back there after login.

**Routes that DON'T trigger this redirect:**
- Public paths: `/`, `/_next/*`, `/api/auth/*`, `/public/*`
- Zero-login patient paths: `/patient/landing`, `/patient/book`, `/patient/triage`, `/patient/home` (these work without any login)
- Clinic pages: `/clinic/{slug}` (public, doesn't match any protected prefix)

Also, if a user is **already logged in** and visits `/login` or `/verify`, the middleware redirects them away to their home page — you can't visit the login page while authenticated.

---

## What Determines Where You Go After Logging In?

After successful OTP verification, the **role you selected on the login page** determines your destination. Here's the mapping (defined in `types.ts`):

| Role | Redirected to |
|------|--------------|
| admin | `/admin/dashboard` |
| doctor | `/doctor/dashboard` |
| patient | `/patient/home` |

The redirect happens in `SessionProvider.tsx` inside the `verifyOtp` function. After the token is received and decoded, it calls `roleHome(session.user.role)` which looks up the route from that table above, then does `router.push(...)` to navigate there.

---

## Step-by-Step Flow

1. User visits a protected page (e.g., `/doctor/dashboard`) without being logged in.
2. Middleware catches this → redirects to `/login?from=/doctor/dashboard`.
3. On the login form, user picks a role (Patient/Doctor/Admin), enters their email or phone, clicks Continue.
4. App calls `POST /api/auth/send-otp` (currently a stub — doesn't actually send anything).
5. User is navigated to `/verify` with their identifier and role in the URL params.
6. User enters the 6-digit OTP (currently any user can type `123456` as a demo code).
7. App calls `POST /api/auth/verify-otp` — the server validates the code, creates a JWT containing the user's role, and sets it as an httpOnly cookie.
8. `SessionProvider` reads the token, extracts the role, and calls `router.push(roleHome(role))` — landing the user on their role-specific dashboard.

---

## Important Notes

- The **role is chosen by the user** on the login form — it's not looked up from a database (this is because auth is still stubbed for development).
- The OTP code `123456` always works (demo mode).
- The JWT is unsigned (`alg: "none"`) — this is placeholder logic, not production-ready.
- Patient flows at `/patient/home`, `/patient/book`, `/patient/triage`, and `/patient/landing` bypass login entirely using an encrypted local storage session instead of JWT cookies.


The session cookie (`medi-session`) is **not stored in the browser cache** — it's stored in the browser's **cookie jar** (the standard cookie storage).

Specifically, it's set as an **httpOnly cookie** on the `/` path of the domain. You can find it in your browser's DevTools under:

**Application tab → Cookies → (site's domain, e.g., `localhost:3000`)**

You'll see it listed as `medi-session` with these properties (set in `verify-otp/route.ts`):

| Property | Value |
|----------|-------|
| Name | `medi-session` |
| Path | `/` |
| HttpOnly | `true` |
| SameSite | `Lax` |
| Secure | `true` in production, `false` in dev |
| Max-Age | 8 hours (28800 seconds) |

Because it's **httpOnly**, JavaScript running in the browser (like `document.cookie`) cannot read it directly. It's only sent automatically by the browser with every HTTP request to the same domain. That's why the app uses `GET /api/auth/me` to read the session — the cookie travels with that request to the server, and the server reads it and sends back the token contents.

So to clarify the terminology: it's not in "cache" (which is for storing page assets, API responses, etc.). It lives in the browser's dedicated cookie storage, which is a separate mechanism the browser uses specifically for cookies.