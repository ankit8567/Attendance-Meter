import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { SubjectCard } from '../components/SubjectCard';
import { SubjectModal } from '../components/SubjectModal';
import { SubjectFormModal } from '../components/SubjectFormModal';
import { Watermark } from '../components/Watermark';
import { Subject } from '../types/attendance';
import {
  calculateAggregateAttendance,
  calculateAttendancePercentage,
} from '../utils/attendanceCalculations';
import {
  Plus,
  Search,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const Subjects: React.FC = () => {
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    incrementSubjectAttendance,
    settings,
  } = useAttendance();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'safe' | 'warning' | 'critical'>('all');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Compute aggregate strictly across all subjects (Section 7 & 16)
  const aggregate = calculateAggregateAttendance(subjects);

  // Filter subjects based on query and status
  const filteredSubjects = subjects.filter((subj) => {
    const matchesSearch =
      subj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subj.code && subj.code.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;

    const pct = calculateAttendancePercentage(subj.attended, subj.total);
    if (filterStatus === 'safe') return pct >= subj.target;
    if (filterStatus === 'warning') return pct < subj.target && pct >= subj.target - 5;
    if (filterStatus === 'critical') return pct < subj.target - 5;

    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            Course Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            My Subjects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor and maintain required attendance for each subject individually.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* OVERALL COLLEGE ATTENDANCE BOX */}
      {subjects.length > 0 && (
        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-slate-100 to-indigo-50/50 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-slate-900/40 backdrop-blur-xl p-6 shadow-sm text-slate-900 dark:text-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Combined Standing
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                Overall College Attendance
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Calculated strictly as sum of attended classes across all subjects divided by total
                classes:
                <br />
                <code className="font-mono text-indigo-600 dark:text-indigo-300 text-[11px]">
                  ({aggregate.totalAttended} / {aggregate.totalClasses}) × 100
                </code>
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400">Overall Rate</span>
                <div className="text-3xl sm:text-4xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
                  {aggregate.overallPercentage.toFixed(1)}%
                </div>
              </div>

              <div className="h-12 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400">Attended:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {aggregate.totalAttended}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400">Total:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-white">{aggregate.totalClasses}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400">Absent:</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {aggregate.totalAbsent}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      {subjects.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subjects or code..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-medium border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All ({subjects.length})
            </button>
            <button
              onClick={() => setFilterStatus('safe')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'safe'
                  ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Safe</span>
            </button>
            <button
              onClick={() => setFilterStatus('warning')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'warning'
                  ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Warning</span>
            </button>
            <button
              onClick={() => setFilterStatus('critical')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'critical'
                  ? 'bg-white dark:bg-slate-900 text-rose-500 shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Critical</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid of Subjects */}
      {subjects.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 text-center">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No subjects added yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            Add your college courses to monitor bunks, calculate target recovery, and track individual attendance.
          </p>
          <div className="flex items-center justify-center">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          No subjects match your current filter or search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subj) => (
            <SubjectCard
              key={subj.id}
              subject={subj}
              onIncrement={incrementSubjectAttendance}
              onEdit={(s) => setEditingSubject(s)}
              onDelete={deleteSubject}
              onViewDetails={(s) => setSelectedSubject(s)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <SubjectModal
        subject={selectedSubject}
        onClose={() => setSelectedSubject(null)}
        onEdit={(s) => {
          setSelectedSubject(null);
          setEditingSubject(s);
        }}
      />

      <SubjectFormModal
        isOpen={isAddOpen || !!editingSubject}
        onClose={() => {
          setIsAddOpen(false);
          setEditingSubject(null);
        }}
        onSave={(data) => {
          if ('id' in data) {
            updateSubject(data as Subject);
          } else {
            addSubject(data);
          }
        }}
        initialSubject={editingSubject}
        defaultTarget={settings.defaultTarget}
      />

      {/* Watermark */}
      <Watermark />
    </div>
  );
};
