/**
 * API Constants
 *
 * Paste your ngrok URL here after running: ngrok http 8000
 * Example: "https://abcd-1234.ngrok-free.app"
 */
export const API_BASE_URL = "https://342b-2400-c600-357f-2240-21b9-35ae-d04c-bcaf.ngrok-free.app";

/**
 * CRUD endpoint prefix — all table routers are mounted under this path.
 * Maps to `url_prefix = "/api/mda"` in backend/main.py.
 */
export const API_MDA_PREFIX = `${API_BASE_URL}/api/mda`;
