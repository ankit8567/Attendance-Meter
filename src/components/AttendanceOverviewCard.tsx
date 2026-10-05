import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { ProgressRing } from './ProgressRing';
import { getAttendanceStatus } from '../utils/attendanceCalculations';
import { CheckCircle2, AlertTriangle, AlertCircle, ArrowUpRight, Layers } from 'lucide-react';

interface AttendanceOverviewCardProps {
  onOpenBunkModal?: () => void;
  onOpenTargetModal?: () => void;
}

export const AttendanceOverviewCard: React.FC<AttendanceOverviewCardProps> = ({
  onOpenBunkModal,
  onOpenTargetModal,
}) => {
  const {
    currentAttended,
    currentTotal,
    currentTarget,
    currentPercentage,
    currentAbsent,
    activeSource,
    setActiveSource,
    subjects,
    settings,
  } = useAttendance();

  const status = getAttendanceStatus(
    currentPercentage,
    currentTarget,
    currentAttended,
    currentTotal,
    settings.classesPerDay
  );

  const StatusIcon =
    status.category === 'safe'
      ? CheckCircle2
      : status.category === 'warning'
      ? AlertTriangle
      : AlertCircle;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm transition-all">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Source Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            Attendance Overview
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            Your Attendance Command Center
          </h2>
        </div>

        {/* Source Segmented Control */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-medium self-start sm:self-auto border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setActiveSource('subjects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeSource === 'subjects'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>My Subjects ({subjects.length})</span>
          </button>
          <button
            onClick={() => setActiveSource('standalone')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSource === 'standalone'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Quick Calculator
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        {/* Circular Progress Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center py-2">
          <ProgressRing
            percentage={currentPercentage}
            target={currentTarget}
            size={220}
            strokeWidth={16}
          />
        </div>

        {/* Numbers & Breakdown */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-4">
          {/* Status Banner */}
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border ${status.bgClass} ${status.borderClass}`}
          >
            <StatusIcon className={`w-5 h-5 shrink-0 mt-0.5 ${status.colorClass}`} />
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`text-sm font-bold ${status.colorClass}`}>{status.title}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${status.badgeBg}`}>
                  {currentPercentage >= currentTarget ? 'ON TRACK' : 'ACTION REQUIRED'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {status.message}
              </p>
            </div>
          </div>

          {/* Key Counter Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Attended
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                {currentAttended}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Present</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Total Classes
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                {currentTotal}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Conducted</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Absent
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                {currentAbsent}
              </div>
              <span className="text-[11px] text-rose-500 dark:text-rose-400">Missed</span>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            {onOpenBunkModal && (
              <button
                onClick={onOpenBunkModal}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm transition-all focus-visible:outline-none"
              >
                <span>Can I Bunk?</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onOpenTargetModal && (
              <button
                onClick={onOpenTargetModal}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg transition-all focus-visible:outline-none"
              >
                Target Calculator
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
