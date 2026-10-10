import type { ReactNode } from "react";

/**
 * Back view of a tee or hoodie, drawn as SVG and tinted with the fabric colour.
 * `children` is drawn on top of the back (the print). The print area is the same in both garments' coordinate
 * space so the artwork can be placed with one rectangle: see PRINT_AREA.
 * When real blank product photos exist they replace this file; keep the print rectangle in sync with Gelato's.
 */
export const PRINT_AREA = {
  hoodie: { x: 128, y: 178, w: 144, h: 192 },
  tee: { x: 128, y: 150, w: 144, h: 192 },
} as const;

const SHADE = "rgba(0,0,0,.14)";

export default function GarmentBack({ kind, color, children }: { kind: "tee" | "hoodie"; color: string; children?: ReactNode }) {
  const id = `g-${kind}`;
  return (
    <svg viewBox="0 0 400 480" role="img" aria-label={`${kind === "tee" ? "T-shirt" : "Hoodie"} seen from the back`} className="garment">
      <defs>
        <linearGradient id={`${id}-light`} gradientUnits="userSpaceOnUse" x1="30" x2="370" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".22" />
          <stop offset=".28" stopColor="#fff" stopOpacity=".06" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".1" />
          <stop offset=".78" stopColor="#000" stopOpacity=".04" />
          <stop offset="1" stopColor="#000" stopOpacity=".26" />
        </linearGradient>
        <linearGradient id={`${id}-fall`} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="110" y2="450">
          <stop offset="0" stopColor="#fff" stopOpacity=".07" />
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".2" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-10%" y="-10%" width="120%" height="125%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#000" floodOpacity=".45" />
        </filter>
      </defs>

      {kind === "hoodie" ? (
        <g filter={`url(#${id}-shadow)`}>
          {/* sleeves */}
          <path d="M120 130 L58 152 L34 330 L34 398 L88 404 L102 322 L124 236 Z" fill={color} className="garment__fabric" />
          <path d="M280 130 L342 152 L366 330 L366 398 L312 404 L298 322 L276 236 Z" fill={color} className="garment__fabric" />
          {/* body + waistband */}
          <path d="M120 124 C160 110 240 110 280 124 L294 236 L298 414 L102 414 L106 236 Z" fill={color} className="garment__fabric" />
          <path d="M100 410 L300 410 L304 446 C250 454 150 454 96 446 Z" fill={color} className="garment__fabric" />
          {/* cuffs */}
          <path d="M34 392 L88 400 L86 432 C66 438 46 436 32 428 Z" fill={color} className="garment__fabric" />
          <path d="M366 392 L312 400 L314 432 C334 438 354 436 368 428 Z" fill={color} className="garment__fabric" />
          {/* hood, seen from behind */}
          <path d="M138 128 C140 56 260 56 262 128 C246 146 154 146 138 128 Z" fill={color} className="garment__fabric" />
          <path d="M150 128 C156 84 244 84 250 128 C236 138 164 138 150 128 Z" fill="#000" opacity=".12" />
          <g fill="url(#g-hoodie-light)"><path d="M120 124 C160 110 240 110 280 124 L294 236 L298 414 L102 414 L106 236 Z" /><path d="M120 130 L58 152 L34 330 L34 398 L88 404 L102 322 L124 236 Z" /><path d="M280 130 L342 152 L366 330 L366 398 L312 404 L298 322 L276 236 Z" /></g>
          <path d="M100 410 L300 410 L304 446 C250 454 150 454 96 446 Z" fill="url(#g-hoodie-fall)" />
          <path d="M120 124 L106 236 M280 124 L294 236 M200 150 L200 410" stroke={SHADE} strokeWidth="1.6" fill="none" />
        </g>
      ) : (
        <g filter={`url(#${id}-shadow)`}>
          <path d="M106 122 L150 108 C180 120 220 120 250 108 L294 122 L356 176 L322 226 L288 202 L288 410 L112 410 L112 202 L78 226 L44 176 Z" fill={color} className="garment__fabric" />
          <path d="M106 122 L150 108 C180 120 220 120 250 108 L294 122 L356 176 L322 226 L288 202 L288 410 L112 410 L112 202 L78 226 L44 176 Z" fill="url(#g-tee-light)" />
          <path d="M106 122 L150 108 C180 120 220 120 250 108 L294 122 L356 176 L322 226 L288 202 L288 410 L112 410 L112 202 L78 226 L44 176 Z" fill="url(#g-tee-fall)" />
          <path d="M150 108 C180 126 220 126 250 108" stroke={SHADE} strokeWidth="5" fill="none" />
          <path d="M112 202 L106 122 M288 202 L294 122 M112 404 L288 404" stroke={SHADE} strokeWidth="1.6" fill="none" />
        </g>
      )}
      {children}
    </svg>
  );
}
