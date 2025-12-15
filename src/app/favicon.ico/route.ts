export function GET() {
  // Text-based favicon to avoid needing a binary .ico in repo.
  // Browsers requesting /favicon.ico will receive this SVG.
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ef4444"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="56" height="56" rx="14" fill="#0b0b0b" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
  <circle cx="32" cy="32" r="16" fill="url(#g)" opacity="0.95"/>
  <text x="32" y="38" font-family="system-ui,Segoe UI,Arial" font-size="16" text-anchor="middle" fill="#0b0b0b" font-weight="700">Sn</text>
</svg>`;

  return new Response(svg, {
    headers: {
      // Serve as SVG; most browsers accept this even on /favicon.ico.
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}


