import React from 'react';
import { Subject } from '../types/attendance';
import {
  calculateAttendancePercentage,
  calculateBunksAvailable,
  calculateClassesNeeded,
} from '../utils/attendanceCalculations';
import { Check, X, MoreVertical, Edit2, Trash2, ExternalLink } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  onIncrement: (id: string, type: 'present' | 'absent') => void;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
  onViewDetails: (subject: Subject) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  onIncrement,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const pct = calculateAttendancePercentage(subject.attended, subject.total);
  const bunks = calculateBunksAvailable(subject.attended, subject.total, subject.target);
  const needed = calculateClassesNeeded(subject.attended, subject.total, subject.target);

  const isSafe = pct >= subject.target;
  const isWarning = !isSafe && pct >= subject.target - 5;

  let statusBadgeClass = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  let progressFillClass = 'bg-emerald-500';
  if (!isSafe && isWarning) {
    statusBadgeClass = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    progressFillClass = 'bg-amber-500';
  } else if (!isSafe) {
    statusBadgeClass = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    progressFillClass = 'bg-rose-500';
  }

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition-all">
      {/* Top row: Subject name, code, status & menu */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: subject.color || '#6366f1' }}
            />
            <h4
              onClick={() => onViewDetails(subject)}
              className="font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-indigo-500 transition-colors"
              title={subject.name}
            >
              {subject.name}
            </h4>
          </div>
          {subject.code && (
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 block">
              {subject.code}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border font-mono tabular-nums ${statusBadgeClass}`}
          >
            {isSafe ? 'SAFE' : isWarning ? 'WARNING' : 'CRITICAL'}
          </span>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Subject actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-30 w-36 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl text-xs">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onViewDetails(subject);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Analysis</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(subject);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Subject</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(subject.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-500 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Percentage & Progress Bar */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
              {pct.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({subject.attended}/{subject.total})
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Target: <strong className="text-slate-700 dark:text-slate-200">{subject.target}%</strong>
          </span>
        </div>

        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressFillClass}`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>

      {/* Metrics Row: Safe Bunks / Classes Needed */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-4 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">
            Bunks Left
          </span>
          <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {bunks > 0 ? (
              <span className="text-emerald-500">{bunks} classes</span>
            ) : (
              <span className="text-rose-400">0 classes</span>
            )}
          </p>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">
            Need for Target
          </span>
          <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {needed > 0 ? (
              <span className="text-indigo-400">{needed} classes</span>
            ) : (
              <span className="text-emerald-500">Target Met</span>
            )}
          </p>
        </div>
      </div>

      {/* Quick Attendance Logging Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={() => onIncrement(subject.id, 'present')}
          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 rounded-xl border border-emerald-500/20 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          <span>+ Present</span>
        </button>

        <button
          onClick={() => onIncrement(subject.id, 'absent')}
          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 rounded-xl border border-rose-500/20 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>+ Absent</span>
        </button>
      </div>
    </div>
  );
};
