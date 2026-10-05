import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { calculateAttendancePercentage } from '../utils/attendanceCalculations';
import { WeeklyBunkCard } from '../components/WeeklyBunkCard';
import { BurnRateCard } from '../components/BurnRateCard';
import { Watermark } from '../components/Watermark';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  CheckCircle,
  XCircle,
  Sliders,
} from 'lucide-react';

export const Simulator: React.FC = () => {
  const { currentAttended, currentTotal, currentTarget, effectiveTheme } = useAttendance();

  // Scenario A: If I Attend All
  const [attendCount, setAttendCount] = useState<number>(10);
  // Scenario B: If I Bunk All
  const [bunkCount, setBunkCount] = useState<number>(10);
  // Scenario C: Mixed
  const [mixedUpcoming, setMixedUpcoming] = useState<number>(10);
  const [mixedAttended, setMixedAttended] = useState<number>(7);

  const currentPct = calculateAttendancePercentage(currentAttended, currentTotal);

  // Scenario A Calculation
  const futureAttendedA = currentAttended + attendCount;
  const futureTotalA = currentTotal + attendCount;
  const futurePctA = calculateAttendancePercentage(futureAttendedA, futureTotalA);
  const diffA = futurePctA - currentPct;

  // Scenario B Calculation
  const futureAttendedB = currentAttended;
  const futureTotalB = currentTotal + bunkCount;
  const futurePctB = calculateAttendancePercentage(futureAttendedB, futureTotalB);
  const diffB = futurePctB - currentPct;

  // Scenario C Calculation
  const actualAttendedC = Math.min(mixedUpcoming, Math.max(0, mixedAttended));
  const actualMissedC = Math.max(0, mixedUpcoming - actualAttendedC);
  const futureAttendedC = currentAttended + actualAttendedC;
  const futureTotalC = currentTotal + mixedUpcoming;
  const futurePctC = calculateAttendancePercentage(futureAttendedC, futureTotalC);
  const diffC = futurePctC - currentPct;

  // Visual Chart Data
  const chartData = [
    {
      name: 'Current',
      attendance: parseFloat(currentPct.toFixed(2)),
      type: 'current',
    },
    {
      name: `Attend +${attendCount}`,
      attendance: parseFloat(futurePctA.toFixed(2)),
      type: futurePctA >= currentTarget ? 'safe' : 'warning',
    },
    {
      name: `Bunk -${bunkCount}`,
      attendance: parseFloat(futurePctB.toFixed(2)),
      type: futurePctB >= currentTarget ? 'safe' : 'critical',
    },
    {
      name: `Mixed (${actualAttendedC}/${mixedUpcoming})`,
      attendance: parseFloat(futurePctC.toFixed(2)),
      type: futurePctC >= currentTarget ? 'safe' : 'warning',
    },
  ];

  const axisTextColor = effectiveTheme === 'dark' ? '#94a3b8' : '#475569';
  const gridStroke = effectiveTheme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
          Future Projections
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
          Attendance Simulator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Model what-if scenarios and visualize future attendance changes before making decisions.
        </p>
      </div>

      {/* Visual Comparison Chart */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Scenario Comparison
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Visual Outcome Projection
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-indigo-500" />
              <span className="text-slate-600 dark:text-slate-400">Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400">Above Target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500" />
              <span className="text-slate-600 dark:text-slate-400">Below Target</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.6} />
              <XAxis dataKey="name" stroke={axisTextColor} fontSize={11} />
              <YAxis
                domain={[
                  Math.max(0, Math.floor(Math.min(...chartData.map((d) => d.attendance)) - 10)),
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
                formatter={(val: any) => [`${val}%`, 'Projected Attendance']}
              />
              <ReferenceLine
                y={currentTarget}
                stroke="#6366f1"
                strokeDasharray="4 4"
                label={{
                  value: `Target ${currentTarget}%`,
                  fill: '#6366f1',
                  fontSize: 11,
                  position: 'right',
                }}
              />
              <Bar dataKey="attendance" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => {
                  let fillColor = '#6366f1';
                  if (entry.type === 'safe') fillColor = '#10b981';
                  else if (entry.type === 'critical') fillColor = '#f43f5e';
                  else if (entry.type === 'warning') fillColor = '#f59e0b';
                  return <Cell key={`cell-${index}`} fill={fillColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scenario A: If I Attend */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Scenario A — If I Attend
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Simulate attending every upcoming class consecutively.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Upcoming Classes to Attend
              </label>
              <input
                type="number"
                min="1"
                value={attendCount}
                onChange={(e) => setAttendCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">
              Future Attendance
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-500">
                {futurePctA.toFixed(2)}%
              </span>
              <span className="text-xs font-bold text-emerald-500 font-mono">
                +{diffA.toFixed(2)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {futureAttendedA} attended of {futureTotalA} total classes.
            </p>
          </div>
        </div>

        {/* Scenario B: If I Bunk */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Scenario B — If I Bunk
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Simulate missing every upcoming class in this batch.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Upcoming Classes to Miss
              </label>
              <input
                type="number"
                min="1"
                value={bunkCount}
                onChange={(e) => setBunkCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border ${
              futurePctB < currentTarget
                ? 'border-rose-500/30 bg-rose-500/10'
                : 'border-amber-500/20 bg-amber-500/5'
            }`}
          >
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">
              Future Attendance
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span
                className={`text-2xl font-bold font-mono ${
                  futurePctB < currentTarget ? 'text-rose-500' : 'text-amber-500'
                }`}
              >
                {futurePctB.toFixed(2)}%
              </span>
              <span className="text-xs font-bold text-rose-500 font-mono">
                {diffB.toFixed(2)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {futureAttendedB} attended of {futureTotalB} total classes.
            </p>
          </div>
        </div>

        {/* Scenario C: Mixed */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Scenario C — Mixed Plan
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Simulate attending some classes while missing others.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Upcoming Total
                </label>
                <input
                  type="number"
                  min="1"
                  value={mixedUpcoming}
                  onChange={(e) => setMixedUpcoming(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Will Attend
                </label>
                <input
                  type="number"
                  min="0"
                  max={mixedUpcoming}
                  value={mixedAttended}
                  onChange={(e) =>
                    setMixedAttended(
                      Math.min(mixedUpcoming, Math.max(0, parseInt(e.target.value) || 0))
                    )
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border ${
              futurePctC < currentTarget
                ? 'border-rose-500/30 bg-rose-500/10'
                : 'border-cyan-500/20 bg-cyan-500/5'
            }`}
          >
            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
              <span className="uppercase font-medium">Future Attendance</span>
              <span>(Missed {actualMissedC})</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span
                className={`text-2xl font-bold font-mono ${
                  futurePctC < currentTarget ? 'text-rose-500' : 'text-cyan-500'
                }`}
              >
                {futurePctC.toFixed(2)}%
              </span>
              <span
                className={`text-xs font-bold font-mono ${
                  diffC >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {diffC >= 0 ? `+${diffC.toFixed(2)}%` : `${diffC.toFixed(2)}%`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {futureAttendedC} attended of {futureTotalC} total classes.
            </p>
          </div>
        </div>
      </div>

      {/* Burn Rate & Weekly Skip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BurnRateCard />
        <WeeklyBunkCard />
      </div>

      {/* Watermark */}
      <Watermark />
    </div>
  );
};
