import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { ThemeSelector } from './ThemeSelector';
import { CheckCircle2, FileDown, Plus } from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddModal }) => {
  const { setActiveTab, exportPDFReport } = useAttendance();

  return (
    <header className="md:hidden sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl transition-colors">
      <div className="px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2 text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            Attendance Meter
          </span>
        </button>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={exportPDFReport}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Export PDF Report"
            aria-label="Export PDF Report"
          >
            <FileDown className="w-4 h-4 text-indigo-500" />
          </button>

          <ThemeSelector compact />

          <button
            onClick={onOpenAddModal}
            className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            title="Add Subject"
            aria-label="Add Subject"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
