import React from 'react';

interface ProgressRingProps {
  percentage: number;
  target?: number;
  size?: number;
  strokeWidth?: number;
  showDetails?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  target = 75,
  size = 220,
  strokeWidth = 14,
  showDetails = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  // Color logic
  let strokeColor = '#10b981'; // emerald-500
  let gradientId = 'ring-safe';

  if (clampedPct < target - 5) {
    strokeColor = '#f43f5e'; // rose-500
    gradientId = 'ring-critical';
  } else if (clampedPct < target) {
    strokeColor = '#f59e0b'; // amber-500
    gradientId = 'ring-warning';
  }

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 origin-center"
      >
        <defs>
          <linearGradient id="ring-safe" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="ring-warning" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="ring-critical" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>

        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-200 dark:text-slate-800/80 transition-colors duration-300"
        />

        {/* Target marker notch if provided */}
        {target > 0 && target <= 100 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth + 2}
            fill="transparent"
            strokeDasharray={`2 ${circumference - 2}`}
            strokeDashoffset={circumference - (target / 100) * circumference}
            className="text-indigo-400 dark:text-indigo-400 opacity-60"
          >
            <title>{`Target: ${target}%`}</title>
          </circle>
        )}

        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-4">
        {showDetails && (
          <span className="text-[11px] font-medium tracking-wider uppercase text-slate-400 dark:text-slate-500">
            Current
          </span>
        )}
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            {clampedPct.toFixed(1)}
          </span>
          <span className="text-lg font-bold text-slate-500 dark:text-slate-400 ml-0.5">%</span>
        </div>
        {showDetails && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Target:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
              {target}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
