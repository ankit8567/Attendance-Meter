import React, { useState } from 'react';
import { Subject } from '../types/attendance';
import { useAttendance } from '../context/AttendanceContext';
import {
  calculateAttendancePercentage,
  calculateBunksAvailable,
  calculateClassesNeeded,
  calculateBurnRate,
  getAttendanceStatus,
} from '../utils/attendanceCalculations';
import { X, Check, Flame, Target, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SubjectModalProps {
  subject: Subject | null;
  onClose: () => void;
  onEdit: (subject: Subject) => void;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({ subject, onClose, onEdit }) => {
  const { incrementSubjectAttendance, settings } = useAttendance();
  const [bunkTestCount, setBunkTestCount] = useState<number>(1);

  if (!subject) return null;

  const pct = calculateAttendancePercentage(subject.attended, subject.total);
  const bunks = calculateBunksAvailable(subject.attended, subject.total, subject.target);
  const needed = calculateClassesNeeded(subject.attended, subject.total, subject.target);
  const status = getAttendanceStatus(pct, subject.target, subject.attended, subject.total, settings.classesPerDay);
  const burn = calculateBurnRate(subject.attended, subject.total, 1);

  // Subject-level bunk test
  const futureAttended = subject.attended;
  const futureTotal = subject.total + bunkTestCount;
  const futurePct = calculateAttendancePercentage(futureAttended, futureTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: subject.color || '#6366f1' }}
            />
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{subject.name}</h3>
              {subject.code && (
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {subject.code}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onClose();
                onEdit(subject);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Main Attendance Status Banner */}
          <div className={`p-4 rounded-xl border ${status.bgClass} ${status.borderClass}`}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Current Attendance
              </span>
              <span className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
                {pct.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{status.message}</p>
          </div>

          {/* Quick Counter Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-400 text-[10px] uppercase font-medium">Attended</span>
              <p className="text-lg font-bold font-mono text-emerald-500 mt-0.5">
                {subject.attended}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-400 text-[10px] uppercase font-medium">Total</span>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                {subject.total}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-400 text-[10px] uppercase font-medium">Target</span>
              <p className="text-lg font-bold font-mono text-indigo-400 mt-0.5">
                {subject.target}%
              </p>
            </div>
          </div>

          {/* Safe Bunks & Classes Needed Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Bunks Available</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {bunks}{' '}
                <span className="text-xs font-normal text-emerald-300/70">
                  {bunks === 1 ? 'class' : 'classes'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                You can miss up to {bunks} classes without falling below {subject.target}%.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 mb-1">
                <Target className="w-4 h-4" />
                <span>Classes Required</span>
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-400">
                {needed === 0 ? '0' : needed}{' '}
                <span className="text-xs font-normal text-indigo-300/70">
                  {needed === 0 ? '(Target met)' : 'consecutive'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {needed === 0
                  ? 'Target is currently satisfied.'
                  : `Must attend ${needed} in a row to reach ${subject.target}%.`}
              </p>
            </div>
          </div>

          {/* Quick What-If Bunk Simulator for this Subject */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Subject Bunk Simulation
            </h4>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-xs text-slate-500">Miss next:</label>
              <input
                type="number"
                min="1"
                max="20"
                value={bunkTestCount}
                onChange={(e) => setBunkTestCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
              />
              <span className="text-xs text-slate-500">classes</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-400">Resulting Attendance:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  futurePct >= subject.target ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {futurePct.toFixed(1)}% (
                {futurePct >= subject.target ? 'Safe' : 'Below Target'})
              </span>
            </div>
          </div>

          {/* Burn rate info */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Single class drop rate:
            </span>
            <span className="font-mono font-semibold text-rose-500">
              -{burn.drop.toFixed(2)}%
            </span>
          </div>

          {subject.notes && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
              <strong className="block text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">
                Subject Notes
              </strong>
              {subject.notes}
            </div>
          )}

          <div className="pt-2 text-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Attendance Meter · Developed By Ankit Srivastava
            </span>
          </div>
        </div>

        {/* Modal Footer with Quick Mark Buttons */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Quick Log:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => incrementSubjectAttendance(subject.id, 'present')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/20 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>+ Present</span>
            </button>
            <button
              onClick={() => incrementSubjectAttendance(subject.id, 'absent')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-500/10 dark:bg-rose-500/20 hover:bg-rose-500/20 dark:hover:bg-rose-500/30 border border-rose-500/30 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>+ Absent</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
