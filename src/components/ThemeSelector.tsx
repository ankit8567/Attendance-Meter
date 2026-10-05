import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Moon, Sun, Laptop } from 'lucide-react';

export const ThemeSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { settings, updateSettings } = useAttendance();

  const options: { id: 'dark' | 'light' | 'system'; label: string; icon: typeof Moon }[] = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'system', label: 'System', icon: Laptop },
  ];

  if (compact) {
    return (
      <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = settings.theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => updateSettings({ theme: opt.id })}
              className={`p-1.5 rounded-md transition-all ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={`${opt.label} Theme`}
              aria-label={`Switch to ${opt.label} theme`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = settings.theme === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => updateSettings({ theme: opt.id })}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              isSelected
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
