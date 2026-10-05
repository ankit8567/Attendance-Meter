import React, { useState } from 'react';

interface AnkitAvatarProps {
  size?: number; // size in px, default 20
  className?: string;
  showRing?: boolean;
  src?: string;
}

export const AnkitAvatar: React.FC<AnkitAvatarProps> = ({
  size = 20,
  className = '',
  showRing = true,
  src,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden select-none ${
        showRing ? 'ring-1 ring-indigo-500/40 shadow-xs' : ''
      } ${className}`}
      style={{ width: size, height: size }}
      title="Ankit Srivastava - Developer"
      aria-label="Ankit Srivastava avatar"
    >
      {src && !imgError ? (
        <img
          src={src}
          alt="Ankit Srivastava"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-top"
          referrerPolicy="no-referrer"
        />
      ) : (
        /* Signature Vector Portrait Avatar of Ankit Srivastava */
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Studio Blue Gradient Backdrop */}
            <linearGradient id="ankit-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="60%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            {/* Suit Navy Gradient */}
            <linearGradient id="suit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect width="100" height="100" fill="url(#ankit-bg)" />

          {/* Suit Jacket Shoulders */}
          <path
            d="M 12 100 L 22 72 L 38 68 L 50 82 L 62 68 L 78 72 L 88 100 Z"
            fill="url(#suit-grad)"
          />

          {/* White Dress Shirt V-Neck Collar */}
          <polygon points="38,68 50,88 62,68 56,64 44,64" fill="#ffffff" />
          <polygon points="46,65 50,78 54,65" fill="#f8fafc" />

          {/* Neck */}
          <rect x="43" y="52" width="14" height="18" fill="#d49b5c" rx="2" />

          {/* Head / Face */}
          <ellipse cx="50" cy="42" rx="17" ry="21" fill="#e0ac69" />

          {/* Hair */}
          <path
            d="M 31 38 C 30 24, 40 16, 50 16 C 60 16, 70 24, 69 38 C 67 27, 58 20, 50 20 C 40 20, 33 27, 31 38 Z"
            fill="#1c1917"
          />
          <path
            d="M 33 34 C 36 22, 48 18, 64 22 C 67 24, 66 30, 68 35 C 64 27, 54 22, 42 24 C 36 25, 34 29, 33 34 Z"
            fill="#171717"
          />

          {/* Ears */}
          <ellipse cx="32" cy="44" rx="2.5" ry="5" fill="#d49b5c" />
          <ellipse cx="68" cy="44" rx="2.5" ry="5" fill="#d49b5c" />

          {/* Eyebrows */}
          <path d="M 39 34 Q 44 32 48 34" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 52 34 Q 56 32 61 34" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Eyes */}
          <ellipse cx="43.5" cy="38" rx="2.5" ry="1.5" fill="#292524" />
          <ellipse cx="56.5" cy="38" rx="2.5" ry="1.5" fill="#292524" />
          <circle cx="44" cy="37.5" r="0.8" fill="#ffffff" />
          <circle cx="57" cy="37.5" r="0.8" fill="#ffffff" />

          {/* Nose */}
          <path d="M 50 38 L 50 47 L 53 47" stroke="#b45309" strokeWidth="1.2" fill="none" strokeLinecap="round" />

          {/* Signature Mustache */}
          <path
            d="M 43 51 Q 47 49 50 51 Q 53 49 57 51 Q 54 54 50 52 Q 46 54 43 51 Z"
            fill="#1c1917"
          />

          {/* Lips */}
          <path d="M 46 55 Q 50 56.5 54 55" stroke="#b91c1c" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />

          {/* Suit Collar Lapels */}
          <polygon points="35,69 46,92 41,92 28,74" fill="#0f172a" />
          <polygon points="65,69 54,92 59,92 72,74" fill="#0f172a" />
        </svg>
      )}
    </div>
  );
};
