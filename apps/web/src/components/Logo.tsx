"use client";

interface LogoProps {
  className?: string;
  size?: number;
}

export function LogoIcon({ className = "", size = 36 }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role="img"
      aria-label="PitchFire"
      className={className}
    >
      <defs>
        <linearGradient id="li-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#2D1B69" />
        </linearGradient>
        <linearGradient id="li-fo" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#C2410C" />
          <stop offset="35%" stopColor="#EA580C" />
          <stop offset="70%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FCD34D" />
        </linearGradient>
        <linearGradient id="li-fm" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="60%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FACC15" />
        </linearGradient>
        <linearGradient id="li-fc" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#FEF9C3" />
        </linearGradient>
        <radialGradient id="li-glow" cx="50%" cy="95%" r="55%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity=".55" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
        <filter id="li-sg">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="48" height="48" rx="11" fill="url(#li-bg)" />
      <ellipse cx="24" cy="44" rx="16" ry="7" fill="url(#li-glow)" />
      <path
        d="M24,43 C13,43 6,35 6,26 C6,16 12,8 21,5 Q22.5,3.5 24,3 Q25.5,3.5 27,5 C36,8 42,16 42,26 C42,35 35,43 24,43Z"
        fill="url(#li-fo)"
        filter="url(#li-sg)"
      />
      <path
        d="M24,38 C17,37 12,31 12,25 C12,18 17,12 22.5,9.5 Q23.3,9 24,8.5 Q24.7,9 25.5,9.5 C31,12 36,18 36,25 C36,31 31,37 24,38Z"
        fill="url(#li-fm)"
        opacity=".75"
      />
      <path
        d="M24,32 C20,31 17,28 17,25 C17,21 20,17.5 23.5,16 L24,15.5 L24.5,16 C28,17.5 31,21 31,25 C31,28 28,31 24,32Z"
        fill="url(#li-fc)"
        opacity=".6"
      />
      <circle cx="24" cy="4.5" r="1.8" fill="#FEF9C3" opacity=".95" />
    </svg>
  );
}

export function LogoHorizontal({
  className = "",
  height = 40,
}: {
  className?: string;
  height?: number;
}) {
  const scale = height / 64;
  const w = Math.round(380 * scale);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 380 64"
      width={w}
      height={height}
      role="img"
      aria-label="PitchFire"
      className={className}
    >
      <defs>
        <linearGradient id="lh-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#2D1B69" />
        </linearGradient>
        <linearGradient id="lh-fo" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#C2410C" />
          <stop offset="35%" stopColor="#EA580C" />
          <stop offset="70%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FCD34D" />
        </linearGradient>
        <linearGradient id="lh-fm" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="60%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FACC15" />
        </linearGradient>
        <linearGradient id="lh-fc" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#FEF9C3" />
        </linearGradient>
        <radialGradient id="lh-glow" cx="50%" cy="95%" r="55%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity=".5" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform="translate(0,8)">
        <rect width="48" height="48" rx="11" fill="url(#lh-bg)" />
        <ellipse cx="24" cy="44" rx="16" ry="7" fill="url(#lh-glow)" />
        <path
          d="M24,43 C13,43 6,35 6,26 C6,16 12,8 21,5 Q22.5,3.5 24,3 Q25.5,3.5 27,5 C36,8 42,16 42,26 C42,35 35,43 24,43Z"
          fill="url(#lh-fo)"
        />
        <path
          d="M24,38 C17,37 12,31 12,25 C12,18 17,12 22.5,9.5 Q23.3,9 24,8.5 Q24.7,9 25.5,9.5 C31,12 36,18 36,25 C36,31 31,37 24,38Z"
          fill="url(#lh-fm)"
          opacity=".75"
        />
        <path
          d="M24,32 C20,31 17,28 17,25 C17,21 20,17.5 23.5,16 L24,15.5 L24.5,16 C28,17.5 31,21 31,25 C31,28 28,31 24,32Z"
          fill="url(#lh-fc)"
          opacity=".6"
        />
        <circle cx="24" cy="4.5" r="1.8" fill="#FEF9C3" opacity=".95" />
      </g>
      <text
        x="64"
        y="38"
        fontFamily="'Syne', 'Inter', sans-serif"
        fontSize="36"
        fontWeight="800"
        letterSpacing="-1"
        fill="#F8FAFC"
      >
        Pitch<tspan fill="#F97316">Fire</tspan>
      </text>
    </svg>
  );
}
