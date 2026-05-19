/**
 * CrescentLogo
 * - "I" harfi oydan 15px o'ngga surilgan va aniq ko'rinadi
 * - "T" harfi "I" ga juda yaqin joylashtirildi (jips)
 * - 3D linear gradient va ko'rinish
 */
const CrescentLogo = ({ size = 52 }) => {
  return (
    <svg
      width={size * 2.2}
      height={size}
      viewBox="0 0 110 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Oy 3D gradient */}
        <linearGradient id="moonFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#93c5fd" />
          <stop offset="45%"  stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        {/* Oy yuqori highlight */}
        <linearGradient id="moonHL" x1="0%" y1="0%" x2="50%" y2="80%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* "I" harfi gradient */}
        <linearGradient id="iFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.9" />
        </linearGradient>

        {/* "T" harfi gradient */}
        <linearGradient id="tFill" x1="0%" y1="0%" x2="30%" y2="100%">
          <stop offset="0%"   stopColor="#a5b4fc" />
          <stop offset="40%"  stopColor="#6366f1" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>

        {/* Crescent mask */}
        <mask id="cMask">
          <circle cx="25" cy="25" r="23" fill="white" />
          <circle cx="35.5" cy="20" r="20" fill="black" />
        </mask>

        {/* Soya effekti */}
        <filter id="shadow">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* ===== OY ===== */}
      <g filter="url(#shadow)">
        <circle cx="25" cy="25" r="23" fill="url(#moonFill)" mask="url(#cMask)" />
        <circle cx="25" cy="25" r="23" fill="url(#moonHL)" mask="url(#cMask)" />
      </g>

      {/* ===== "I" — oydan 15px surilgan (x=30) ===== */}
      <g filter="url(#shadow)">
        <rect x="28"  y="13"  width="10" height="3"   rx="1.5" fill="url(#iFill)" />
        <rect x="31.5" y="13" width="3"  height="23.5" rx="1.5" fill="url(#iFill)" />
        <rect x="28"  y="33.5" width="10" height="3"   rx="1.5" fill="url(#iFill)" />
      </g>

      {/* ===== "T" — I ga yaqinlashtirildi (x=42) ===== */}
      <g filter="url(#shadow)">
        <rect x="42" y="12"  width="24" height="5.5" rx="2.5" fill="url(#tFill)" />
        <rect x="51.25" y="12"  width="5.5" height="27" rx="2.5" fill="url(#tFill)" />
      </g>
    </svg>
  );
};

export default CrescentLogo;
