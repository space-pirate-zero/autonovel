"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Platform } from "@/lib/oauth/types";
import { PLATFORM_CONFIGS } from "@/lib/oauth/platforms";

// ── Platform icon SVGs ────────────────────────────────────────────────────────
// Inline SVGs keep this self-contained with no external icon deps.

function PlatformIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const cls = className ?? "w-8 h-8";

  switch (icon) {
    case "linkedin":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      );
    case "reddit":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      );
    case "bluesky":
      return (
        <svg className={cls} viewBox="0 0 568 501" fill="currentColor">
          <path d="M123.121 33.664C188.241 82.553 258.281 181.68 284 234.873c25.719-53.192 95.759-152.32 160.879-201.21C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555-20.275 72.453-94.155 90.933-159.875 79.748C507.222 323.8 536.444 388.56 473.333 453.32c-119.86 122.992-172.272-30.859-185.702-70.281-2.462-7.227-3.614-10.608-3.631-7.733-.017-2.875-1.169.506-3.631 7.733-13.43 39.422-65.842 193.273-185.702 70.281-63.111-64.76-33.889-129.52 80.654-149.07-65.72 11.185-139.6-7.295-159.875-79.748C9.945 203.66 0 75.293 0 57.947 0-28.906 76.134-1.611 123.121 33.664z" />
        </svg>
      );
    case "twitter":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.736-8.849L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "facebook":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case "google":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 1 1 0-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0 0 12.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
        </svg>
      );
    case "meta":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.264-3.393-1.264zm.051 1.786c.76 0 1.523.303 2.208.89.63.54 1.25 1.37 1.998 2.56a44.194 44.194 0 0 0-2.535 4.326c-.871 1.705-1.775 2.975-2.34 3.699-.62.79-1.149 1.03-1.75 1.03-.896 0-1.515-.44-1.985-1.23a4.813 4.813 0 0 1-.276-.627 5.29 5.29 0 0 1-.194-1.485c0-2.317.666-4.714 1.82-6.327.87-1.23 1.901-1.836 3.054-1.836zm9.587.637c1.385 0 2.568.805 3.415 2.065 1.154 1.722 1.803 4.138 1.803 6.535 0 1.254-.237 2.152-.612 2.767a1.975 1.975 0 0 1-.483.583c-.356.288-.788.45-1.398.45-.763 0-1.34-.196-2.127-.983-.63-.623-1.476-1.813-2.108-2.87l-1.935-3.234c.588-1.015 1.179-1.964 1.675-2.576.748-.908 1.48-1.737 1.77-1.737z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

// ── Platform descriptions ─────────────────────────────────────────────────────

const PLATFORM_ORDER: Platform[] = [
  Platform.LinkedIn,
  Platform.Twitter,
  Platform.Instagram,
  Platform.Facebook,
  Platform.Reddit,
  Platform.Bluesky,
  Platform.GoogleSearchConsole,
  Platform.MetaAds,
  Platform.MetaBusiness,
];

// ── Bluesky form component ────────────────────────────────────────────────────

