import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  calculateAttendancePercentage,
  calculateBunksAvailable,
  calculateClassesNeeded,
  calculateBurnRate,
} from '../utils/attendanceCalculations';
import { Watermark } from '../components/Watermark';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart2,
  FileDown,
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const {
    subjects,
    currentAttended,
    currentTotal,
    currentTarget,
    currentPercentage,
    currentAbsent,
    effectiveTheme,
    exportPDFReport,
  } = useAttendance();

  const bunksRemaining = calculateBunksAvailable(
    currentAttended,
    currentTotal,
    currentTarget
  );
  const classesNeeded = calculateClassesNeeded(
    currentAttended,
    currentTotal,
    currentTarget
  );
  const burn = calculateBurnRate(currentAttended, currentTotal, 1);

  // 1. Donut Chart Data: Present vs Absent
  const donutData = [
    { name: 'Attended Classes', value: currentAttended, color: '#10b981' },
    { name: 'Absent Classes', value: currentAbsent, color: '#f43f5e' },
  ];

  // 2. Subject Bar Chart Data
  const subjectBarData = subjects.map((s) => {
    const pct = calculateAttendancePercentage(s.attended, s.total);
    return {
      name: s.code || s.name.substring(0, 12),
      fullName: s.name,
      attendance: parseFloat(pct.toFixed(1)),
      target: s.target,
      color: s.color || '#6366f1',
    };
  });

  // 3. Attendance Trend / Projection Line Chart
  const trendData = [
    {
      step: 'Current',
      attendScenario: parseFloat(currentPercentage.toFixed(1)),
      bunkScenario: parseFloat(currentPercentage.toFixed(1)),
    },
    {
      step: '+5 Classes',
      attendScenario: parseFloat(
        calculateAttendancePercentage(currentAttended + 5, currentTotal + 5).toFixed(1)
      ),
      bunkScenario: parseFloat(
        calculateAttendancePercentage(currentAttended, currentTotal + 5).toFixed(1)
      ),
    },
    {
      step: '+10 Classes',
      attendScenario: parseFloat(
        calculateAttendancePercentage(currentAttended + 10, currentTotal + 10).toFixed(1)
      ),
      bunkScenario: parseFloat(
        calculateAttendancePercentage(currentAttended, currentTotal + 10).toFixed(1)
      ),
    },
    {
      step: '+15 Classes',
      attendScenario: parseFloat(
        calculateAttendancePercentage(currentAttended + 15, currentTotal + 15).toFixed(1)
      ),
      bunkScenario: parseFloat(
        calculateAttendancePercentage(currentAttended, currentTotal + 15).toFixed(1)
      ),
    },
    {
      step: '+20 Classes',
      attendScenario: parseFloat(
        calculateAttendancePercentage(currentAttended + 20, currentTotal + 20).toFixed(1)
      ),
      bunkScenario: parseFloat(
        calculateAttendancePercentage(currentAttended, currentTotal + 20).toFixed(1)
      ),
    },
    {
      step: '+25 Classes',
      attendScenario: parseFloat(
        calculateAttendancePercentage(currentAttended + 25, currentTotal + 25).toFixed(1)
      ),
      bunkScenario: parseFloat(
        calculateAttendancePercentage(currentAttended, currentTotal + 25).toFixed(1)
      ),
    },
  ];

  const axisTextColor = effectiveTheme === 'dark' ? '#94a3b8' : '#475569';
  const gridStroke = effectiveTheme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            Visual Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Attendance Analytics & Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            In-depth visual breakdown of your cumulative attendance metrics, trends, and projections.
          </p>
        </div>

        <button
          onClick={exportPDFReport}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl shadow-sm self-start sm:self-auto transition-colors"
        >
          <FileDown className="w-4 h-4 text-indigo-400" />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
            Current Rate
          </span>
          <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {currentPercentage.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500">Target: {currentTarget}%</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
            Total Classes
          </span>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {currentTotal}
          </div>
          <span className="text-[11px] text-slate-500">Conducted</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
            Attended
          </span>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {currentAttended}
          </div>
          <span className="text-[11px] text-emerald-600/80 dark:text-emerald-500/80">Present</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-semibold">
            Absences
          </span>
          <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
            {currentAbsent}
          </div>
          <span className="text-[11px] text-rose-600/80 dark:text-rose-500/80">Missed</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-semibold">
            Safe Bunks
          </span>
          <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {bunksRemaining}
          </div>
          <span className="text-[11px] text-slate-500">Remaining</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-semibold">
            Classes Needed
          </span>
          <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
            {classesNeeded === Infinity ? 'N/A' : classesNeeded}
          </div>
          <span className="text-[11px] text-slate-500">For {currentTarget}%</span>
        </div>
      </div>

      {/* Dual Charts: Donut (Present vs Absent) & Trend Line */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Present vs Absent Donut Chart */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <PieIcon className="w-4 h-4 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Present vs Absent
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Proportion of all attended vs missed classes to date.
          </p>

          <div className="h-56 w-full flex items-center justify-center">
            {currentTotal === 0 ? (
              <span className="text-xs text-slate-500">No classes recorded yet</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: effectiveTheme === 'dark' ? '#0f172a' : '#ffffff',
                      borderColor: effectiveTheme === 'dark' ? '#334155' : '#cbd5e1',
                      borderRadius: '12px',
                      color: effectiveTheme === 'dark' ? '#fff' : '#0f172a',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-700 dark:text-slate-300">
                Present: <strong>{currentAttended}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-700 dark:text-slate-300">
                Absent: <strong>{currentAbsent}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Attendance Projection Trend Line Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Trajectory & Projection Model
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Future trend if you attend vs bunk next classes
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Simulates the divergence between 100% attendance (green) vs 0% attendance (rose).
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.6} />
                <XAxis dataKey="step" stroke={axisTextColor} fontSize={11} />
                <YAxis
                  domain={[
                    Math.max(
                      0,
                      Math.floor(Math.min(...trendData.map((d) => d.bunkScenario)) - 5)
                    ),
                    100,
                  ]}
                  stroke={axisTextColor}
                  fontSize={11}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: effectiveTheme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: effectiveTheme === 'dark' ? '#334155' : '#cbd5e1',
                    borderRadius: '12px',
                    color: effectiveTheme === 'dark' ? '#fff' : '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(val: any) => [`${val}%`]}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(val) => (
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      {val === 'attendScenario' ? '100% Attended Pace' : 'Bunking Pace'}
                    </span>
                  )}
                />
                <ReferenceLine
                  y={currentTarget}
                  stroke="#818cf8"
                  strokeDasharray="4 4"
                  label={{
                    value: `Target ${currentTarget}%`,
                    fill: '#6366f1',
                    fontSize: 10,
                    position: 'insideBottomRight',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="attendScenario"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="bunkScenario"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Bar Chart */}
      {subjects.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Subject Attendance Comparison
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Target threshold line at {currentTarget}%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Compare attendance rates across all courses to spot at-risk subjects.
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjectBarData}
                margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.6} />
                <XAxis dataKey="name" stroke={axisTextColor} fontSize={11} interval={0} />
                <YAxis domain={[0, 100]} stroke={axisTextColor} fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: effectiveTheme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: effectiveTheme === 'dark' ? '#334155' : '#cbd5e1',
                    borderRadius: '12px',
                    color: effectiveTheme === 'dark' ? '#fff' : '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val}%`,
                    `${item.payload.fullName}`,
                  ]}
                />
                <ReferenceLine
                  y={currentTarget}
                  stroke="#ec4899"
                  strokeDasharray="4 4"
                  label={{
                    value: `Target (${currentTarget}%)`,
                    fill: '#ec4899',
                    fontSize: 11,
                    position: 'top',
                  }}
                />
                <Bar dataKey="attendance" radius={[8, 8, 0, 0]}>
                  {subjectBarData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.attendance >= entry.target
                          ? '#10b981'
                          : entry.attendance >= entry.target - 5
                          ? '#f59e0b'
                          : '#f43f5e'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Watermark */}
      <Watermark />
    </div>
  );
};
