import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-sa9-surface">
      <div className="text-center px-4">
        <p className="font-mono text-xs uppercase tracking-widest text-sa9-cyan mb-4">
          TRANSMISSION_ERROR // 404
        </p>
        <h1 className="font-display font-black text-6xl sm:text-8xl uppercase tracking-tight text-sa9-text mb-4">
          <span className="text-sa9-pink animate-neon-pulse">SIGNAL</span>
          <br />
          NOT FOUND.
        </h1>
        <p className="text-sa9-text-muted text-lg mb-10 max-w-md mx-auto">
          This frequency is dead. The page you&apos;re looking for has been
          redacted, moved, or was never broadcast.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="border-3 border-sa9-pink bg-sa9-pink text-sa9-surface px-8 py-3 font-display font-bold text-sm uppercase tracking-widest shadow-[4px_4px_0_#990044] hover:shadow-[6px_6px_0_#990044] hover:-translate-y-0.5 transition-all"
          >
            RETURN TO BASE
          </Link>
          <Link
            href="/bio"
            className="border-3 border-sa9-border text-sa9-text px-8 py-3 font-display font-bold text-sm uppercase tracking-widest shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:border-sa9-cyan hover:shadow-[6px_6px_0_rgba(0,240,255,0.2)] hover:-translate-y-0.5 transition-all"
          >
            READ THE DOSSIER
          </Link>
        </div>
      </div>
    </main>
  );
}
