import React from 'react';

export const Watermark: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`w-full py-4 text-center select-none ${className}`}
      aria-label="Creator attribution"
    >
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 transition-colors">
        <span>Developed By</span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          Ankit Srivastava
        </span>
      </div>
    </div>
  );
};
