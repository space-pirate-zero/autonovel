"use client";

/**
 * Renders JSON-LD structured data as a <script> tag.
 * Use in page components or layouts for SEO.
 */
/**
 * Serialize JSON-LD for embedding in a <script> tag. Escaping `<` prevents a
 * string field containing `</script>` (e.g. an RSS-derived title/description)
 * from terminating the script element and injecting markup — the classic
 * JSON-LD XSS. `<` is a valid JSON escape, so parsers still read it as `<`.
 */
function serializeJsonLd(d: Record<string, unknown>): string {
  return JSON.stringify(d).replace(/</g, "\\u003c");
}

export function StructuredData({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  if (Array.isArray(data)) {
    return (
      <>
        {data.map((d, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(d) }}
          />
        ))}
      </>
    );
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
