/**
 * lib/utils/storage.js
 *
 * AI Spend Audit — Client-Side Persistence Layer
 *
 * Architecture: Single-key envelope with versioning, TTL, and safe parsing.
 *
 * Public API (the only surface the rest of the app touches):
 *   saveAuditData(data)  → { ok: true } | { ok: false, error }
 *   getAuditData()       → payload | null
 *   clearAuditData()     → void
 *
 * All functions are safe to call in SSR context — they return null/no-op
 * when running outside the browser without throwing.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Namespaced storage key.
 * Using a product prefix + version suffix means:
 *   - no collisions with other apps on the same origin
 *   - bumping SCHEMA_VERSION auto-invalidates old data
 */
const STORAGE_KEY = "ais_audit_v1";

/**
 * Envelope schema version.
 * Increment this whenever the shape of the saved payload changes.
 * Old envelopes with a different version are treated as a cache miss
 * and cleared automatically.
 */
const SCHEMA_VERSION = 1;

/**
 * Time-to-live: how long saved audit data remains valid.
 * Default: 24 hours. Adjust to match your UX contract.
 */
const TTL_MS = 24 * 60 * 60 * 1000;

// ─── Private: Environment Guard ───────────────────────────────────────────────

/**
 * Returns true only when running in a real browser context.
 * Guards every localStorage call against SSR / static generation environments.
 *
 * @returns {boolean}
 */
function _isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

// ─── Private: Envelope Validator ─────────────────────────────────────────────

/**
 * Validates the shape and freshness of a parsed envelope.
 * An envelope is valid when:
 *   1. It is a non-null object
 *   2. Its schema version matches the current constant
 *   3. It contains a payload field
 *   4. Its expiresAt timestamp has not passed
 *
 * @param {unknown} envelope - The parsed value from localStorage.
 * @returns {boolean}
 */
function _isValidEnvelope(envelope) {
  if (!envelope || typeof envelope !== "object") return false;
  if (envelope.version !== SCHEMA_VERSION) return false;
  if (!("payload" in envelope)) return false;
  if (typeof envelope.expiresAt !== "number") return false;
  if (Date.now() > envelope.expiresAt) return false;
  return true;
}

// ─── Private: Raw Read ───────────────────────────────────────────────────────

/**
 * Attempts to read and JSON-parse the storage key.
 * Returns the parsed value on success, or null on any failure.
 * Never throws.
 *
 * @returns {object|null}
 */
function _read() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    // Handles: JSON.parse failure on corrupted data, SecurityError
    return null;
  }
}

// ─── Private: Raw Write ──────────────────────────────────────────────────────

/**
 * Attempts to JSON-serialize and write a value to localStorage.
 * Returns true on success, false on any failure.
 * Never throws.
 *
 * @param {object} value - The envelope object to persist.
 * @returns {boolean}
 */
function _write(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    // Handles: QuotaExceededError, SecurityError, JSON.stringify circular ref
    return false;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Saves audit form data to localStorage inside a versioned envelope.
 *
 * The envelope structure:
 * {
 *   version:   number,   // schema version for migration guards
 *   savedAt:   string,   // ISO timestamp — human-readable audit trail
 *   expiresAt: number,   // Unix ms — used for TTL validation on read
 *   payload:   object,   // the raw audit form data
 * }
 *
 * @param {object} data - The audit form data to persist.
 * @returns {{ ok: true } | { ok: false, error: string }}
 *
 * @example
 * const result = saveAuditData({ tools: [...], spend: 12000 });
 * if (!result.ok) console.warn("Could not persist audit:", result.error);
 */
export function saveAuditData(data) {
  if (!_isBrowser()) {
    return { ok: false, error: "localStorage is not available in this environment." };
  }

  if (!data || typeof data !== "object") {
    return { ok: false, error: "Invalid audit data: expected a non-null object." };
  }

  const now = Date.now();

  const envelope = {
    version: SCHEMA_VERSION,
    savedAt: new Date(now).toISOString(),
    expiresAt: now + TTL_MS,
    payload: data,
  };

  const written = _write(envelope);

  if (!written) {
    return {
      ok: false,
      error: "Failed to write to localStorage. Storage may be full or restricted.",
    };
  }

  return { ok: true };
}

/**
 * Retrieves audit data from localStorage.
 *
 * Returns the raw payload on success.
 * Returns null if:
 *   - Not in a browser context
 *   - No data has been saved
 *   - The data is corrupted (invalid JSON)
 *   - The schema version has changed
 *   - The TTL has expired
 *
 * When null is returned due to an invalid/expired envelope,
 * the bad data is automatically cleared to keep storage clean.
 *
 * @returns {object|null}
 *
 * @example
 * const auditData = getAuditData();
 * if (!auditData) router.push('/audit'); // redirect to form
 */
export function getAuditData() {
  if (!_isBrowser()) return null;

  const envelope = _read();

  // Nothing stored — clean miss
  if (envelope === null) return null;

  // Invalid, expired, or wrong version — clear and treat as miss
  if (!_isValidEnvelope(envelope)) {
    clearAuditData();
    return null;
  }

  return envelope.payload;
}

/**
 * Removes all audit data from localStorage.
 * Safe to call at any time — no-ops gracefully in SSR or if key doesn't exist.
 *
 * Call this:
 *   - After the user completes or cancels an audit session
 *   - When you detect a corrupt/incompatible envelope
 *   - On explicit user logout or data reset
 *
 * @returns {void}
 *
 * @example
 * clearAuditData();
 * router.push('/');
 */
export function clearAuditData() {
  if (!_isBrowser()) return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently no-op: SecurityError in restricted contexts
  }
}

/**
 * Returns metadata about the current stored envelope without returning payload.
 * Useful for debugging, admin panels, or showing "last saved" timestamps in the UI.
 *
 * @returns {{ savedAt: string, expiresAt: number, version: number } | null}
 *
 * @example
 * const meta = getAuditMeta();
 * if (meta) console.log("Audit saved at:", meta.savedAt);
 */
export function getAuditMeta() {
  if (!_isBrowser()) return null;

  const envelope = _read();
  if (!_isValidEnvelope(envelope)) return null;

  return {
    savedAt: envelope.savedAt,
    expiresAt: envelope.expiresAt,
    version: envelope.version,
  };
}