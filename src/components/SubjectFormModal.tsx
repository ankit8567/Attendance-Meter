import React, { useState, useEffect } from 'react';
import { Subject } from '../types/attendance';
import { X, AlertCircle } from 'lucide-react';

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Omit<Subject, 'id'> | Subject) => void;
  initialSubject?: Subject | null;
  defaultTarget: number;
}

const COLOR_OPTIONS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#f43f5e', // Rose
];

export const SubjectFormModal: React.FC<SubjectFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject,
  defaultTarget,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [attendedStr, setAttendedStr] = useState('0');
  const [totalStr, setTotalStr] = useState('0');
  const [targetStr, setTargetStr] = useState(defaultTarget.toString());
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubject) {
      setName(initialSubject.name);
      setCode(initialSubject.code || '');
      setAttendedStr(initialSubject.attended.toString());
      setTotalStr(initialSubject.total.toString());
      setTargetStr(initialSubject.target.toString());
      setColor(initialSubject.color || COLOR_OPTIONS[0]);
      setNotes(initialSubject.notes || '');
    } else {
      setName('');
      setCode('');
      setAttendedStr('0');
      setTotalStr('0');
      setTargetStr(defaultTarget.toString());
      setColor(COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]);
      setNotes('');
    }
    setError(null);
  }, [initialSubject, defaultTarget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please provide a subject name.');
      return;
    }

    const attended = parseInt(attendedStr.trim(), 10);
    const total = parseInt(totalStr.trim(), 10);
    const target = parseFloat(targetStr.trim());

    if (isNaN(attended) || isNaN(total) || isNaN(target)) {
      setError('Classes and target must be valid numbers.');
      return;
    }

    if (total < 0) {
      setError('Total classes cannot be negative.');
      return;
    }

    if (attended < 0) {
      setError('Attended classes cannot be negative.');
      return;
    }

    if (attended > total) {
      setError('Attended classes cannot exceed total classes.');
      return;
    }

    if (target <= 0 || target > 100) {
      setError('Target percentage must be between 1% and 100%.');
      return;
    }

    if (initialSubject) {
      onSave({
        ...initialSubject,
        name: cleanName,
        code: code.trim(),
        attended,
        total,
        target,
        color,
        notes: notes.trim(),
      });
    } else {
      onSave({
        name: cleanName,
        code: code.trim(),
        attended,
        total,
        target,
        color,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {initialSubject ? 'Edit Subject' : 'Add New Subject'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Data Structures & Algorithms"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS-301"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                value={targetStr}
                onChange={(e) => setTargetStr(e.target.value)}
                placeholder="75"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Attended Classes *
              </label>
              <input
                type="number"
                min="0"
                required
                value={attendedStr}
                onChange={(e) => setAttendedStr(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Classes *
              </label>
              <input
                type="number"
                min="0"
                required
                value={totalStr}
                onChange={(e) => setTotalStr(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Color tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white dark:ring-slate-900 ring-offset-2 ring-offset-indigo-500' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Teacher / Timetable (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Lab on Tuesday 10am"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-sm transition-all"
            >
              {initialSubject ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
