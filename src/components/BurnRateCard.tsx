import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { calculateBurnRate, calculateAttendancePercentage } from '../utils/attendanceCalculations';
import { Flame, Clock, Calendar } from 'lucide-react';

export const BurnRateCard: React.FC = () => {
  const { currentAttended, currentTotal, currentTarget, settings } = useAttendance();

  const classesPerDay = settings.classesPerDay || 5;
  const daysPerWeek = settings.daysPerWeek || 5;
  const classesPerWeek = classesPerDay * daysPerWeek;

  const currentPct = calculateAttendancePercentage(currentAttended, currentTotal);

  // Accurate mathematical burn rate calculation
  const burn1Class = calculateBurnRate(currentAttended, currentTotal, 1);
  const burn1Day = calculateBurnRate(currentAttended, currentTotal, classesPerDay);
  const burn1Week = calculateBurnRate(currentAttended, currentTotal, classesPerWeek);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-amber-500">
            Attendance Burn Rate
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            How Fast Does Attendance Drop?
          </h3>
        </div>
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Flame className="w-4 h-4" />
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
        Attendance drops non-linearly with each absence based on your current total of{' '}
        <span className="font-mono text-slate-700 dark:text-slate-200">{currentTotal} classes</span>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1 Missed Class */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Missing 1 Class</span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-rose-500 font-mono tabular-nums">
              -{burn1Class.drop.toFixed(2)}%
            </span>
            <span className="text-xs text-slate-400 ml-1">loss</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex justify-between">
            <span>Resulting:</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              {burn1Class.futurePct.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* 1 Missed Day */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Missing 1 Day ({classesPerDay} classes)</span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-rose-500 font-mono tabular-nums">
              -{burn1Day.drop.toFixed(2)}%
            </span>
            <span className="text-xs text-slate-400 ml-1">loss</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex justify-between">
            <span>Resulting:</span>
            <span
              className={`font-mono font-semibold ${
                burn1Day.futurePct < currentTarget ? 'text-rose-400' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {burn1Day.futurePct.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* 1 Missed Week */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Missing 1 Week ({classesPerWeek} classes)</span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold text-rose-500 font-mono tabular-nums">
              -{burn1Week.drop.toFixed(2)}%
            </span>
            <span className="text-xs text-slate-400 ml-1">loss</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex justify-between">
            <span>Resulting:</span>
            <span
              className={`font-mono font-semibold ${
                burn1Week.futurePct < currentTarget ? 'text-rose-400' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {burn1Week.futurePct.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
