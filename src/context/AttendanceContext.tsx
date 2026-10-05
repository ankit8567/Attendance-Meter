import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  CalendarDayRecord,
  IndianHoliday,
  Subject,
  ToastMessage,
  UserSettings,
} from '../types/attendance';
import {
  calculateAggregateAttendance,
} from '../utils/attendanceCalculations';
import {
  DEFAULT_SETTINGS,
  DEFAULT_STANDALONE,
  exportAllDataAsJSON,
  getStoredAvatar,
  getStoredCalendar,
  getStoredSettings,
  getStoredStandalone,
  getStoredSubjects,
  importAllDataFromJSON,
  resetAllStorageData,
  saveStoredAvatar,
  saveStoredCalendar,
  saveStoredSettings,
  saveStoredStandalone,
  saveStoredSubjects,
  StandaloneData,
} from '../utils/storage';
import {
  DEFAULT_INDIAN_HOLIDAYS,
  getStoredHolidays,
  saveStoredHolidays,
} from '../utils/indianHolidays';
import { generateAttendancePDF } from '../utils/pdfExport';

export type NavTab = 'dashboard' | 'subjects' | 'simulator' | 'calendar' | 'analytics' | 'settings';

interface AttendanceContextType {
  subjects: Subject[];
  settings: UserSettings;
  calendar: Record<string, CalendarDayRecord>;
  standalone: StandaloneData;
  holidays: IndianHoliday[];
  activeSource: 'subjects' | 'standalone';
  setActiveSource: (source: 'subjects' | 'standalone') => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  toasts: ToastMessage[];
  addToast: (title: string, message?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  
  // Computed values
  currentAttended: number;
  currentTotal: number;
  currentTarget: number;
  currentPercentage: number;
  currentAbsent: number;
  effectiveTheme: 'dark' | 'light';
  avatarUrl: string | null;

  // Actions
  updateAvatar: (url: string | null) => void;
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  incrementSubjectAttendance: (id: string, type: 'present' | 'absent') => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  updateStandalone: (data: StandaloneData) => void;
  updateCalendarDay: (record: CalendarDayRecord) => void;
  addHoliday: (holiday: Omit<IndianHoliday, 'id'>) => void;
  deleteHoliday: (id: string) => void;
  resetAll: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  completeSetup: (
    profile: {
      studentName: string;
      collegeName: string;
      courseBranch: string;
      year: string;
      semester: string;
    },
    overall: {
      total: number;
      attended: number;
      target: number;
      classesPerDay: number;
      daysPerWeek: number;
    },
    subjectsList: Subject[]
  ) => void;
  rerunSetup: () => void;
  exportPDFReport: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>(getStoredSubjects);
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings);
  const [calendar, setCalendar] = useState<Record<string, CalendarDayRecord>>(getStoredCalendar);
  const [standalone, setStandalone] = useState<StandaloneData>(getStoredStandalone);
  const [holidays, setHolidays] = useState<IndianHoliday[]>(getStoredHolidays);
  const [activeSource, setActiveSource] = useState<'subjects' | 'standalone'>('subjects');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Listen to system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const effectiveTheme: 'dark' | 'light' = useMemo(() => {
    if (settings.theme === 'system') {
      return systemIsDark ? 'dark' : 'light';
    }
    return settings.theme;
  }, [settings.theme, systemIsDark]);

