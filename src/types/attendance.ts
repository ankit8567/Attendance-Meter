export interface Subject {
  id: string;
  name: string;
  code?: string;
  attended: number;
  total: number;
  target: number; // e.g. 75
  color?: string; // hex or tailwind accent
  notes?: string;
}

export type DayAttendanceStatus = 'present' | 'absent' | 'partial' | 'holiday';

export interface CalendarDayRecord {
  date: string; // YYYY-MM-DD
  status: DayAttendanceStatus;
  attendedCount?: number;
  totalCount?: number;
  note?: string;
  holidayName?: string;
}

export interface IndianHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD or MM-DD
  description?: string;
  isCustom?: boolean;
}

export interface UserSettings {
  studentName: string;
  collegeName: string;
  courseBranch: string;
  year: string;
  semester: string;
  classesPerDay: number;
  daysPerWeek: number;
  defaultTarget: number;
  theme: 'dark' | 'light' | 'system';
  setupCompleted: boolean;
}

export type AttendanceStatusCategory = 'safe' | 'warning' | 'critical';

export interface AttendanceStatusResult {
  category: AttendanceStatusCategory;
  title: string;
  message: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  badgeBg: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface SimulationResult {
  name: string;
  attended: number;
  total: number;
  percentage: number;
  change: number;
}