function BlueskyForm({ onSuccess, onError }: { onSuccess: () => void; onError: (msg: string) => void }) {
  const [handle, setHandle] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/connect/bluesky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, appPassword }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        onSuccess();
      } else {
        onError(data.error ?? "Connection failed");
      }
    } catch {
      onError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label className="block font-mono text-xs text-sa9-text-muted uppercase tracking-widest mb-1">
          Handle
        </label>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="yourname.bsky.social"
          required
          className="w-full bg-sa9-surface border-3 border-sa9-border px-3 py-2 font-mono text-sm text-sa9-text placeholder:text-sa9-text-dim focus:outline-none focus:border-sa9-pink transition-colors"
        />
      </div>
      <div>
        <label className="block font-mono text-xs text-sa9-text-muted uppercase tracking-widest mb-1">
          App Password
        </label>
        <input
          type="password"
          value={appPassword}
          onChange={(e) => setAppPassword(e.target.value)}
          placeholder="xxxx-xxxx-xxxx-xxxx"
          required
          className="w-full bg-sa9-surface border-3 border-sa9-border px-3 py-2 font-mono text-sm text-sa9-text placeholder:text-sa9-text-dim focus:outline-none focus:border-sa9-pink transition-colors"
        />
        <p className="font-mono text-xs text-sa9-text-dim mt-1">
          Generate at bsky.social → Settings → App Passwords
        </p>
      </div>
      <Button
        type="submit"
        variant="primary"
        size="sm"
        disabled={loading}
        className="w-full"
      >
        {loading ? "CONNECTING..." : "CONNECT BLUESKY"}
      </Button>
    </form>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ConnectPageContent() {
  const searchParams = useSearchParams();
  const statusPlatform = searchParams.get("platform") as Platform | null;
  const status = searchParams.get("status") as "success" | "error" | null;
  const errorMsg = searchParams.get("error");

  const [blueskyExpanded, setBlueskyExpanded] = useState(false);
  const [blueskySuccess, setBlueskySuccess] = useState(false);
  const [blueskyError, setBlueskyError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-sa9-surface">
      {/* ── Header ── */}
      <section className="border-b-3 border-sa9-border bg-sa9-surface-raised relative overflow-hidden">
        <div className="absolute inset-0 data-grid-bg opacity-30" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-sa9-pink border-3 border-sa9-pink px-2 py-0.5">
              INTERNAL
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-sa9-text-dim">
              SA9 MARKETING CLOUD
            </span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-sa9-text mb-4">
            Platform <span className="text-sa9-pink">Connections</span>
          </h1>
          <p className="text-sa9-text-muted text-lg max-w-2xl">
            Connect social and marketing platforms to the SA9 Marketing Cloud.
            All tokens are stored encrypted in GCP Secret Manager.
          </p>
          <p className="font-mono text-xs text-sa9-text-dim mt-3">
            {"// 9 platforms supported — OAuth 2.0 + AT Protocol"}
          </p>
        </div>
      </section>

      {/* ── Status banner ── */}
      {status && statusPlatform && (
        <div
          className={`border-b-3 px-4 py-4 ${
            status === "success"
              ? "bg-sa9-green/10 border-sa9-green"
              : "bg-sa9-red/10 border-sa9-red"
          }`}
        >
          <div className="max-w-5xl mx-auto flex items-start gap-3">
            <span
              className={`font-mono text-xs uppercase tracking-widest border-3 px-2 py-0.5 shrink-0 ${
                status === "success"
                  ? "text-sa9-green border-sa9-green"
                  : "text-sa9-red border-sa9-red"
              }`}
            >
              {status === "success" ? "CONNECTED" : "ERROR"}
            </span>
            <div>
              <p
                className={`font-mono text-sm ${
                  status === "success" ? "text-sa9-green" : "text-sa9-red"
                }`}
              >
                {status === "success"
                  ? `Successfully connected ${PLATFORM_CONFIGS[statusPlatform]?.name ?? statusPlatform}.`
                  : `Failed to connect ${PLATFORM_CONFIGS[statusPlatform]?.name ?? statusPlatform}.`}
              </p>
              {status === "error" && errorMsg && (
                <p className="font-mono text-xs text-sa9-text-dim mt-1">
                  {decodeURIComponent(errorMsg)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Platform grid ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORM_ORDER.map((platform) => {
            const config = PLATFORM_CONFIGS[platform];
            const isConnected =
              platform === statusPlatform && status === "success";
            const isBluesky = config.customFlow === "atproto";
            const hasBlueskySuccess = isBluesky && blueskySuccess;

            return (
              <div
                key={platform}
                className={`border-3 bg-sa9-surface-raised p-6 shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-all duration-200 flex flex-col ${
                  isConnected || hasBlueskySuccess
                    ? "border-sa9-green"
                    : "border-sa9-border hover:border-sa9-pink hover:shadow-[6px_6px_0_#990044]"
                }`}
              >
                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`${
                      isConnected || hasBlueskySuccess
                        ? "text-sa9-green"
                        : "text-sa9-text-muted"
                    }`}
                  >
                    <PlatformIcon icon={config.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display font-bold text-sm uppercase tracking-wider text-sa9-text truncate">
                      {config.name}
                    </h2>
                    {(isConnected || hasBlueskySuccess) && (
                      <span className="font-mono text-xs text-sa9-green">
                        CONNECTED
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sa9-text-muted text-sm leading-relaxed flex-1 mb-5">
                  {config.description}
                </p>

                {/* Scopes hint */}
                {config.scopes.length > 0 && (
                  <div className="mb-4">
                    <p className="font-mono text-xs text-sa9-text-dim uppercase tracking-widest mb-1">
                      Scopes
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {config.scopes.slice(0, 3).map((scope) => (
                        <span
                          key={scope}
                          className="font-mono text-[10px] text-sa9-text-dim border border-sa9-border px-1.5 py-0.5"
                        >
                          {scope.split("/").pop()}
                        </span>
                      ))}
                      {config.scopes.length > 3 && (
                        <span className="font-mono text-[10px] text-sa9-text-dim">
                          +{config.scopes.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action */}
                {isBluesky ? (
                  <div>
                    {hasBlueskySuccess ? (
                      <p className="font-mono text-xs text-sa9-green">
                        Session active — tokens stored.
                      </p>
                    ) : blueskyExpanded ? (
                      <BlueskyForm
                        onSuccess={() => {
                          setBlueskySuccess(true);
                          setBlueskyExpanded(false);
                          setBlueskyError(null);
                        }}
                        onError={(msg) => setBlueskyError(msg)}
                      />
                    ) : (
                      <div>
                        {blueskyError && (
                          <p className="font-mono text-xs text-sa9-red mb-3">
                            {blueskyError}
                          </p>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setBlueskyExpanded(true);
                            setBlueskyError(null);
                          }}
                        >
                          CONNECT
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={
                      isConnected
                        ? `/api/auth/connect/${platform}`
                        : `/api/auth/connect/${platform}`
                    }
                    className="block"
                  >
                    <Button
                      variant={isConnected ? "ghost" : "secondary"}
                      size="sm"
                      className="w-full"
                    >
                      {isConnected ? "RECONNECT" : "CONNECT"}
                    </Button>
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Env var reference ── */}
        <div className="mt-12 border-3 border-sa9-border bg-sa9-surface-raised p-6">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-sa9-text mb-4">
            Required Environment Variables
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            {PLATFORM_ORDER.filter((p) => PLATFORM_CONFIGS[p].customFlow !== "atproto").map(
              (platform) => {
                const config = PLATFORM_CONFIGS[platform];
                return (
                  <div key={platform} className="font-mono text-xs text-sa9-text-dim py-1 border-b border-sa9-border/40">
                    <span className="text-sa9-pink">{config.clientIdEnvVar}</span>
                    {" / "}
                    <span className="text-sa9-cyan">{config.clientSecretEnvVar}</span>
                  </div>
                );
              }
            )}
          </div>
          <p className="font-mono text-xs text-sa9-text-dim mt-4">
            {"// Set in GCP Secret Manager or .env.local for development"}
          </p>
        </div>
      </section>
    </div>
  );
}
