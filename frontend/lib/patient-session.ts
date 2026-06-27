/**
 * patient-session.ts
 * ──────────────────────────────────────────────────────────
 * Securely persists patient identity in the browser using
 * AES-256-GCM encryption via the Web Crypto API.
 *
 * Storage layout (2 localStorage keys):
 *   mda_patient_key      → Base64-encoded exported JWK CryptoKey
 *   mda_patient_session   → Base64-encoded (iv ‖ ciphertext) blob
 *
 * GCM's built-in authentication tag guarantees integrity —
 * any tampered byte causes decryption to fail and we return null.
 */

/* ── Constants ──────────────────────────────────────────── */
const STORAGE_KEY_SESSION = "mda_patient_session";
const STORAGE_KEY_CRYPTO  = "mda_patient_key";

/* ── Types ──────────────────────────────────────────────── */
export interface PatientSessionData {
  patientGuid: string;
  patientName: string;
  patientPhone: string;
}

/* ── Helpers: Base64 ⇄ ArrayBuffer ─────────────────────── */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/* ── Key management ────────────────────────────────────── */

/** Generate a new AES-256-GCM key */
async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,      // extractable – we need to export to localStorage
    ["encrypt", "decrypt"],
  );
}

/** Export key to JWK and store as Base64 in localStorage */
async function storeKey(key: CryptoKey): Promise<void> {
  const jwk = await crypto.subtle.exportKey("jwk", key);
  localStorage.setItem(STORAGE_KEY_CRYPTO, btoa(JSON.stringify(jwk)));
}

/** Load key from localStorage */
async function loadKey(): Promise<CryptoKey | null> {
  const raw = localStorage.getItem(STORAGE_KEY_CRYPTO);
  if (!raw) return null;

  try {
    const jwk = JSON.parse(atob(raw));
    return crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "AES-GCM", length: 256 },
      false,     // non-extractable once imported
      ["encrypt", "decrypt"],
    );
  } catch {
    return null;
  }
}

/* ── Encrypt / Decrypt ─────────────────────────────────── */

async function encrypt(key: CryptoKey, data: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encoded = new TextEncoder().encode(data);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );

  // Concatenate iv + ciphertext into a single buffer
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);

  return bufferToBase64(combined.buffer);
}

async function decrypt(key: CryptoKey, blob: string): Promise<string | null> {
  try {
    const combined = new Uint8Array(base64ToBuffer(blob));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );

    return new TextDecoder().decode(plaintext);
  } catch {
    // Decryption failure — tampered or corrupt data
    return null;
  }
}

/* ── Public API ─────────────────────────────────────────── */

/**
 * Save patient session data to encrypted localStorage.
 */
export async function savePatientSession(data: PatientSessionData): Promise<void> {
  const key = await generateKey();
  await storeKey(key);

  const json = JSON.stringify(data);
  const encryptedBlob = await encrypt(key, json);
  localStorage.setItem(STORAGE_KEY_SESSION, encryptedBlob);
}

/**
 * Read and decrypt patient session from localStorage.
 * Returns `null` if no session exists, or if data is corrupt/tampered.
 */
export async function getPatientSession(): Promise<PatientSessionData | null> {
  const blob = localStorage.getItem(STORAGE_KEY_SESSION);
  if (!blob) return null;

  const key = await loadKey();
  if (!key) return null;

  const json = await decrypt(key, blob);
  if (!json) return null;

  try {
    const parsed = JSON.parse(json);
    // Validate shape
    if (
      typeof parsed.patientGuid === "string" &&
      typeof parsed.patientName === "string" &&
      typeof parsed.patientPhone === "string"
    ) {
      return parsed as PatientSessionData;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Remove all patient session data from localStorage.
 */
export function clearPatientSession(): void {
  localStorage.removeItem(STORAGE_KEY_SESSION);
  localStorage.removeItem(STORAGE_KEY_CRYPTO);
}
