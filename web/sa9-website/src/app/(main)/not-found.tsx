import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4">
        <p className="font-mono text-xs uppercase tracking-widest text-sa9-pink mb-4">
          ERROR 404 // SIGNAL LOST
        </p>
        <h1 className="font-display font-black text-6xl sm:text-8xl uppercase tracking-tight text-sa9-text mb-4">
          <span className="text-sa9-pink animate-neon-pulse">VOID</span>
          <br />
          DETECTED.
        </h1>
        <p className="text-sa9-text-muted text-lg mb-10 max-w-md mx-auto">
          This sector of space is empty. The page you&apos;re looking for
          has been jettisoned, moved, or never existed.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/">
            <Button variant="primary" size="lg">
              RETURN TO BASE
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="secondary" size="lg">
              EXPLORE THE FLEET
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
