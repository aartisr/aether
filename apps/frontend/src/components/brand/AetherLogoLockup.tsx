type AetherLogoLockupProps = {
  className?: string;
  idPrefix?: string;
  title?: string;
};

export default function AetherLogoLockup({
  className,
  idPrefix = 'aetherLogo',
  title = 'Aether',
}: AetherLogoLockupProps) {
  const titleId = `${idPrefix}Title`;
  const descId = `${idPrefix}Desc`;
  const ringGradientId = `${idPrefix}RingGradient`;
  const sproutGradientId = `${idPrefix}SproutGradient`;
  const bookGradientId = `${idPrefix}BookGradient`;
  const shadowId = `${idPrefix}SoftShadow`;

  return (
    <svg
      className={className}
      width="1080"
      height="360"
      viewBox="0 0 1080 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
    >
      <title id={titleId}>{title}</title>
      <desc id={descId}>
        A circular resilience emblem with an open book, growing sprout, peer nodes, and the Aether wordmark.
      </desc>
      <defs>
        <linearGradient id={ringGradientId} x1="40" y1="40" x2="320" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgb(var(--theme-primary-rgb))" />
          <stop offset="1" stopColor="rgb(var(--theme-accent-rgb))" />
        </linearGradient>
        <linearGradient id={sproutGradientId} x1="122" y1="152" x2="234" y2="248" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#24c78a" />
          <stop offset="1" stopColor="rgb(var(--theme-primary-rgb))" />
        </linearGradient>
        <linearGradient id={bookGradientId} x1="96" y1="214" x2="264" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgb(255 255 255 / 0.58)" />
          <stop offset="1" stopColor="rgb(var(--theme-primary-rgb) / 0.16)" />
        </linearGradient>
        <filter
          id={shadowId}
          x="20"
          y="20"
          width="320"
          height="320"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="8" />
          <feGaussianBlur stdDeviation="10" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.11 0 0 0 0 0.23 0 0 0 0 0.18 0 0 0 0.18 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_1" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_1" result="shape" />
        </filter>
      </defs>

      <g filter={`url(#${shadowId})`}>
        <circle cx="180" cy="180" r="132" fill="rgb(255 255 255 / 0.26)" />
        <circle cx="180" cy="180" r="124" stroke={`url(#${ringGradientId})`} strokeWidth="14" />

        <path
          d="M96 242C116 220 144 214 176 220V274C145 268 120 269 96 286V242Z"
          fill={`url(#${bookGradientId})`}
          stroke="rgb(var(--theme-primary-rgb) / 0.56)"
          strokeWidth="4"
        />
        <path
          d="M264 242C244 220 216 214 184 220V274C215 268 240 269 264 286V242Z"
          fill={`url(#${bookGradientId})`}
          stroke="rgb(var(--theme-primary-rgb) / 0.56)"
          strokeWidth="4"
        />
        <path d="M180 220V278" stroke="rgb(var(--theme-primary-rgb))" strokeWidth="4" strokeLinecap="round" />

        <path d="M180 218C182 188 194 169 210 154" stroke="#119f76" strokeWidth="7" strokeLinecap="round" />
        <path d="M178 214C175 192 164 176 146 164" stroke="#119f76" strokeWidth="7" strokeLinecap="round" />
        <path
          d="M210 154C212 178 198 195 180 201C183 181 194 166 210 154Z"
          fill={`url(#${sproutGradientId})`}
        />
        <path
          d="M146 164C160 176 168 192 164 208C148 202 139 186 146 164Z"
          fill={`url(#${sproutGradientId})`}
        />

        <path
          d="M88 154C118 129 146 120 180 120C214 120 242 129 272 154"
          stroke="rgb(var(--theme-accent-rgb))"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="1 13"
        />
        <circle cx="92" cy="154" r="9" fill="rgb(var(--theme-accent-rgb))" />
        <circle cx="180" cy="118" r="10" fill="rgb(var(--theme-primary-rgb))" />
        <circle cx="268" cy="154" r="9" fill="rgb(var(--theme-accent-rgb))" />
      </g>

      <g transform="translate(360, 0)">
        <text
          x="0"
          y="170"
          fill="var(--theme-text)"
          fontFamily="Inter, Avenir Next, Segoe UI, sans-serif"
          fontSize="96"
          fontWeight="800"
          letterSpacing="0"
        >
          Aether
        </text>
        <text
          x="2"
          y="218"
          fill="var(--theme-text-muted)"
          fontFamily="Inter, Avenir Next, Segoe UI, sans-serif"
          fontSize="31"
          fontWeight="650"
          letterSpacing="0"
        >
          Student Resilience Ecosystem
        </text>
        <rect x="0" y="242" width="512" height="10" rx="5" fill={`url(#${ringGradientId})`} />
        <text
          x="0"
          y="296"
          fill="var(--theme-text-subtle)"
          fontFamily="Inter, Avenir Next, Segoe UI, sans-serif"
          fontSize="24"
          fontWeight="600"
          letterSpacing="0"
        >
          Privacy-first | Research-driven | Peer-powered
        </text>
      </g>
    </svg>
  );
}
