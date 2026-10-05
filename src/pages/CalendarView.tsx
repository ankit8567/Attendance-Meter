import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { CalendarDayRecord, DayAttendanceStatus } from '../types/attendance';
import { isIndianHoliday } from '../utils/indianHolidays';
import { Watermark } from '../components/Watermark';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { calendar, updateCalendarDay, holidays, addHoliday, deleteHoliday, settings } =
    useAttendance();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // New holiday form modal/accordion
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSelectMonth = (mIndex: number) => {
    setCurrentDate(new Date(year, mIndex, 1));
  };

  const handleSelectYear = (y: number) => {
    setCurrentDate(new Date(y, month, 1));
  };

  // Helper to format YYYY-MM-DD reliably without UTC offset discrepancies
  const formatYMD = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDayOffset = (firstDayOfMonth + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Full calendar grid with previous, current, and upcoming month trailing days
  const days: {
    dateStr: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    targetYear: number;
    targetMonth: number;
  }[] = [];

  // 1. Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  for (let i = 0; i < startingDayOffset; i++) {
    const d = prevMonthLastDay - startingDayOffset + i + 1;
    days.push({
      dateStr: formatYMD(prevYear, prevMonth, d),
      dayNumber: d,
      isCurrentMonth: false,
      targetYear: prevYear,
      targetMonth: prevMonth,
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      dateStr: formatYMD(year, month, d),
      dayNumber: d,
      isCurrentMonth: true,
      targetYear: year,
      targetMonth: month,
    });
  }

  // 3. Upcoming next month trailing days (pad to 35 or 42 cells)
  const targetCells = days.length <= 35 ? 35 : 42;
  const trailingCount = targetCells - days.length;
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  for (let d = 1; d <= trailingCount; d++) {
    days.push({
      dateStr: formatYMD(nextYear, nextMonth, d),
      dayNumber: d,
      isCurrentMonth: false,
      targetYear: nextYear,
      targetMonth: nextMonth,
    });
  }

  // Monthly stats (holidays do NOT count as classes or absences)
  let presentDays = 0;
  let absentDays = 0;
  let partialDays = 0;
  let holidayDays = 0;
  let totalAttendedInMonth = 0;
  let totalConductedInMonth = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatYMD(year, month, d);
    const rec = calendar[dateStr];
    const hol = isIndianHoliday(dateStr, holidays);

    if (hol) {
      holidayDays++;
    }

    if (rec && rec.status !== 'holiday') {
      if (rec.status === 'present') {
        presentDays++;
        totalAttendedInMonth += rec.attendedCount ?? (settings.classesPerDay || 5);
        totalConductedInMonth += rec.totalCount ?? (settings.classesPerDay || 5);
      } else if (rec.status === 'absent') {
        absentDays++;
        totalConductedInMonth += rec.totalCount ?? (settings.classesPerDay || 5);
      } else if (rec.status === 'partial') {
        partialDays++;
        totalAttendedInMonth += rec.attendedCount ?? Math.floor((settings.classesPerDay || 5) / 2);
        totalConductedInMonth += rec.totalCount ?? (settings.classesPerDay || 5);
      }
    }
  }

  const monthlyPct =
    totalConductedInMonth > 0 ? (totalAttendedInMonth / totalConductedInMonth) * 100 : 0;

  const handleSetDayStatus = (status: DayAttendanceStatus) => {
    if (!selectedDateStr) return;
    const classesPerDay = settings.classesPerDay || 5;

    let attended = classesPerDay;
    if (status === 'absent') attended = 0;
    if (status === 'partial') attended = Math.max(1, Math.floor(classesPerDay / 2));
    if (status === 'holiday') attended = 0;

    const hol = isIndianHoliday(selectedDateStr, holidays);

    updateCalendarDay({
      date: selectedDateStr,
      status,
      attendedCount: attended,
      totalCount: status === 'holiday' ? 0 : classesPerDay,
      holidayName: hol?.name,
    });
  };

  const handleCreateHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName.trim() || !holidayDate) return;

    addHoliday({
      name: holidayName.trim(),
      date: holidayDate,
      description: 'College Holiday',
    });

    setHolidayName('');
    setHolidayDate('');
    setIsHolidayModalOpen(false);
  };

  const selectedRecord = selectedDateStr ? calendar[selectedDateStr] : null;
  const selectedHoliday = selectedDateStr ? isIndianHoliday(selectedDateStr, holidays) : null;

  // Generate list of 6 upcoming months from today for quick-navigation
  const today = new Date();
  const upcomingMonthsList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const mIdx = d.getMonth();
    const yVal = d.getFullYear();
    const mDays = new Date(yVal, mIdx + 1, 0).getDate();
    // Count holidays in this upcoming month
    let hCount = 0;
    for (let day = 1; day <= mDays; day++) {
      const dt = formatYMD(yVal, mIdx, day);
      if (isIndianHoliday(dt, holidays)) hCount++;
    }
    const isSelected = yVal === year && mIdx === month;
    return {
      name: monthNames[mIdx],
      shortName: monthNames[mIdx].slice(0, 3),
      year: yVal,
      monthIndex: mIdx,
      holidayCount: hCount,
      isSelected,
      isCurrentMonth: i === 0,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            Attendance Log & Indian Festivals
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Attendance Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log your daily classes and view major Indian college festivals & gazetted holidays.
          </p>
        </div>

        {/* Month Navigation & Add Holiday */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsHolidayModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Holidays</span>
          </button>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            Today
          </button>

          {/* Month & Year Interactive Selectors */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Month Dropdown */}
            <select
              value={month}
              onChange={(e) => handleSelectMonth(parseInt(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-white px-2 py-1 rounded-md focus:outline-none cursor-pointer"
            >
              {monthNames.map((mName, mIdx) => (
                <option key={mIdx} value={mIdx} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  {mName}
                </option>
              ))}
            </select>

            {/* Year Dropdown */}
            <select
              value={year}
              onChange={(e) => handleSelectYear(parseInt(e.target.value))}
              className="bg-transparent text-xs font-bold text-indigo-600 dark:text-indigo-400 px-1 py-1 rounded-md focus:outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((yVal) => (
                <option key={yVal} value={yVal} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  {yVal}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Months Quick-Navigation Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Upcoming Academic Months & Semesters
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            Click any upcoming month to view & plan
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {upcomingMonthsList.map((mItem, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentDate(new Date(mItem.year, mItem.monthIndex, 1));
                setSelectedDateStr(null);
              }}
              className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                mItem.isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <span>{mItem.name} {mItem.year}</span>
              {mItem.holidayCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    mItem.isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  }`}
                  title={`${mItem.holidayCount} holiday(s) in ${mItem.name}`}
                >
                  {mItem.holidayCount} {mItem.holidayCount === 1 ? 'holiday' : 'holidays'}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Legend & College Holiday Note */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>🟢 Present</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>🔴 Absent</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>🟡 Partial</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span>🟠 Common/Public Holiday</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Holidays do not count as classes or absences. Individual colleges may vary.</span>
        </div>
      </div>

      {/* Monthly Statistics Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Monthly Rate</span>
            <p className="text-xl font-bold font-mono text-indigo-400 mt-0.5">
              {totalConductedInMonth > 0 ? `${monthlyPct.toFixed(1)}%` : '—'}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center">
            <span className="text-[10px] text-emerald-400 uppercase font-medium">Present Days</span>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{presentDays}</p>
          </div>

          <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center">
            <span className="text-[10px] text-amber-400 uppercase font-medium">Partial Days</span>
            <p className="text-xl font-bold font-mono text-amber-400 mt-0.5">{partialDays}</p>
          </div>

          <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-center">
            <span className="text-[10px] text-rose-400 uppercase font-medium">Absent Days</span>
            <p className="text-xl font-bold font-mono text-rose-400 mt-0.5">{absentDays}</p>
          </div>

          <div className="p-3 rounded-xl border border-orange-500/20 bg-orange-500/5 text-center">
            <span className="text-[10px] text-orange-400 uppercase font-medium">Holidays</span>
            <p className="text-xl font-bold font-mono text-orange-400 mt-0.5">{holidayDays}</p>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 shadow-sm">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-semibold text-slate-400">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div className="text-indigo-400/80">Sat</div>
          <div className="text-indigo-400/80">Sun</div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day, idx) => {
            const record = calendar[day.dateStr];
            const holiday = isIndianHoliday(day.dateStr, holidays);
            const isSelected = selectedDateStr === day.dateStr;
            const todayDateStr = formatYMD(today.getFullYear(), today.getMonth(), today.getDate());
            const isToday = day.dateStr === todayDateStr;

            let statusBg = 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
            let dotEl = null;

            if (holiday) {
              dotEl = <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 shadow-sm shadow-orange-500/50" title={holiday.name} />;
            }

            if (record) {
              if (record.status === 'present') {
                statusBg = 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400';
              } else if (record.status === 'absent') {
                statusBg = 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-400';
              } else if (record.status === 'partial') {
                statusBg = 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400';
              } else if (record.status === 'holiday') {
                statusBg = 'bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-500/30 text-orange-700 dark:text-orange-400';
              }
            } else if (holiday) {
              statusBg = 'bg-orange-50/70 dark:bg-orange-950/20 border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-400';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (day.isCurrentMonth) {
                    setSelectedDateStr(day.dateStr);
                  } else {
                    // Navigate directly to the month of the clicked day and select it
                    setCurrentDate(new Date(day.targetYear, day.targetMonth, 1));
                    setSelectedDateStr(day.dateStr);
                  }
                }}
                className={`min-h-[58px] sm:min-h-[76px] p-1.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                  !day.isCurrentMonth
                    ? 'opacity-40 hover:opacity-90 border-dashed border-slate-300 dark:border-slate-700'
                    : isSelected
                    ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20'
                    : 'hover:border-slate-400 dark:hover:border-slate-600'
                } ${statusBg}`}
                title={!day.isCurrentMonth ? `Jump to ${day.dateStr}` : day.dateStr}
              >
                <div className="flex items-center justify-between w-full px-0.5">
                  <span
                    className={`text-xs font-mono font-semibold ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                  {dotEl}
                </div>

                <div className="w-full text-left truncate px-0.5">
                  {holiday && (
                    <span className="block text-[9px] font-semibold text-orange-600 dark:text-orange-400 truncate">
                      {holiday.name}
                    </span>
                  )}
                  {record && record.status !== 'holiday' && (
                    <span className="block text-[9px] font-mono font-bold capitalize">
                      {record.status}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Inspector / Action Box */}
      {selectedDateStr && (
        <div className="rounded-2xl border border-indigo-500/30 dark:border-indigo-500/40 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 p-5 shadow-xl animate-in slide-in-from-bottom-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">
                Daily Attendance Action
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Date: {selectedDateStr}</h4>
              {selectedHoliday && (
                <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-orange-700 dark:text-orange-300 bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>{selectedHoliday.name} (Common/Public Holiday)</span>
                </div>
              )}
            </div>

            {selectedRecord && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Current Log:{' '}
                <strong className="capitalize text-slate-900 dark:text-white">{selectedRecord.status}</strong>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleSetDayStatus('present')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/20 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Mark Present (Full Day)</span>
            </button>

            <button
              onClick={() => handleSetDayStatus('partial')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/20 hover:bg-amber-500/20 dark:hover:bg-amber-500/30 border border-amber-500/30 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Mark Partial</span>
            </button>

            <button
              onClick={() => handleSetDayStatus('absent')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-500/10 dark:bg-rose-500/20 hover:bg-rose-500/20 dark:hover:bg-rose-500/30 border border-rose-500/30 transition-colors"
            >
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Mark Absent (Bunk)</span>
            </button>

            <button
              onClick={() => handleSetDayStatus('holiday')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-orange-700 dark:text-orange-300 bg-orange-500/10 dark:bg-orange-500/20 hover:bg-orange-500/20 dark:hover:bg-orange-500/30 border border-orange-500/30 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>Mark Holiday / Off Day</span>
            </button>

            {selectedRecord && (
              <button
                onClick={() => {
                  const updatedCalendar = { ...calendar };
                  delete updatedCalendar[selectedDateStr];
                  // Context doesn't have deleteDay directly, but we can set null or holiday
                  updateCalendarDay({
                    date: selectedDateStr,
                    status: 'holiday',
                    attendedCount: 0,
                    totalCount: 0,
                  });
                  setSelectedDateStr(null);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700/60 transition-colors"
              >
                Clear Log
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Months & Semester Planning Guide */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-500" />
              <span>Upcoming Semester Months & Holiday Calendar</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Preview upcoming academic schedule, plan your exam preparations, festival vacations, and safe bunks in advance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcomingMonthsList.slice(1).map((upMonth, uIdx) => {
            const mDays = new Date(upMonth.year, upMonth.monthIndex + 1, 0).getDate();
            // Collect holidays for this upcoming month
            const mHolidays: string[] = [];
            for (let day = 1; day <= mDays; day++) {
              const dt = formatYMD(upMonth.year, upMonth.monthIndex, day);
              const hol = isIndianHoliday(dt, holidays);
              if (hol && !mHolidays.includes(hol.name)) {
                mHolidays.push(`${day} ${upMonth.shortName}: ${hol.name}`);
              }
            }

            return (
              <div
                key={uIdx}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-800/40 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {upMonth.name} {upMonth.year}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                      {mDays} Days
                    </span>
                  </div>

                  <div className="mt-2 text-xs space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                      Festivals & Holidays ({mHolidays.length}):
                    </span>
                    {mHolidays.length > 0 ? (
                      <ul className="space-y-0.5 max-h-20 overflow-y-auto">
                        {mHolidays.map((hName, hIndex) => (
                          <li key={hIndex} className="text-[11px] text-amber-600 dark:text-amber-400 truncate flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>{hName}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No gazetted holidays listed</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentDate(new Date(upMonth.year, upMonth.monthIndex, 1));
                    setSelectedDateStr(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 transition-colors text-center"
                >
                  Open {upMonth.shortName} Calendar →
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indian Holidays Management Modal */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 text-slate-900 dark:text-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Indian College Holidays & Festivals</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Major festivals & custom college leaves. College holidays do not penalize attendance.
                </p>
              </div>
              <button
                onClick={() => setIsHolidayModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Add Custom Holiday Form */}
            <form onSubmit={handleCreateHoliday} className="py-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Add Custom College Holiday / Leave
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Holiday Name (e.g. Sports Day)"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="date"
                  required
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white transition-colors"
              >
                Add Holiday
              </button>
            </form>

            {/* List of Holidays */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {holidays.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{h.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-mono">Date: {h.date}</span>
                  </div>
                  <button
                    onClick={() => deleteHoliday(h.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete holiday"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Watermark */}
      <Watermark />
    </div>
  );
};
