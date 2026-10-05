import React, { useRef, useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { exportReportAsPDF, exportElementAsImage } from '../utils/reportExport';
import {
  calculateAttendancePercentage,
  calculateBunksAvailable,
  calculateClassesNeeded,
  calculateBurnRate,
  generateSmartInsights,
} from '../utils/attendanceCalculations';
import { X, FileDown, Image, Check, Loader2, FileText } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    subjects,
    currentAttended,
    currentTotal,
    currentTarget,
    currentPercentage,
    currentAbsent,
    addToast,
  } = useAttendance();

  const reportRef = useRef<HTMLDivElement>(null);
  const [exportingType, setExportingType] = useState<'pdf' | 'jpg' | 'jpeg' | null>(null);

  if (!isOpen) return null;

  const bunks = calculateBunksAvailable(currentAttended, currentTotal, currentTarget);
  const needed = calculateClassesNeeded(currentAttended, currentTotal, currentTarget);
  const burn = calculateBurnRate(currentAttended, currentTotal, 1);
  const insights = generateSmartInsights(
    currentAttended,
    currentTotal,
    currentTarget,
    subjects,
    settings.classesPerDay || 5,
    settings.daysPerWeek || 5
  );

  const studentName = settings.studentName || 'Student';
  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleExportPDF = () => {
    try {
      setExportingType('pdf');
      exportReportAsPDF({
        settings,
        subjects,
        currentAttended,
        currentTotal,
        currentTarget,
      });
      addToast('Report Exported', 'Saved Attendance Report as PDF.', 'success');
    } catch (e) {
      console.error(e);
      addToast('Export Failed', 'Could not generate PDF report.', 'error');
    } finally {
      setExportingType(null);
    }
  };

  const handleExportImage = async (format: 'jpg' | 'jpeg') => {
    if (!reportRef.current) return;
    try {
      setExportingType(format);
      await exportElementAsImage(reportRef.current, format, studentName);
      addToast('Report Exported', `Saved Attendance Report as ${format.toUpperCase()}.`, 'success');
    } catch (e) {
      console.error(e);
      addToast('Export Failed', `Could not generate ${format.toUpperCase()} image.`, 'error');
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Export Attendance Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official report including your real student profile, courses, and tactical insights
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-auto text-xs font-semibold text-slate-600 dark:text-slate-300 mr-1 mb-0.5 sm:mb-0">
            Export Format:
          </div>

          <button
            onClick={handleExportPDF}
            disabled={exportingType !== null}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm touch-manipulation"
          >
            {exportingType === 'pdf' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>Save as PDF (Multi-Page)</span>
          </button>

          <button
            onClick={() => handleExportImage('jpg')}
            disabled={exportingType !== null}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors touch-manipulation"
          >
            {exportingType === 'jpg' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Image className="w-3.5 h-3.5 text-cyan-500" />
            )}
            <span>Save as JPG (High Res)</span>
          </button>

          <button
            onClick={() => handleExportImage('jpeg')}
            disabled={exportingType !== null}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors touch-manipulation"
          >
            {exportingType === 'jpeg' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Image className="w-3.5 h-3.5 text-emerald-500" />
            )}
            <span>Save as JPEG</span>
          </button>
        </div>

        {/* Printable Preview Sheet (used directly for JPG / JPEG generation) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950/60">
          <div
            ref={reportRef}
            className="w-full bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8 space-y-6"
            style={{ minHeight: '600px' }}
          >
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-indigo-600 gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Official Academic Report
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Attendance Meter
                </h2>
                <p className="text-xs text-slate-500">
                  Attendance Performance & Bunk Advisory Statement
                </p>
              </div>

              <div className="text-left sm:text-right text-xs space-y-0.5">
                <div>
                  Date: <strong className="text-slate-800">{todayStr}</strong>
                </div>
                <div>
                  Target Benchmark: <strong className="text-indigo-600 font-mono">{currentTarget}%</strong>
                </div>
              </div>
            </div>

            {/* Student Profile Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Student Profile
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Student Name:</span>{' '}
                  <strong className="text-slate-900">{studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Academic Year:</span>{' '}
                  <strong className="text-slate-900">{settings.year || '1st Year'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">College:</span>{' '}
                  <strong className="text-slate-900">{settings.collegeName || 'Not specified'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Semester:</span>{' '}
                  <strong className="text-slate-900">{settings.semester || '1st Semester'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Course / Branch:</span>{' '}
                  <strong className="text-slate-900">{settings.courseBranch || 'Not specified'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Schedule:</span>{' '}
                  <strong className="text-slate-900">
                    {settings.classesPerDay || 5} classes/day · {settings.daysPerWeek || 5} days/week
                  </strong>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/60">
                <span className="text-[10px] font-bold text-indigo-700 uppercase block">
                  Overall Attendance
                </span>
                <span className="text-2xl font-black font-mono text-indigo-600 mt-0.5 block">
                  {currentPercentage.toFixed(1)}%
                </span>
                <span className="text-[10px] text-indigo-800">
                  {currentPercentage >= currentTarget ? 'On Track' : 'Below Target'}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                  Attended / Total
                </span>
                <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">
                  {currentAttended} / {currentTotal}
                </span>
                <span className="text-[10px] text-emerald-800">{currentAbsent} missed</span>
              </div>

              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60">
                <span className="text-[10px] font-bold text-amber-700 uppercase block">
                  Safe Bunks Available
                </span>
                <span className="text-2xl font-black font-mono text-amber-600 mt-0.5 block">
                  {bunks}
                </span>
                <span className="text-[10px] text-amber-800">classes allowed</span>
              </div>

              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/60">
                <span className="text-[10px] font-bold text-rose-700 uppercase block">
                  Recovery Needed
                </span>
                <span className="text-xl font-bold font-mono text-rose-600 mt-1 block">
                  {needed === 0 ? '0' : needed === Infinity ? 'N/A' : needed}
                </span>
                <span className="text-[10px] text-rose-800">consecutive classes</span>
              </div>
            </div>

            {/* Subject Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Subject-Wise Attendance Breakdown
              </h4>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Subject Name</th>
                      <th className="py-2 px-3 text-center">Attended / Total</th>
                      <th className="py-2 px-3 text-center">Current %</th>
                      <th className="py-2 px-3 text-center">Target</th>
                      <th className="py-2 px-3 text-center">Status</th>
                      <th className="py-2 px-3 text-center">Safe Bunks</th>
                      <th className="py-2 px-3 text-center">Classes Needed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjects.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-slate-500">
                          No subjects added yet.
                        </td>
                      </tr>
                    ) : (
                      subjects.map((s, idx) => {
                        const sPct = calculateAttendancePercentage(s.attended, s.total);
                        const sBunks = calculateBunksAvailable(s.attended, s.total, s.target);
                        const sNeeded = calculateClassesNeeded(s.attended, s.total, s.target);
                        const isSafe = sPct >= s.target;

                        return (
                          <tr key={s.id || idx} className="hover:bg-slate-50/60">
                            <td className="py-2 px-3 font-medium text-slate-900">
                              {s.name}
                              {s.code && <span className="text-slate-400 font-mono ml-1">({s.code})</span>}
                            </td>
                            <td className="py-2 px-3 text-center font-mono">
                              {s.attended} / {s.total}
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold">
                              <span className={isSafe ? 'text-emerald-600' : 'text-rose-600'}>
                                {sPct.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-slate-600">
                              {s.target}%
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  isSafe
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {isSafe ? 'SAFE' : 'CRITICAL'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-semibold text-emerald-700">
                              {sBunks}
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-semibold text-indigo-700">
                              {sNeeded === 0 ? 'Achieved' : sNeeded === Infinity ? 'Impossible' : sNeeded}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Smart Insights & Burn Rate */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Tactical Insights & Advisory
              </span>
              <ul className="space-y-1 text-xs text-slate-700">
                {insights.slice(0, 4).map((ins, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200">
                <strong>Burn Rate Alert:</strong> Each missed class reduces attendance by approx{' '}
                <span className="font-mono text-rose-600 font-bold">-{burn.drop.toFixed(2)}%</span>{' '}
                (resulting in {burn.futurePct.toFixed(2)}%).
              </div>
            </div>

            {/* Watermark in Report */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>Attendance Meter · Comprehensive Student Attendance Calculator</span>
              <span className="font-semibold text-slate-800">
                Developed By Ankit Srivastava
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
