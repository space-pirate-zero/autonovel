export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="animate-pulse space-y-8">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-sa9-surface-raised border border-sa9-border" />
          <div className="h-14 w-80 max-w-full bg-sa9-surface-raised border border-sa9-border" />
          <div className="h-6 w-96 max-w-full bg-sa9-surface-raised border border-sa9-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="border-3 border-sa9-border bg-sa9-surface-raised p-6 shadow-[4px_4px_0_rgba(0,0,0,0.5)] space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 bg-sa9-surface-overlay border border-sa9-border" />
                <div className="h-5 w-16 bg-sa9-surface-overlay border border-sa9-border" />
              </div>
              <div className="h-5 w-3/4 bg-sa9-surface-overlay border border-sa9-border" />
              <div className="h-4 w-full bg-sa9-surface-overlay border border-sa9-border" />
              <div className="h-4 w-5/6 bg-sa9-surface-overlay border border-sa9-border" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
