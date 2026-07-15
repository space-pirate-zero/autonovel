const STAGGER = ["stagger-1", "stagger-2", "stagger-3", "stagger-4"];

export function StatsBar({
  highlights,
  color,
}: {
  highlights: string[];
  color: string;
}) {
  const items = highlights.slice(0, 4);

  return (
    <div
      className="border-y-3 border-sa9-border bg-sa9-surface-raised"
      role="list"
      aria-label="Product highlights"
    >
      <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-sa9-border">
        {items.map((highlight, i) => (
          <div
            key={i}
            role="listitem"
            className={`group relative px-6 py-8 transition-colors duration-300 hover:bg-sa9-surface animate-fade-in-up ${STAGGER[i] ?? ""}`}
          >
            {/* top accent bar grows on hover */}
            <span
              className="absolute top-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500 ease-out"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span
              className="font-display font-black text-3xl sm:text-4xl block mb-2 transition-transform duration-300 group-hover:-translate-y-0.5"
              style={{ color, textShadow: `0 0 20px ${color}33` }}
              aria-hidden="true"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="font-body text-sa9-text-muted text-sm leading-relaxed">
              {highlight}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
