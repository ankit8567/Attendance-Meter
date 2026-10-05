import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { calculateBurnRate, calculateAttendancePercentage } from '../utils/attendanceCalculations';
import { Plane, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

export const WeeklyBunkCard: React.FC = () => {
  const { currentAttended, currentTotal, currentTarget, settings } = useAttendance();

  const [classesPerDay, setClassesPerDay] = useState<number>(settings.classesPerDay || 5);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(settings.daysPerWeek || 5);

  const totalWeekClasses = classesPerDay * daysPerWeek;
  const currentPct = calculateAttendancePercentage(currentAttended, currentTotal);

  const burnResult = calculateBurnRate(currentAttended, currentTotal, totalWeekClasses);
  const isBelowTarget = burnResult.futurePct < currentTarget;
  const isWarning = !isBelowTarget && burnResult.futurePct < currentTarget + 3;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-purple-600 dark:text-purple-400">
            Weekly Bunk Simulator
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            What If I Skip College for a Week?
          </h3>
        </div>
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
          <Plane className="w-4 h-4" />
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Planning a trip or exam break? See how skipping all classes for 1 full week impacts your standing.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Classes Per Day
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={classesPerDay}
            onChange={(e) => setClassesPerDay(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            College Days Per Week
          </label>
          <input
            type="number"
            min="1"
            max="7"
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Comparison Display */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          isBelowTarget
            ? 'border-rose-500/30 bg-rose-500/10'
            : isWarning
            ? 'border-amber-500/30 bg-amber-500/10'
            : 'border-emerald-500/30 bg-emerald-500/10'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Before</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {currentPct.toFixed(1)}%
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium">
                After Skipping Week
              </span>
              <div
                className={`text-xl font-bold font-mono ${
                  isBelowTarget
                    ? 'text-rose-400'
                    : isWarning
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {burnResult.futurePct.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400">Total Classes Missed:</span>
            <div className="text-sm font-bold text-rose-500 font-mono">
              -{totalWeekClasses} classes (-{burnResult.drop.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Warning or Safe Banner */}
        <div className="mt-3 pt-3 border-t border-slate-200/40 dark:border-slate-700/40 flex items-center gap-2">
          {isBelowTarget ? (
            <>
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-xs text-rose-600 dark:text-rose-300 font-medium">
                Warning: Skipping this week will drop you {(currentTarget - burnResult.futurePct).toFixed(
                  1
                )}% below your {currentTarget}% target!
              </p>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-600 dark:text-emerald-300 font-medium">
                You can safely take this week off and still remain above your {currentTarget}% target.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
