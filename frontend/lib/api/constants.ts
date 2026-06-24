/**
 * API Constants
 *
 * Paste your ngrok URL here after running: ngrok http 8000
 * Example: "https://abcd-1234.ngrok-free.app"
 */
export const API_BASE_URL = "https://fc72-103-120-202-172.ngrok-free.app";

/**
 * CRUD endpoint prefix — all table routers are mounted under this path.
 * Maps to `url_prefix = "/api/mda"` in backend/main.py.
 */
export const API_MDA_PREFIX = `${API_BASE_URL}/api/mda`;
