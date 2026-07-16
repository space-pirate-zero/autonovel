// Credential token codec. For this build the credential is a self-describing
// base64url token (name/rank/index/date) so the loop works end-to-end client-side
// and /verify can render it. NOTE: a production Open Badge needs SERVER-SIDE
// minting + signature + a DB record (see website/PLAN.md §9/§10) — this token is
// not tamper-proof; it's the functional v1 of the loop.

export type Cred = {
  n: string;   // name
  r: number;   // rank index (0-4)
  x: number;   // insurgent index (0-100)
  d: string;   // issue date YYYY-MM-DD
};

const b64url = (b64: string) => b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64url = (s: string) => {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  return b + "=".repeat((4 - (b.length % 4)) % 4);
};

export function encodeCred(c: Cred): string {
  const json = JSON.stringify(c);
  const b64 =
    typeof window !== "undefined"
      ? btoa(unescape(encodeURIComponent(json)))
      : Buffer.from(json, "utf8").toString("base64");
  return b64url(b64);
}

export function decodeCred(token: string): Cred | null {
  try {
    const b64 = unb64url(token);
    const json =
      typeof window !== "undefined"
        ? decodeURIComponent(escape(atob(b64)))
        : Buffer.from(b64, "base64").toString("utf8");
    const c = JSON.parse(json);
    if (typeof c.n === "string" && typeof c.r === "number") return c;
    return null;
  } catch {
    return null;
  }
}