  // Apply dark / light class to root
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [effectiveTheme]);

  // Persist state
  useEffect(() => {
    saveStoredSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStoredCalendar(calendar);
  }, [calendar]);

  useEffect(() => {
    saveStoredStandalone(standalone);
  }, [standalone]);

  useEffect(() => {
    saveStoredHolidays(holidays);
  }, [holidays]);

  // Toast
  const addToast = (
    title: string,
    message?: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info'
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Aggregates
  const subjectAggregate = useMemo(() => {
    return calculateAggregateAttendance(subjects);
  }, [subjects]);

  const { currentAttended, currentTotal, currentTarget, currentPercentage, currentAbsent } =
    useMemo(() => {
      if (activeSource === 'subjects' && subjects.length > 0) {
        return {
          currentAttended: subjectAggregate.totalAttended,
          currentTotal: subjectAggregate.totalClasses,
          currentTarget: settings.defaultTarget,
          currentPercentage: subjectAggregate.overallPercentage,
          currentAbsent: subjectAggregate.totalAbsent,
        };
      } else {
        const total = Math.max(0, standalone.total);
        const attended = Math.min(total, Math.max(0, standalone.attended));
        const pct = total > 0 ? (attended / total) * 100 : 0;
        return {
          currentAttended: attended,
          currentTotal: total,
          currentTarget: standalone.target || settings.defaultTarget,
          currentPercentage: pct,
          currentAbsent: Math.max(0, total - attended),
        };
      }
    }, [activeSource, subjects, subjectAggregate, settings.defaultTarget, standalone]);

  const addSubject = (subj: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subj,
      id: `subj-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setSubjects((prev) => [...prev, newSubject]);
    addToast('Subject Added', `Added ${newSubject.name} to course list.`, 'success');
  };

  const updateSubject = (updated: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    addToast('Subject Updated', `Saved changes to ${updated.name}.`, 'success');
  };

  const deleteSubject = (id: string) => {
    const target = subjects.find((s) => s.id === id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    addToast('Subject Deleted', target ? `Removed ${target.name}.` : 'Subject removed.', 'info');
  };

  const incrementSubjectAttendance = (id: string, type: 'present' | 'absent') => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (type === 'present') {
          return {
            ...s,
            attended: s.attended + 1,
            total: s.total + 1,
          };
        } else {
          return {
            ...s,
            total: s.total + 1,
          };
        }
      })
    );

    const s = subjects.find((sub) => sub.id === id);
    if (s) {
      if (type === 'present') {
        addToast('Marked Present', `Logged attendance for ${s.name}.`, 'success');
      } else {
        addToast('Marked Absent', `Logged absence for ${s.name}.`, 'warning');
      }
    }
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('Settings Saved', 'Updated your preferences.', 'success');
  };

  const updateStandalone = (data: StandaloneData) => {
    setStandalone(data);
    addToast('Attendance Updated', 'Updated quick calculator figures.', 'success');
  };

  const updateCalendarDay = (record: CalendarDayRecord) => {
    setCalendar((prev) => ({
      ...prev,
      [record.date]: record,
    }));
    addToast('Calendar Updated', `Saved entry for ${record.date}.`, 'success');
  };

  const addHoliday = (h: Omit<IndianHoliday, 'id'>) => {
    const newH: IndianHoliday = {
      ...h,
      id: `hol-${Date.now()}`,
      isCustom: true,
    };
    setHolidays((prev) => [...prev, newH]);
    addToast('Holiday Added', `Added ${newH.name} on ${newH.date}.`, 'success');
  };

  const deleteHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    addToast('Holiday Removed', 'Updated holiday schedule.', 'info');
  };

  const resetAll = () => {
    resetAllStorageData();
    setSubjects([]);
    setStandalone({ attended: 0, total: 0, target: 75 });
    setCalendar({});
    setSettings({ ...DEFAULT_SETTINGS, setupCompleted: false });
    setHolidays(DEFAULT_INDIAN_HOLIDAYS);
    setActiveSource('standalone');
    addToast('Data Reset', 'All records cleared. You can now restart setup.', 'info');
  };

  const exportData = () => {
    return exportAllDataAsJSON();
  };

  const importData = (json: string): boolean => {
    const success = importAllDataFromJSON(json);
    if (success) {
      setSubjects(getStoredSubjects());
      setSettings(getStoredSettings());
      setStandalone(getStoredStandalone());
      setCalendar(getStoredCalendar());
      setHolidays(getStoredHolidays());
      addToast('Data Imported', 'Successfully restored your attendance records.', 'success');
      return true;
    } else {
      addToast('Import Failed', 'The uploaded file is not valid JSON.', 'error');
      return false;
    }
  };

  const completeSetup = (
    profile: {
      studentName: string;
      collegeName: string;
      courseBranch: string;
      year: string;
      semester: string;
    },
    overall: {
      total: number;
      attended: number;
      target: number;
      classesPerDay: number;
      daysPerWeek: number;
    },
    subjectsList: Subject[]
  ) => {
    setSettings((prev) => ({
      ...prev,
      ...profile,
      defaultTarget: overall.target,
      classesPerDay: overall.classesPerDay,
      daysPerWeek: overall.daysPerWeek,
      setupCompleted: true,
    }));

    setStandalone({
      total: overall.total,
      attended: overall.attended,
      target: overall.target,
    });

    if (subjectsList.length > 0) {
      setSubjects(subjectsList);
      setActiveSource('subjects');
    } else {
      setActiveSource('standalone');
    }

    setActiveTab('dashboard');
    addToast('Welcome to Attendance Meter!', `Profile for ${profile.studentName || 'Student'} is ready.`, 'success');
  };

  const rerunSetup = () => {
    setSettings((prev) => ({ ...prev, setupCompleted: false }));
    addToast('Setup Wizard', 'You can now reconfigure your profile & courses.', 'info');
  };

  const exportPDFReport = () => {
    generateAttendancePDF({
      settings,
      subjects,
      currentAttended,
      currentTotal,
      currentTarget,
    });
    addToast('Report Generated', 'Downloaded your official attendance PDF report.', 'success');
  };

  return (
    <AttendanceContext.Provider
      value={{
        subjects,
        settings,
        calendar,
        standalone,
        holidays,
        activeSource,
        setActiveSource,
        activeTab,
        setActiveTab,
        toasts,
        addToast,
        dismissToast,
        currentAttended,
        currentTotal,
        currentTarget,
        currentPercentage,
        currentAbsent,
        effectiveTheme,
        addSubject,
        updateSubject,
        deleteSubject,
        incrementSubjectAttendance,
        updateSettings,
        updateStandalone,
        updateCalendarDay,
        addHoliday,
        deleteHoliday,
        resetAll,
        exportData,
        importData,
        completeSetup,
        rerunSetup,
        exportPDFReport,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
