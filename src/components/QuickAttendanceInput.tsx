import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Calculator, Check, AlertCircle } from 'lucide-react';

export const QuickAttendanceInput: React.FC = () => {
  const { standalone, updateStandalone, setActiveSource } = useAttendance();

  const [totalStr, setTotalStr] = useState(
    standalone.total > 0 ? standalone.total.toString() : ''
  );
  const [attendedStr, setAttendedStr] = useState(
    standalone.total > 0 ? standalone.attended.toString() : ''
  );
  const [targetStr, setTargetStr] = useState(
    standalone.target ? standalone.target.toString() : '75'
  );
  const [error, setError] = useState<string | null>(null);
  const [justCalculated, setJustCalculated] = useState(false);

  useEffect(() => {
    setTotalStr(standalone.total > 0 ? standalone.total.toString() : '');
    setAttendedStr(standalone.total > 0 ? standalone.attended.toString() : '');
    setTargetStr(standalone.target ? standalone.target.toString() : '75');
  }, [standalone]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const total = parseInt(totalStr.trim(), 10);
    const attended = parseInt(attendedStr.trim(), 10);
    const target = parseFloat(targetStr.trim());

    if (isNaN(total) || isNaN(attended) || isNaN(target)) {
      setError('Please provide valid numbers for all fields.');
      return;
    }

    if (total <= 0) {
      setError('Total classes must be greater than zero.');
      return;
    }

    if (attended < 0) {
      setError('Attended classes cannot be negative.');
      return;
    }

    if (attended > total) {
      setError('Attended classes cannot be greater than total classes.');
      return;
    }

    if (target <= 0 || target > 100) {
      setError('Target percentage must be between 1% and 100%.');
      return;
    }

    updateStandalone({
      total,
      attended,
      target,
    });
    setActiveSource('standalone');
    setJustCalculated(true);
    setTimeout(() => setJustCalculated(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            Direct Calculator
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Enter Attendance
          </h3>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Total Classes
            </label>
            <input
              type="number"
              min="1"
              value={totalStr}
              onChange={(e) => setTotalStr(e.target.value)}
              placeholder="e.g. 200"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Attended Classes
            </label>
            <input
              type="number"
              min="0"
              value={attendedStr}
              onChange={(e) => setAttendedStr(e.target.value)}
              placeholder="e.g. 157"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Attendance (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={targetStr}
              onChange={(e) => setTargetStr(e.target.value)}
              placeholder="e.g. 75"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 shadow-md shadow-indigo-500/20 transition-all duration-150 flex items-center justify-center gap-2 focus-visible:outline-none"
        >
          {justCalculated ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Calculated & Updated Dashboard!</span>
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              <span>Calculate Attendance</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
