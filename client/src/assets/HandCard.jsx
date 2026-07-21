// Signature illustration for the hero: a hand presenting a card, rendered
// as a single-line editorial sketch in the brand's maroon/gold palette.
// Stands in for a real product photo (e.g. assets/hand.png) until one exists.
export default function HandCard({ className = "" }) {
  return (
    <svg viewBox="0 0 420 420" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4A0A1C" />
          <stop offset="100%" stopColor="#22040D" />
        </linearGradient>
      </defs>

      {/* ambient ring, echoes the brand's compass motif */}
      <circle cx="210" cy="210" r="185" fill="none" stroke="#8B1538" strokeOpacity="0.12" strokeDasharray="2 10" strokeLinecap="round" />

      {/* back card, tilted */}
      <g transform="translate(150,120) rotate(-8)">
        <rect x="0" y="0" width="230" height="146" rx="16" fill="url(#cardGrad)" />
        <rect x="20" y="26" width="34" height="26" rx="5" fill="#B8892E" fillOpacity="0.85" />
      </g>

      {/* front card, tilted the other way */}
      <g transform="translate(118,150) rotate(6)">
        <rect x="0" y="0" width="230" height="146" rx="16" fill="#8B1538" />
        <rect x="20" y="26" width="34" height="26" rx="5" fill="#D2A554" />
        <text x="20" y="112" fontFamily="Fraunces, serif" fontSize="18" fill="#F7F4EF">4241 •••• ••••</text>
      </g>

      {/* hand — simplified, cupped beneath the cards */}
      <path
        d="M96,300
           C96,278 108,264 122,262
           L122,232 a10,10 0 0 1 20,0 v30
           M152,260 v-40 a10,10 0 0 1 20,0 v40
           M182,260 v-34 a10,10 0 0 1 20,0 v36
           M212,262 v-24 a9,9 0 0 1 18,0 v28
           C244,268 258,282 258,306
           L258,340 a18,18 0 0 1 -18,18 L120,358
           a24,24 0 0 1 -24,-24 Z"
        fill="none"
        stroke="#221016"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}
