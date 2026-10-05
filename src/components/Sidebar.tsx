import React from 'react';
import { useAttendance, NavTab } from '../context/AttendanceContext';
import { ThemeSelector } from './ThemeSelector';
import { AnkitAvatar } from './AnkitAvatar';
import {
  LayoutDashboard,
  BookOpen,
  Calculator,
  Calendar,
  BarChart3,
  Settings,
  FileDown,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  onOpenAddModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAddModal }) => {
  const { activeTab, setActiveTab, settings, exportPDFReport } = useAttendance();

  const navItems: { id: NavTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'simulator', label: 'Simulator', icon: Calculator },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl h-screen sticky top-0 z-30 transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-slate-900 dark:text-white leading-tight block">
            Attendance Meter
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
            College Attendance SaaS
          </span>
        </div>
      </div>

      {/* Student Profile Snapshot in Sidebar */}
      {settings.studentName && (
        <div className="p-4 mx-3 my-2.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-950/20">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-4 h-4 text-indigo-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {settings.studentName}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {settings.courseBranch || 'Student'}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
            <span>{settings.year || 'College'}</span>
            <span>·</span>
            <span>{settings.semester || 'Current'}</span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions: Export PDF & Theme */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <button
          onClick={exportPDFReport}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700/60 transition-colors shadow-sm"
        >
          <FileDown className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export PDF Report</span>
        </button>

        <ThemeSelector />

        {/* Developer Attribution */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 select-none">
          <AnkitAvatar size={16} showRing={false} className="ring-1 ring-indigo-500/40" />
          <span>Developed By <strong className="font-semibold text-slate-700 dark:text-slate-300">Ankit Srivastava</strong></span>
        </div>
      </div>
    </aside>
  );
};
