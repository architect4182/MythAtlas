'use client';

export default function MythLogo({ size = 32, className = '', variant = 'seal' }) {
  if (variant === 'monochrome') {
    return (
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className={className}
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        {/* Archival Concentric Rings */}
        <circle cx="32" cy="32" r="30" strokeWidth="1.2" />
        <circle cx="32" cy="32" r="27" strokeWidth="0.8" strokeDasharray="1.5 2" />

        {/* Cardinal Astrolabe Pips */}
        <path d="M32 4.5 L33 6.5 L32 7.5 L31 6.5 Z" fill="currentColor" stroke="none" />
        <path d="M32 59.5 L33 57.5 L32 56.5 L31 57.5 Z" fill="currentColor" stroke="none" />
        <path d="M4.5 32 L6.5 33 L7.5 32 L6.5 31 Z" fill="currentColor" stroke="none" />
        <path d="M59.5 32 L57.5 33 L56.5 32 L57.5 31 Z" fill="currentColor" stroke="none" />

        {/* Phoenix Wings & Flame Plume */}
        <path
          d="M30 23.5 C26 21 19 19 13 17.5 C16 20.5 18 21.5 15.5 22.5 C18.5 24.5 20.5 25.5 17.5 27 C21 28 25 28 29.5 26 Z"
          fill="currentColor"
          stroke="none"
        />
        <path
          d="M34 23.5 C38 21 45 19 51 17.5 C48 20.5 46 21.5 48.5 22.5 C45.5 24.5 43.5 25.5 46.5 27 C43 28 39 28 34.5 26 Z"
          fill="currentColor"
          stroke="none"
        />
        <path
          d="M32 17 C30.5 14 29 11.5 31.5 8.5 C33 11 34 12.5 35.5 13.5 C37 11.5 38.5 11 39 12.8 C39.5 14.8 37 16.5 35.5 17 Z"
          fill="currentColor"
          stroke="none"
        />
        <path d="M31 16.5 L36.5 15.5 L34 18.5 Z" fill="currentColor" stroke="none" />

        {/* Kraken Tentacles */}
        <path
          d="M31 49 C24 53 14 50 12.5 41 C11.5 35 17 33 20.5 35.5 C22.5 37 21.5 40 18.5 39 C16 38 14.5 41 16 43.5 C18 46.5 24 47.5 30 44.5 Z"
          fill="currentColor"
          stroke="none"
        />
        <path
          d="M33 49 C40 53 50 50 51.5 41 C52.5 35 47 33 43.5 35.5 C41.5 37 42.5 40 45.5 39 C48 38 49.5 41 48 43.5 C46 46.5 40 47.5 34 44.5 Z"
          fill="currentColor"
          stroke="none"
        />

        {/* Center Compass Star */}
        <polygon points="32,23 33.5,30.5 32,32 30.5,30.5" fill="currentColor" stroke="none" />
        <polygon points="32,41 33.5,33.5 32,32 30.5,33.5" fill="currentColor" stroke="none" />
        <polygon points="41,32 33.5,33.5 32,32 33.5,30.5" fill="currentColor" stroke="none" />
        <polygon points="23,32 30.5,33.5 32,32 30.5,30.5" fill="currentColor" stroke="none" />
        <circle cx="32" cy="32" r="2" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ml-sealGrad" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#c96637" />
          <stop offset="65%" stopColor="#b4532a" />
          <stop offset="100%" stopColor="#8a3717" />
        </radialGradient>
        <linearGradient id="ml-goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f8f2e6" />
          <stop offset="100%" stopColor="#e2d2ba" />
        </linearGradient>
        <linearGradient id="ml-goldShadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ecd9bd" />
          <stop offset="100%" stopColor="#c4af91" />
        </linearGradient>
        <filter id="ml-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#241c14" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Terracotta Seal Base */}
      <circle cx="32" cy="32" r="30" fill="url(#ml-sealGrad)" filter="url(#ml-shadow)" />

      {/* Concentric Double Border Rings */}
      <circle cx="32" cy="32" r="28" stroke="#f8f2e6" strokeWidth="0.75" strokeOpacity="0.5" />
      <circle cx="32" cy="32" r="26.5" stroke="#f8f2e6" strokeWidth="1.3" />
      <circle cx="32" cy="32" r="24.5" stroke="#f8f2e6" strokeWidth="0.75" strokeDasharray="1.5 2.2" strokeOpacity="0.85" />

      {/* Cardinal Dial Diamond Points */}
      <path d="M32 6.5 L33.2 8.5 L32 9.5 L30.8 8.5 Z" fill="#f8f2e6" />
      <path d="M32 57.5 L33.2 55.5 L32 54.5 L30.8 55.5 Z" fill="#f8f2e6" />
      <path d="M6.5 32 L8.5 33.2 L9.5 32 L8.5 30.8 Z" fill="#f8f2e6" />
      <path d="M57.5 32 L55.5 33.2 L54.5 32 L55.5 30.8 Z" fill="#f8f2e6" />

      {/* Diagonal Pips */}
      <circle cx="14" cy="14" r="0.9" fill="#f8f2e6" opacity="0.8" />
      <circle cx="50" cy="14" r="0.9" fill="#f8f2e6" opacity="0.8" />
      <circle cx="14" cy="50" r="0.9" fill="#f8f2e6" opacity="0.8" />
      <circle cx="50" cy="50" r="0.9" fill="#f8f2e6" opacity="0.8" />

      {/* Phoenix Sky/Fire */}
      <path
        d="M30 23.5 C26 21 19 19 13 17.5 C16 20.5 18 21.5 15.5 22.5 C18.5 24.5 20.5 25.5 17.5 27 C21 28 25 28 29.5 26 Z"
        fill="url(#ml-goldLight)"
      />
      <path
        d="M34 23.5 C38 21 45 19 51 17.5 C48 20.5 46 21.5 48.5 22.5 C45.5 24.5 43.5 25.5 46.5 27 C43 28 39 28 34.5 26 Z"
        fill="url(#ml-goldLight)"
      />
      <path
        d="M32 17 C30.5 14 29 11.5 31.5 8.5 C33 11 34 12.5 35.5 13.5 C37 11.5 38.5 11 39 12.8 C39.5 14.8 37 16.5 35.5 17 Z"
        fill="url(#ml-goldLight)"
      />
      <path d="M31 16.5 L36.5 15.5 L34 18.5 Z" fill="#ffffff" />
      <circle cx="33.2" cy="16.2" r="0.65" fill="#8a3717" />

      {/* Kraken Ocean/Deep */}
      <path
        d="M31 49 C24 53 14 50 12.5 41 C11.5 35 17 33 20.5 35.5 C22.5 37 21.5 40 18.5 39 C16 38 14.5 41 16 43.5 C18 46.5 24 47.5 30 44.5 Z"
        fill="url(#ml-goldLight)"
      />
      <circle cx="13.5" cy="45" r="0.8" fill="#8a3717" opacity="0.75" />
      <circle cx="12.2" cy="40.5" r="0.8" fill="#8a3717" opacity="0.75" />
      <circle cx="14" cy="36" r="0.8" fill="#8a3717" opacity="0.75" />

      <path
        d="M33 49 C40 53 50 50 51.5 41 C52.5 35 47 33 43.5 35.5 C41.5 37 42.5 40 45.5 39 C48 38 49.5 41 48 43.5 C46 46.5 40 47.5 34 44.5 Z"
        fill="url(#ml-goldLight)"
      />
      <circle cx="50.5" cy="45" r="0.8" fill="#8a3717" opacity="0.75" />
      <circle cx="51.8" cy="40.5" r="0.8" fill="#8a3717" opacity="0.75" />
      <circle cx="50" cy="36" r="0.8" fill="#8a3717" opacity="0.75" />

      <path d="M29.5 45.5 C31 48.5 33 48.5 34.5 45.5 C33.5 46.8 30.5 46.8 29.5 45.5 Z" fill="url(#ml-goldShadow)" />

      {/* Faceted Compass Rose Star */}
      <polygon points="32,22.5 32,32 30.2,30.2" fill="url(#ml-goldShadow)" />
      <polygon points="32,22.5 33.8,30.2 32,32" fill="url(#ml-goldLight)" />
      <polygon points="32,41.5 30.2,33.8 32,32" fill="url(#ml-goldLight)" />
      <polygon points="32,41.5 32,32 33.8,33.8" fill="url(#ml-goldShadow)" />
      <polygon points="41.5,32 33.8,30.2 32,32" fill="url(#ml-goldShadow)" />
      <polygon points="41.5,32 32,32 33.8,33.8" fill="url(#ml-goldLight)" />
      <polygon points="22.5,32 32,32 30.2,30.2" fill="url(#ml-goldLight)" />
      <polygon points="22.5,32 30.2,33.8 32,32" fill="url(#ml-goldShadow)" />

      <polygon points="38.5,25.5 32,32 33.5,29.5" fill="url(#ml-goldLight)" />
      <polygon points="38.5,25.5 34.5,30.5 32,32" fill="url(#ml-goldShadow)" />
      <polygon points="25.5,25.5 30.5,29.5 32,32" fill="url(#ml-goldLight)" />
      <polygon points="25.5,25.5 32,32 29.5,30.5" fill="url(#ml-goldShadow)" />
      <polygon points="38.5,38.5 34.5,33.5 32,32" fill="url(#ml-goldLight)" />
      <polygon points="38.5,38.5 32,32 33.5,34.5" fill="url(#ml-goldShadow)" />
      <polygon points="25.5,38.5 32,32 30.5,34.5" fill="url(#ml-goldLight)" />
      <polygon points="25.5,38.5 29.5,33.5 32,32" fill="url(#ml-goldShadow)" />

      {/* Astrolabe Core */}
      <circle cx="32" cy="32" r="2.4" fill="#ffffff" />
      <circle cx="32" cy="32" r="1.4" fill="#b4532a" />
      <circle cx="32" cy="32" r="0.6" fill="#f8f2e6" />
    </svg>
  );
}

