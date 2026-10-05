import { CalendarDayRecord, IndianHoliday, Subject, UserSettings } from '../types/attendance';
import { DEFAULT_INDIAN_HOLIDAYS, getStoredHolidays, HOLIDAYS_STORAGE_KEY, saveStoredHolidays } from './indianHolidays';

export const STORAGE_KEYS = {
  SUBJECTS: 'attendance_meter_subjects_v2',
  SETTINGS: 'attendance_meter_settings_v2',
  CALENDAR: 'attendance_meter_calendar_v2',
  STANDALONE_ATTENDANCE: 'attendance_meter_standalone_v2',
  HOLIDAYS: HOLIDAYS_STORAGE_KEY,
  AVATAR: 'attendance_meter_avatar_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  studentName: '',
  collegeName: '',
  courseBranch: '',
  year: '1st Year',
  semester: '1st Semester',
  classesPerDay: 5,
  daysPerWeek: 5,
  defaultTarget: 75, // 75% standard benchmark
  theme: 'dark',
  setupCompleted: false,
};

export interface StandaloneData {
  attended: number;
  total: number;
  target: number;
}

export const DEFAULT_STANDALONE: StandaloneData = {
  attended: 0,
  total: 0,
  target: 75,
};

export function getStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed reading settings from storage', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed saving settings to storage', e);
  }
}

export function getStoredSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading subjects from storage', e);
    return [];
  }
}

export function saveStoredSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed saving subjects to storage', e);
  }
}

export function getStoredStandalone(): StandaloneData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STANDALONE_ATTENDANCE);
    if (!raw) return DEFAULT_STANDALONE;
    return { ...DEFAULT_STANDALONE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed reading standalone attendance', e);
    return DEFAULT_STANDALONE;
  }
}

export function saveStoredStandalone(data: StandaloneData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STANDALONE_ATTENDANCE, JSON.stringify(data));
  } catch (e) {
    console.error('Failed saving standalone attendance', e);
  }
}

export function getStoredCalendar(): Record<string, CalendarDayRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CALENDAR);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading calendar records', e);
    return {};
  }
}

export function saveStoredCalendar(calendar: Record<string, CalendarDayRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(calendar));
  } catch (e) {
    console.error('Failed saving calendar records', e);
  }
}

export function exportAllDataAsJSON(): string {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '2.1',
    settings: getStoredSettings(),
    subjects: getStoredSubjects(),
    standalone: getStoredStandalone(),
    calendar: getStoredCalendar(),
    holidays: getStoredHolidays(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllDataFromJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.settings) saveStoredSettings(parsed.settings);
    if (parsed.subjects && Array.isArray(parsed.subjects)) saveStoredSubjects(parsed.subjects);
    if (parsed.standalone) saveStoredStandalone(parsed.standalone);
    if (parsed.calendar) saveStoredCalendar(parsed.calendar);
    if (parsed.holidays && Array.isArray(parsed.holidays)) saveStoredHolidays(parsed.holidays);
    return true;
  } catch (e) {
    console.error('Failed importing data', e);
    return false;
  }
}

export function resetAllStorageData(): void {
  localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.CALENDAR);
  localStorage.removeItem(STORAGE_KEYS.STANDALONE_ATTENDANCE);
  localStorage.removeItem(STORAGE_KEYS.HOLIDAYS);
  localStorage.removeItem(STORAGE_KEYS.AVATAR);
}

export function getStoredAvatar(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.AVATAR) || null;
  } catch {
    return null;
  }
}

export function saveStoredAvatar(avatarUrl: string | null): void {
  try {
    if (avatarUrl) {
      localStorage.setItem(STORAGE_KEYS.AVATAR, avatarUrl);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AVATAR);
    }
  } catch (e) {
    console.error('Failed saving avatar to storage', e);
  }
}
