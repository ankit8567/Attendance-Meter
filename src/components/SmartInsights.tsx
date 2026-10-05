import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { generateSmartInsights } from '../utils/attendanceCalculations';
import { Lightbulb, ChevronRight } from 'lucide-react';

export const SmartInsights: React.FC = () => {
  const { currentAttended, currentTotal, currentTarget, subjects, settings } = useAttendance();

  const insights = generateSmartInsights(
    currentAttended,
    currentTotal,
    currentTarget,
    subjects,
    settings.classesPerDay,
    settings.daysPerWeek
  );

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Smart Insights</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time analytics and tactical suggestions based on your attendance data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
          >
            <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="flex-1">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
