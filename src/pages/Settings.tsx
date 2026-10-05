import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { ThemeSelector } from '../components/ThemeSelector';
import { Watermark } from '../components/Watermark';
import {
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  FileDown,
  GraduationCap,
  Sparkle,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetAll,
    exportData,
    importData,
    rerunSetup,
    exportPDFReport,
    addToast,
  } = useAttendance();

  // Profile fields
  const [studentName, setStudentName] = useState(settings.studentName || '');
  const [collegeName, setCollegeName] = useState(settings.collegeName || '');
  const [courseBranch, setCourseBranch] = useState(settings.courseBranch || '');
  const [year, setYear] = useState(settings.year || '3rd Year');
  const [semester, setSemester] = useState(settings.semester || '5th Semester');

  // Attendance defaults
  const [classesPerDayStr, setClassesPerDayStr] = useState(
    (settings.classesPerDay || 5).toString()
  );
  const [daysPerWeekStr, setDaysPerWeekStr] = useState(
    (settings.daysPerWeek || 5).toString()
  );
  const [defaultTargetStr, setDefaultTargetStr] = useState(
    (settings.defaultTarget || 75).toString()
  );

  const [confirmReset, setConfirmReset] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      studentName: studentName.trim(),
      collegeName: collegeName.trim(),
      courseBranch: courseBranch.trim(),
      year,
      semester,
    });
    addToast('Profile Updated', 'Saved student details successfully.', 'success');
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const cpd = parseInt(classesPerDayStr.trim(), 10);
    const dpw = parseInt(daysPerWeekStr.trim(), 10);
    const tgt = parseFloat(defaultTargetStr.trim());

    if (isNaN(cpd) || cpd < 1 || cpd > 15) {
      addToast('Invalid Settings', 'Classes per day must be between 1 and 15.', 'error');
      return;
    }
    if (isNaN(dpw) || dpw < 1 || dpw > 7) {
      addToast('Invalid Settings', 'College days per week must be between 1 and 7.', 'error');
      return;
    }
    if (isNaN(tgt) || tgt < 1 || tgt > 100) {
      addToast('Invalid Settings', 'Default target must be between 1% and 100%.', 'error');
      return;
    }

    updateSettings({
      classesPerDay: cpd,
      daysPerWeek: dpw,
      defaultTarget: tgt,
    });
  };

  const handleExportJSON = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_meter_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Backup Exported', 'Downloaded your attendance backup JSON file.', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importData(content);
        if (ok) {
          setShowImportBox(false);
          setImportJsonText('');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportText = () => {
    if (!importJsonText.trim()) return;
    const ok = importData(importJsonText.trim());
    if (ok) {
      setShowImportBox(false);
      setImportJsonText('');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            Preferences & Data
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure student profile, schedule rules, appearance, and export/import backup data.
          </p>
        </div>

        <button
          onClick={exportPDFReport}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl shadow-sm self-start sm:self-auto transition-colors"
        >
          <FileDown className="w-4 h-4 text-indigo-400" />
          <span>Export PDF Report</span>
        </button>
      </div>

      {/* Edit Profile Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Student Academic Profile
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                College / University
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. NIT Trichy, Delhi University, etc."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course / Branch
              </label>
              <input
                type="text"
                value={courseBranch}
                onChange={(e) => setCourseBranch(e.target.value)}
                placeholder="e.g. B.Tech Computer Science"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

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

          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm"
            >
              Save Profile Changes
            </button>

            <button
              type="button"
              onClick={rerunSetup}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Re-run Initial Setup Wizard
            </button>
          </div>
        </form>
      </div>

      {/* Schedule & Default Target Settings */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Attendance Rules & Benchmarks
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Standard Indian college rules typically require 75% attendance. These parameters control
          the bunk limits, day conversions, and burn rate.
        </p>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Classes Per Day
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={classesPerDayStr}
                onChange={(e) => setClassesPerDayStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Usually 5 or 6 in India</span>
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Usually 5 or 6 days</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Target Attendance (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={defaultTargetStr}
                onChange={(e) => setDefaultTargetStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default: 75%</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-sm transition-all"
            >
              Save Schedule Rules
            </button>
          </div>
        </form>
      </div>

      {/* Theme & Display Mode */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Appearance & Theme Mode
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Choose between Dark, Light, or System mode. Changes the entire application theme consistently.
        </p>

        <div className="max-w-xs">
          <ThemeSelector />
        </div>
      </div>

      {/* Backup, Export & Import */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Data Backup & Transfer
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          All your attendance records and subjects are securely stored locally on this browser.
          Export a JSON file to transfer between laptop and phone.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Data (JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            <span>Import JSON File</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowImportBox(!showImportBox)}
            className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-300 underline"
          >
            Paste Raw JSON
          </button>
        </div>

        {showImportBox && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Paste Backup JSON string
            </label>
            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON content here..."
              className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 font-mono text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleImportText}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
            >
              Restore from Text
            </button>
          </div>
        )}
      </div>

      {/* Data Reset Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Reset Data
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Clear your attendance records and course entries to start fresh with a new semester.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Attendance Data</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetAll();
                  setConfirmReset(false);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors"
              >
                Confirm Clear Everything
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Watermark */}
      <Watermark />
    </div>
  );
};
