import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceOverviewCard } from '../components/AttendanceOverviewCard';
import { QuickAttendanceInput } from '../components/QuickAttendanceInput';
import { BunkCalculator } from '../components/BunkCalculator';
import { TargetCalculator } from '../components/TargetCalculator';
import { BurnRateCard } from '../components/BurnRateCard';
import { WeeklyBunkCard } from '../components/WeeklyBunkCard';
import { SmartInsights } from '../components/SmartInsights';
import { SubjectCard } from '../components/SubjectCard';
import { SubjectModal } from '../components/SubjectModal';
import { SubjectFormModal } from '../components/SubjectFormModal';
import { ExportReportModal } from '../components/ExportReportModal';
import { Watermark } from '../components/Watermark';
import { Subject } from '../types/attendance';
import {
  calculateBunksAvailable,
  calculateClassesNeeded,
} from '../utils/attendanceCalculations';
import {
  Plus,
  ShieldAlert,
  Target,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  FileText,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    subjects,
    activeSource,
    setActiveTab,
    addSubject,
    deleteSubject,
    updateSubject,
    incrementSubjectAttendance,
    settings,
    currentAttended,
    currentTotal,
    currentTarget,
  } = useAttendance();

  const [activeModal, setActiveModal] = useState<'bunk' | 'target' | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const bunksAvailable = calculateBunksAvailable(
    currentAttended,
    currentTotal,
    currentTarget
  );
  const classesRequired = calculateClassesNeeded(
    currentAttended,
    currentTotal,
    currentTarget
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Student Welcome & Identity Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            <GraduationCap className="w-4 h-4" />
            <span>
              {settings.collegeName || 'Indian College Student Dashboard'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {settings.studentName
              ? `Namaste, ${settings.studentName} 👋`
              : 'Attendance Command Center'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {settings.courseBranch
              ? `${settings.courseBranch} · ${settings.year || 'College'} (${settings.semester || 'Semester'})`
              : '“Know your attendance. Plan your bunks. Stay on target.”'}
          </p>
        </div>

        {/* Quick Actions Bar with PROMINENT EXPORT REPORT (Requirement 3) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Prominent Export Report Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 active:from-indigo-700 active:to-cyan-600 rounded-xl shadow-md shadow-indigo-500/25 transition-all transform hover:scale-[1.02]"
          >
            <FileText className="w-4 h-4" />
            <span>📄 Export Report</span>
          </button>

          <button
            onClick={() => setIsAddSubjectOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-indigo-500" />
            <span>Add Subject</span>
          </button>

          <button
            onClick={() => setActiveModal('bunk')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-purple-500" />
            <span>Can I Bunk?</span>
          </button>

          <button
            onClick={() => setActiveModal('target')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all"
          >
            <Target className="w-4 h-4 text-indigo-500" />
            <span>Target Planner</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all"
          >
            <span>Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all"
          >
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all"
          >
            <BarChart3 className="w-4 h-4 text-cyan-500" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* Main Attendance Overview Card */}
      <AttendanceOverviewCard
        onOpenBunkModal={() => setActiveModal('bunk')}
        onOpenTargetModal={() => setActiveModal('target')}
      />

      {/* Prominent Export Report Feature Banner (Requirement 3) */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-cyan-500/10 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-cyan-950/30 p-5 sm:p-6 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Official Statement
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">PDF · JPG · JPEG</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                Export Attendance Report
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl mt-0.5 leading-relaxed">
                Generate an official, multi-page attendance report with your real academic profile, subject breakdown, bunk analysis, and tactical insights.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 active:from-indigo-700 active:to-cyan-600 rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] touch-manipulation"
            >
              <FileText className="w-4 h-4" />
              <span>📄 Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Direct Quick Calculator if in standalone mode */}
      {activeSource === 'standalone' && (
        <div>
          <QuickAttendanceInput />
        </div>
      )}

      {/* Smart Insights */}
      <SmartInsights />

      {/* Interactive Calculators Dual-Grid: Can I Bunk? & Target Recovery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BunkCalculator />
        <TargetCalculator />
      </div>

      {/* Burn Rate & Weekly Skip Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BurnRateCard />
        <WeeklyBunkCard />
      </div>

      {/* Subject Quick Review Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              My Subjects
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quickly mark attendance or inspect individual subjects
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('subjects')}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>View All ({subjects.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Clean Empty State - Never show demo subjects automatically (Requirement 1) */}
        {subjects.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center">
            <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No subjects added yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Add your courses to track each class, calculate specific bunk limits, and keep an
              accurate overall aggregate.
            </p>
            <div className="flex items-center justify-center">
              <button
                onClick={() => setIsAddSubjectOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.slice(0, 6).map((subj) => (
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
      </div>

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
        isOpen={isAddSubjectOpen || !!editingSubject}
        onClose={() => {
          setIsAddSubjectOpen(false);
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

      {/* Export Report Modal (Requirement 3: PDF, JPG, JPEG) */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Quick Action Modal: Bunk Planner Dialog */}
      {activeModal === 'bunk' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Can I Bunk? Planner</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            <BunkCalculator />
          </div>
        </div>
      )}

      {/* Quick Action Modal: Target Planner Dialog */}
      {activeModal === 'target' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Target Attendance Planner</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            <TargetCalculator />
          </div>
        </div>
      )}

      {/* Mandatory Attribution Watermark */}
      <Watermark />
    </div>
  );
};
