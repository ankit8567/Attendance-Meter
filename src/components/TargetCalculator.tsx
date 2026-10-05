import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  calculateAttendancePercentage,
  calculateClassesNeeded,
  formatClassesToDays,
} from '../utils/attendanceCalculations';
import { Target, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

export const TargetCalculator: React.FC = () => {
  const { currentAttended, currentTotal, currentTarget, settings } = useAttendance();
  const [selectedTarget, setSelectedTarget] = useState<number>(currentTarget || 75);
  const [customInput, setCustomInput] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);

  const presets = [60, 65, 70, 75, 80, 85, 90];
  const classesPerDay = settings.classesPerDay || 5;

  const activeTarget = isCustom ? parseFloat(customInput) || 75 : selectedTarget;
  const currentPct = calculateAttendancePercentage(currentAttended, currentTotal);

  const classesNeeded = calculateClassesNeeded(currentAttended, currentTotal, activeTarget);
  const formattedNeeded = formatClassesToDays(classesNeeded, classesPerDay);

  const isAlreadyReached = currentPct >= activeTarget;
  const isImpossible = classesNeeded === Infinity;

  // Recovery ratio calculation for visual bar
  const progressRatio = isAlreadyReached
    ? 100
    : Math.min(100, Math.max(0, (currentPct / activeTarget) * 100));

  return (
    <div className="space-y-6">
      {/* SECTION 10: HOW MANY CLASSES DO I NEED? */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
              Target Requirements
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              How Many Classes Do I Need?
            </h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Select or enter your desired target attendance to compute the exact consecutive classes
          you must attend.
        </p>

        {/* Preset Target Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((p) => {
            const isSelected = !isCustom && selectedTarget === p;
            return (
              <button
                key={p}
                onClick={() => {
                  setSelectedTarget(p);
                  setIsCustom(false);
                }}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-semibold font-mono tabular-nums transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p}%
              </button>
            );
          })}

          <button
            onClick={() => setIsCustom(true)}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-semibold transition-all ${
              isCustom
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Custom Target
          </button>
        </div>

        {/* Custom Target Input */}
        {isCustom && (
          <div className="mb-4 max-w-xs">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Percentage (1 - 99%)
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. 78"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Dynamic Calculation Result */}
        {isAlreadyReached ? (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>You have already reached your target!</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Your current attendance is {currentPct.toFixed(1)}%, which exceeds your {activeTarget}%
              goal. Keep attending to build up additional safe bunks!
            </p>
          </div>
        ) : isImpossible ? (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
              <AlertCircle className="w-5 h-5" />
              <span>Mathematically Impossible Target</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              A 100% target cannot be achieved because you have already missed classes ({currentTotal - currentAttended} missed). Try aiming for 90% or 85%.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-50/70 dark:bg-indigo-950/30">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
                  Required Consecutive Classes
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                    {classesNeeded}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    consecutive {classesNeeded === 1 ? 'class' : 'classes'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400">Estimated Days</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-200 mt-1">
                  ~{formattedNeeded.formattedString}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 pt-2.5 border-t border-indigo-500/20">
              You need to attend <strong>{classesNeeded} consecutive classes</strong> without
              missing any to raise your attendance from {currentPct.toFixed(1)}% to {activeTarget}%.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 13: ATTENDANCE RECOVERY PLANNER */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-cyan-600 dark:text-cyan-400">
              Road to Target
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recovery Planner
            </h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-4">
          {/* Visual Progress Bar to Target */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-600 dark:text-slate-400">
                Current: <strong className="text-slate-900 dark:text-white font-mono">{currentPct.toFixed(1)}%</strong>
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                Target: <strong className="text-cyan-500 font-mono">{activeTarget}%</strong>
              </span>
            </div>

            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isAlreadyReached
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-400'
                }`}
                style={{ width: `${progressRatio}%` }}
              />
            </div>
          </div>

          {/* Detailed recovery breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Current</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {currentPct.toFixed(1)}%
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Target</span>
              <p className="text-sm font-bold text-cyan-500 font-mono mt-0.5">
                {activeTarget}%
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Classes Needed</span>
              <p className="text-sm font-bold text-indigo-400 font-mono mt-0.5">
                {classesNeeded === Infinity ? 'N/A' : classesNeeded}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Est. Days</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                {classesNeeded === Infinity ? 'N/A' : formattedNeeded.formattedString}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-1 text-center">
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          Developed By Ankit Srivastava
        </span>
      </div>
    </div>
  );
};
