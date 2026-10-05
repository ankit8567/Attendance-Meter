import React from 'react';
import { AnkitAvatar } from './AnkitAvatar';

export const Watermark: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`w-full py-4 pb-20 sm:pb-6 text-center select-none ${className}`}
      aria-label="Creator attribution"
    >
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs transition-all shadow-2xs hover:border-indigo-500/30">
        <AnkitAvatar size={18} showRing={false} className="ring-1 ring-indigo-500/40 shadow-xs" />
        <span>Developed By</span>
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          Ankit Srivastava
        </span>
      </div>
    </div>
  );
};
