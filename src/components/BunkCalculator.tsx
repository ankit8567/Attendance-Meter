import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  calculateAttendancePercentage,
  calculateBunksAvailable,
  formatClassesToDays,
} from '../utils/attendanceCalculations';
import { ShieldCheck, AlertTriangle, AlertOctagon, Sparkles } from 'lucide-react';
import { AnkitAvatar } from './AnkitAvatar';

export const BunkCalculator: React.FC = () => {
  const { currentAttended, currentTotal, currentTarget, settings } = useAttendance();
  const [bunkClassesInput, setBunkClassesInput] = useState<number>(settings.classesPerDay || 5);
  const [mode, setMode] = useState<'classes' | 'days'>('classes');

  const classesPerDay = settings.classesPerDay || 5;
  const daysPerWeek = settings.daysPerWeek || 5;

  // Maximum bunks available (Section 8)
  const maxBunksAllowed = calculateBunksAvailable(
    currentAttended,
    currentTotal,
    currentTarget
  );
  const formattedMaxBunks = formatClassesToDays(maxBunksAllowed, classesPerDay);

  // Future calculation for planned bunks (Section 7)
  const actualMissedClasses =
    mode === 'days' ? bunkClassesInput * classesPerDay : bunkClassesInput;

  const futureAttended = currentAttended;
  const futureTotal = currentTotal + actualMissedClasses;
  const futurePercentage = calculateAttendancePercentage(futureAttended, futureTotal);
  const currentPercentage = calculateAttendancePercentage(currentAttended, currentTotal);
  const pctDrop = Math.max(0, currentPercentage - futurePercentage);

  // Status after planned bunking
  let bunkStatus: {
    label: string;
    icon: typeof ShieldCheck;
    color: string;
    bg: string;
    border: string;
    message: string;
  };

  if (futurePercentage >= currentTarget) {
    bunkStatus = {
      label: 'Safe',
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      message: `You will still be above your ${currentTarget}% target with ${futurePercentage.toFixed(
        2
      )}% attendance.`,
    };
  } else if (futurePercentage >= currentTarget - 5) {
    bunkStatus = {
      label: 'Warning',
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      message: `Attendance will drop to ${futurePercentage.toFixed(
        2
      )}%, dangerously close below your ${currentTarget}% requirement.`,
    };
  } else {
    bunkStatus = {
      label: 'Below Target',
      icon: AlertOctagon,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      message: `Critical: Your attendance will fall to ${futurePercentage.toFixed(
        2
      )}%, which is ${(currentTarget - futurePercentage).toFixed(
        2
      )}% below your ${currentTarget}% threshold!`,
    };
  }

  const handleQuickSelect = (type: '1day' | '2days' | '3days' | '1week') => {
    if (type === '1day') {
      setMode('days');
      setBunkClassesInput(1);
    } else if (type === '2days') {
      setMode('days');
      setBunkClassesInput(2);
    } else if (type === '3days') {
      setMode('days');
      setBunkClassesInput(3);
    } else if (type === '1week') {
      setMode('days');
      setBunkClassesInput(daysPerWeek);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 8: BUNKING LIMIT CALCULATOR */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
              Bunking Limit Calculator
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              How Many Classes Can I Bunk?
            </h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Calculates the maximum future classes you can safely miss while keeping attendance at or
          above <strong className="text-slate-700 dark:text-slate-200">{currentTarget}%</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-950/20">
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-300">
              Maximum Safe Bunks
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                {maxBunksAllowed}
              </span>
              <span className="text-xs font-semibold text-indigo-700/70 dark:text-indigo-300/70">
                {maxBunksAllowed === 1 ? 'class' : 'classes'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Based on {classesPerDay} classes/day:
              <br />
              <strong className="text-slate-900 dark:text-white font-medium">
                You can safely miss approximately {formattedMaxBunks.formattedString}.
              </strong>
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Current Attended / Total:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {currentAttended} / {currentTotal} ({currentPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Target Attendance:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {currentTarget}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Classes Per Day:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {classesPerDay} classes/day
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
              Formula: Max Absences <code className="font-mono text-indigo-400">x ≤ (A / p) - T</code>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: CAN I BUNK? */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
        <div className="mb-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            Interactive Test
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Can I Bunk?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test if a planned absence or holiday will keep you safe.
          </p>
        </div>

        {/* Quick presets */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Quick Scenarios:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelect('1day')}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
            >
              1 Day ({classesPerDay} classes)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect('2days')}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
            >
              2 Days ({classesPerDay * 2} classes)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect('3days')}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
            >
              3 Days ({classesPerDay * 3} classes)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect('1week')}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
            >
              1 Week ({classesPerDay * daysPerWeek} classes)
            </button>
          </div>
        </div>

        {/* Input configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Miss Count ({mode === 'days' ? 'Days' : 'Classes'})
            </label>
            <input
              type="number"
              min="1"
              value={bunkClassesInput}
              onChange={(e) => setBunkClassesInput(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Unit
            </label>
            <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium">
              <button
                type="button"
                onClick={() => setMode('classes')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  mode === 'classes'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Classes
              </button>
              <button
                type="button"
                onClick={() => setMode('days')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  mode === 'days'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Days ({classesPerDay}/day)
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic calculation result */}
        <div className={`p-4 rounded-xl border ${bunkStatus.bg} ${bunkStatus.border} transition-all`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <bunkStatus.icon className={`w-5 h-5 ${bunkStatus.color}`} />
              <h4 className={`text-sm font-bold ${bunkStatus.color}`}>{bunkStatus.label}</h4>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400">Future Attendance:</span>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {futurePercentage.toFixed(2)}%
                <span className="text-xs font-medium text-rose-500 ml-1">
                  (-{pctDrop.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{bunkStatus.message}</p>

          <div className="mt-3 pt-3 border-t border-slate-200/40 dark:border-slate-700/40 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Future Attended</span>
              <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {futureAttended}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Future Total</span>
              <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {futureTotal}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Classes Missed</span>
              <p className="font-mono font-semibold text-rose-500">+{actualMissedClasses}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-1 text-center">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 inline-flex items-center gap-1.5 justify-center">
          <AnkitAvatar size={14} showRing={false} />
          <span>Developed By Ankit Srivastava</span>
        </span>
      </div>
    </div>
  );
};
