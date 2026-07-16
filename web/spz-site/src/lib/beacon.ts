/**
 * Lightweight analytics beacon — sends pageview, session, and duration
 * data to the StyleLift API for real-time dashboards.
 *
 * Uses navigator.sendBeacon() for reliable delivery even on page unload.
 * All data is anonymous — no cookies, no PII. Session ID is ephemeral
 * (sessionStorage, cleared when the tab closes).
 */

const BEACON_URL =
  process.env.NEXT_PUBLIC_BEACON_URL || 'https://api.stylelift.fashion/v1/analytics/beacon';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('_spz_sid');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('_spz_sid', sid);
  }
  return sid;
}

function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Unknown';
  }
}

function getLanguage(): string {
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language || 'en';
}

function getScreenSize(): string {
  if (typeof window === 'undefined') return '';
  return `${window.screen.width}x${window.screen.height}`;
}

let sessionStart = 0;
let lastActivity = 0;

function send(event: string, data: Record<string, unknown> = {}) {
  if (typeof navigator === 'undefined') return;
  const payload = JSON.stringify({
    event,
    sessionId: getSessionId(),
    page: window.location.pathname,
    referrer: document.referrer || '',
    timezone: getTimezone(),
    language: getLanguage(),
    screenSize: getScreenSize(),
    timestamp: Date.now(),
    ...data,
  });
  try {
    navigator.sendBeacon(BEACON_URL, payload);
  } catch {
    // Fallback to fetch (some older browsers)
    fetch(BEACON_URL, {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {});
  }
}

export function beaconPageview() {
  lastActivity = Date.now();
  send('pageview');
}

export function beaconSessionStart() {
  sessionStart = Date.now();
  lastActivity = sessionStart;
  send('session_start');
}

export function beaconSessionEnd() {
  const duration = lastActivity > 0 ? Math.round((Date.now() - sessionStart) / 1000) : 0;
  send('session_end', { duration });
}

export function initBeacon() {
  if (typeof window === 'undefined') return;
  beaconSessionStart();

  // Track duration on visibility change and unload
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      beaconSessionEnd();
    } else {
      lastActivity = Date.now();
    }
  });

  window.addEventListener('beforeunload', () => {
    beaconSessionEnd();
  });
}
