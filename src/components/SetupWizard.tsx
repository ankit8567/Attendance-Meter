import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Subject } from '../types/attendance';
import { calculateAttendancePercentage, getAttendanceStatus } from '../utils/attendanceCalculations';
import { ThemeSelector } from './ThemeSelector';
import {
  GraduationCap,
  Calculator,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export const SetupWizard: React.FC = () => {
  const { completeSetup, settings } = useAttendance();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Student Profile
  const [name, setName] = useState(settings.studentName || '');
  const [college, setCollege] = useState(settings.collegeName || '');
  const [courseBranch, setCourseBranch] = useState(settings.courseBranch || '');
  const [year, setYear] = useState(settings.year || '1st Year');
  const [semester, setSemester] = useState(settings.semester || '1st Semester');

  // Step 2: Overall Attendance (No fake numbers!)
  const [totalClassesStr, setTotalClassesStr] = useState('');
  const [attendedClassesStr, setAttendedClassesStr] = useState('');
  const [targetPctStr, setTargetPctStr] = useState('75');
  const [classesPerDayStr, setClassesPerDayStr] = useState('5');
  const [daysPerWeekStr, setDaysPerWeekStr] = useState('5');

  // Step 3: Subject-wise attendance (starts completely empty!)
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);

  // Subject form inputs for adding to list in Step 3
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjAttended, setNewSubjAttended] = useState('');
  const [newSubjTotal, setNewSubjTotal] = useState('');
  const [newSubjTarget, setNewSubjTarget] = useState('75');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live calculation for Step 2
  const totalClasses = parseInt(totalClassesStr.trim(), 10) || 0;
  const attendedClasses = parseInt(attendedClassesStr.trim(), 10) || 0;
  const targetPct = parseFloat(targetPctStr.trim()) || 75;
  const livePct = calculateAttendancePercentage(attendedClasses, totalClasses);
  const liveStatus = getAttendanceStatus(livePct, targetPct, attendedClasses, totalClasses);

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name to personalize your dashboard.');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (totalClassesStr.trim() === '' || attendedClassesStr.trim() === '') {
      setErrorMsg('Please provide your total and attended class counts.');
      return;
    }

    if (totalClasses <= 0) {
      setErrorMsg('Total classes conducted must be greater than zero.');
      return;
    }
    if (attendedClasses < 0) {
      setErrorMsg('Attended classes cannot be negative.');
      return;
    }
    if (attendedClasses > totalClasses) {
      setErrorMsg('Attended classes cannot be greater than total classes.');
      return;
    }
    if (targetPct <= 0 || targetPct > 100) {
      setErrorMsg('Target attendance must be between 1% and 100%.');
      return;
    }

    setStep(3);
  };

  const handleAddSubjectToSetup = () => {
    setErrorMsg(null);
    const sName = newSubjName.trim();
    if (!sName) {
      setErrorMsg('Subject name is required.');
      return;
    }
    const att = parseInt(newSubjAttended.trim(), 10);
    const tot = parseInt(newSubjTotal.trim(), 10);
    const tgt = parseFloat(newSubjTarget.trim()) || targetPct;

    if (isNaN(att) || isNaN(tot) || tot <= 0 || att < 0) {
      setErrorMsg('Please enter valid class counts for this subject.');
      return;
    }
    if (att > tot) {
      setErrorMsg('Attended cannot exceed total classes for this subject.');
      return;
    }

    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];
    const chosenColor = colors[subjectsList.length % colors.length];

    setSubjectsList((prev) => [
      ...prev,
      {
        id: `setup-subj-${Date.now()}`,
        name: sName,
        code: newSubjCode.trim() || undefined,
        attended: att,
        total: tot,
        target: tgt,
        color: chosenColor,
      },
    ]);

    setNewSubjName('');
    setNewSubjCode('');
    setNewSubjAttended('');
    setNewSubjTotal('');
    setNewSubjTarget(targetPct.toString());
  };

  const handleRemoveSubjectFromSetup = (id: string) => {
    setSubjectsList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleFinishSetup = () => {
    const cpd = parseInt(classesPerDayStr.trim(), 10) || 5;
    const dpw = parseInt(daysPerWeekStr.trim(), 10) || 5;

    completeSetup(
      {
        studentName: name.trim(),
        collegeName: college.trim(),
        courseBranch: courseBranch.trim(),
        year,
        semester,
      },
      {
        total: totalClasses,
        attended: attendedClasses,
        target: targetPct,
        classesPerDay: cpd,
        daysPerWeek: dpw,
      },
      subjectsList
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Background radial glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl p-6 sm:p-8 z-10 transition-colors">
        {/* Top Header with Brand and Theme Selector */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block leading-tight">
                Attendance Meter
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                First-Time Setup Wizard
              </span>
            </div>
          </div>

          <ThemeSelector compact />
        </div>

        {/* Wizard Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className={step >= 1 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}>
              1. Student Profile
            </span>
            <span className={step >= 2 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}>
              2. Overall Attendance
            </span>
            <span className={step >= 3 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}>
              3. Subjects Setup
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 transition-all duration-500 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: STUDENT PROFILE */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-5 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Profile</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Welcome to Attendance Meter! Let's tailor the dashboard to your academic program.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  College / University Name (Optional)
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Delhi Technological University, NIT, Mumbai University, etc."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course / Branch
                </label>
                <input
                  type="text"
                  value={courseBranch}
                  onChange={(e) => setCourseBranch(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science, BCA, B.Sc, B.Com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
              >
                <span>Continue to Attendance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: OVERALL ATTENDANCE */}
        {step === 2 && (
          <form onSubmit={handleNextStep2} className="space-y-5 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Overall Attendance Standing</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Input your cumulative classes conducted and attended so far.
                </p>
              </div>
            </div>

            {/* Live Calculation Preview Banner */}
            <div className={`p-4 rounded-2xl border ${liveStatus.bgClass} ${liveStatus.borderClass}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    Calculated Standing
                  </span>
                  <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                    {totalClasses > 0 ? `${livePct.toFixed(1)}%` : '0.0%'}
                  </div>
                  <span className={`text-xs font-semibold ${liveStatus.colorClass}`}>
                    {totalClasses > 0 ? liveStatus.title : 'Awaiting Class Data'}
                  </span>
                </div>

                <div className="text-right text-xs space-y-1">
                  <div className="text-slate-500 dark:text-slate-400">
                    Formula:{' '}
                    <code className="font-mono text-indigo-600 dark:text-indigo-300">
                      ({attendedClasses} / {totalClasses || 1}) × 100
                    </code>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    Target Requirement: <strong className="text-indigo-600 dark:text-indigo-400">{targetPct}%</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Classes Conducted *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 120"
                  value={totalClassesStr}
                  onChange={(e) => setTotalClassesStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attended Classes *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 96"
                  value={attendedClassesStr}
                  onChange={(e) => setAttendedClassesStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Attendance (%) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={targetPctStr}
                  onChange={(e) => setTargetPctStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Classes Per Day (Average)
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={classesPerDayStr}
                  onChange={(e) => setClassesPerDayStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Usually 5 or 6 classes/day
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  College Days Per Week
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={daysPerWeekStr}
                  onChange={(e) => setDaysPerWeekStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Usually 5 or 6 days/week
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
              >
                <span>Continue to Subjects</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUBJECT-WISE ATTENDANCE */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Subject-Wise Attendance</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add your courses now, or skip and add them anytime from the Dashboard.
                </p>
              </div>
            </div>

            {/* Add Subject Inline Form */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Add Subject to List
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Subject Name (e.g. Mathematics)"
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Code (optional, e.g. MA-101)"
                  value={newSubjCode}
                  onChange={(e) => setNewSubjCode(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <input
                  type="number"
                  placeholder="Attended Classes"
                  min="0"
                  value={newSubjAttended}
                  onChange={(e) => setNewSubjAttended(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Total Classes"
                  min="1"
                  value={newSubjTotal}
                  onChange={(e) => setNewSubjTotal(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Target %"
                  min="1"
                  max="100"
                  value={newSubjTarget}
                  onChange={(e) => setNewSubjTarget(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAddSubjectToSetup}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white font-semibold text-xs border border-indigo-500/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add This Subject</span>
              </button>
            </div>

            {/* Current Subjects List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {subjectsList.length === 0 ? (
                <div className="p-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                  No subjects added yet. Add your subjects above, or finish setup and add them later.
                </div>
              ) : (
                subjectsList.map((subj) => {
                  const sPct = calculateAttendancePercentage(subj.attended, subj.total);
                  const isSafe = sPct >= subj.target;
                  return (
                    <div
                      key={subj.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: subj.color || '#6366f1' }}
                        />
                        <div className="truncate">
                          <span className="font-bold text-slate-900 dark:text-white">{subj.name}</span>
                          {subj.code && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono ml-1.5">
                              ({subj.code})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right font-mono">
                          <span className={isSafe ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                            {sPct.toFixed(1)}%
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 text-[10px] ml-1">
                            ({subj.attended}/{subj.total})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSubjectFromSetup(subj.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                          title="Remove subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleFinishSetup}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-500/25 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Finish Setup & Launch Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
