import { IndianHoliday } from '../types/attendance';

export const DEFAULT_INDIAN_HOLIDAYS: IndianHoliday[] = [
  { id: 'h-1', name: "New Year's Day", date: '2026-01-01', description: 'Public Holiday' },
  { id: 'h-2', name: 'Makar Sankranti / Pongal', date: '2026-01-14', description: 'Harvest Festival' },
  { id: 'h-3', name: 'Netaji Subhas Bose Jayanti', date: '2026-01-23', description: 'Parakram Diwas' },
  { id: 'h-4', name: 'Republic Day', date: '2026-01-26', description: 'National Holiday' },
  { id: 'h-5', name: 'Maha Shivratri', date: '2026-02-26', description: 'Public Holiday' },
  { id: 'h-6', name: 'Holi (Festival of Colors)', date: '2026-03-04', description: 'Public Holiday' },
  { id: 'h-7', name: 'Eid-ul-Fitr', date: '2026-03-21', description: 'Public Holiday' },
  { id: 'h-8', name: 'Ram Navami', date: '2026-03-27', description: 'Public Holiday' },
  { id: 'h-9', name: 'Mahavir Jayanti', date: '2026-03-31', description: 'Public Holiday' },
  { id: 'h-10', name: 'Good Friday', date: '2026-04-03', description: 'Public Holiday' },
  { id: 'h-11', name: 'Dr. Ambedkar Jayanti / Baisakhi', date: '2026-04-14', description: 'Public Holiday' },
  { id: 'h-12', name: 'Buddha Purnima', date: '2026-05-01', description: 'Public Holiday' },
  { id: 'h-13', name: 'Bakrid / Eid al-Adha', date: '2026-05-28', description: 'Public Holiday' },
  { id: 'h-14', name: 'Muharram', date: '2026-06-26', description: 'Public Holiday' },
  { id: 'h-15', name: 'Independence Day', date: '2026-08-15', description: 'National Holiday' },
  { id: 'h-16', name: 'Raksha Bandhan', date: '2026-08-28', description: 'Festival' },
  { id: 'h-17', name: 'Janmashtami', date: '2026-09-04', description: 'Public Holiday' },
  { id: 'h-18', name: 'Ganesh Chaturthi', date: '2026-09-14', description: 'Public Holiday' },
  { id: 'h-19', name: 'Milad-un-Nabi (Eid-e-Milad)', date: '2026-09-16', description: 'Public Holiday' },
  { id: 'h-20', name: 'Gandhi Jayanti', date: '2026-10-02', description: 'National Holiday' },
  { id: 'h-21', name: 'Dussehra (Vijayadashami)', date: '2026-10-20', description: 'Public Holiday' },
  { id: 'h-22', name: 'Diwali (Deepavali)', date: '2026-11-08', description: 'Festival of Lights' },
  { id: 'h-23', name: 'Govardhan Puja', date: '2026-11-09', description: 'Public Holiday' },
  { id: 'h-24', name: 'Bhai Dooj', date: '2026-11-10', description: 'Public Holiday' },
  { id: 'h-25', name: 'Chhath Puja', date: '2026-11-15', description: 'Major Festival' },
  { id: 'h-26', name: 'Guru Nanak Jayanti', date: '2026-11-24', description: 'Public Holiday' },
  { id: 'h-27', name: 'Christmas Day', date: '2026-12-25', description: 'Public Holiday' },
];

export const HOLIDAYS_STORAGE_KEY = 'attendance_meter_holidays_v1';

export function getStoredHolidays(): IndianHoliday[] {
  try {
    const raw = localStorage.getItem(HOLIDAYS_STORAGE_KEY);
    if (!raw) return DEFAULT_INDIAN_HOLIDAYS;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading holidays from storage', e);
    return DEFAULT_INDIAN_HOLIDAYS;
  }
}

export function saveStoredHolidays(holidays: IndianHoliday[]): void {
  try {
    localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(holidays));
  } catch (e) {
    console.error('Failed saving holidays to storage', e);
  }
}

export function isIndianHoliday(dateStr: string, holidays: IndianHoliday[]): IndianHoliday | undefined {
  // Check exact YYYY-MM-DD match or MM-DD match for recurring
  const monthDay = dateStr.slice(5); // MM-DD
  return holidays.find((h) => h.date === dateStr || h.date.slice(5) === monthDay);
}
