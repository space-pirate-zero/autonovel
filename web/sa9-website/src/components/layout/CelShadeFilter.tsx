export function CelShadeFilter() {
  return (
    <svg
      className="absolute w-0 h-0"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="celShade" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
            <feFuncG type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
            <feFuncB type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
          </feComponentTransfer>
          <feMorphology operator="dilate" radius="1" result="dilated" />
          <feComposite in="SourceGraphic" in2="dilated" operator="xor" result="edges" />
          <feFlood floodColor="#030303" floodOpacity="0.8" result="edgeColor" />
          <feComposite in="edgeColor" in2="edges" operator="in" result="coloredEdges" />
          <feComposite in="SourceGraphic" in2="coloredEdges" operator="over" />
        </filter>
        <filter id="celShadeLight" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0 0.3 0.6 0.9 1" />
            <feFuncG type="discrete" tableValues="0 0.3 0.6 0.9 1" />
            <feFuncB type="discrete" tableValues="0 0.3 0.6 0.9 1" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}
