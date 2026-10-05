import { AttendanceStatusResult, Subject } from '../types/attendance';

/**
 * Calculates current attendance percentage.
 * Returns a float between 0 and 100.
 */
export function calculateAttendancePercentage(attended: number, total: number): number {
  if (total <= 0) return 0;
  if (attended < 0) return 0;
  const pct = (attended / total) * 100;
  return Math.min(100, Math.max(0, pct));
}

/**
 * Calculates the maximum whole number of additional classes a student can miss (bunk)
 * while keeping attendance >= target.
 * Formula: A / (T + x) >= p  =>  x <= (A / p) - T
 */
export function calculateBunksAvailable(
  attended: number,
  total: number,
  targetPercentage: number
): number {
  if (total <= 0 || targetPercentage <= 0) return 0;
  const p = targetPercentage / 100;
  if (p > 1) return 0;
  
  // If already below target, no bunks allowed
  const currentPct = calculateAttendancePercentage(attended, total);
  if (currentPct < targetPercentage) {
    return 0;
  }

  const maxTotalAllowed = attended / p;
  const additionalAbsences = Math.floor(maxTotalAllowed - total);
  return Math.max(0, additionalAbsences);
}

/**
 * Calculates the consecutive classes a student must attend to reach or exceed target.
 * Formula: (A + x) / (T + x) >= p  =>  x >= (p*T - A) / (1 - p)
 * Returns Infinity if target is 100% and any class was already missed.
 */
export function calculateClassesNeeded(
  attended: number,
  total: number,
  targetPercentage: number
): number {
  if (targetPercentage <= 0) return 0;
  if (total <= 0) return 0;

  const currentPct = calculateAttendancePercentage(attended, total);
  if (currentPct >= targetPercentage) {
    return 0;
  }

  const p = targetPercentage / 100;
  if (p >= 1) {
    // If they have missed even 1 class, they can never reach 100% again
    if (attended < total) {
      return Infinity;
    }
    return 0;
  }

  const required = Math.ceil((p * total - attended) / (1 - p));
  return Math.max(0, required);
}

/**
 * Formats a number of classes into days and classes based on classesPerDay.
 * e.g., 9 classes with 5/day => "1 day + 4 classes"
 */
export function formatClassesToDays(classes: number, classesPerDay: number): {
  days: number;
  remainderClasses: number;
  formattedString: string;
} {
  if (classes === Infinity) {
    return { days: Infinity, remainderClasses: 0, formattedString: 'Mathematically impossible' };
  }
  if (classes <= 0) {
    return { days: 0, remainderClasses: 0, formattedString: '0 classes' };
  }
  const cpd = Math.max(1, classesPerDay || 5);
  const days = Math.floor(classes / cpd);
  const remainderClasses = classes % cpd;

  let formatted = '';
  if (days === 0) {
    formatted = `${remainderClasses} ${remainderClasses === 1 ? 'class' : 'classes'}`;
  } else if (remainderClasses === 0) {
    formatted = `${days} ${days === 1 ? 'day' : 'days'}`;
  } else {
    formatted = `${days} ${days === 1 ? 'day' : 'days'} + ${remainderClasses} ${
      remainderClasses === 1 ? 'class' : 'classes'
    }`;
  }

  return { days, remainderClasses, formattedString: formatted };
}

/**
 * Calculates burn rate (percentage drop) when missing specified number of classes.
 * Accurately computes future attendance and difference.
 */
export function calculateBurnRate(
  attended: number,
  total: number,
  missedClasses: number
): {
  futurePct: number;
  drop: number;
  futureTotal: number;
} {
  if (total <= 0) {
    return { futurePct: 0, drop: 0, futureTotal: 0 };
  }
  const currentPct = calculateAttendancePercentage(attended, total);
  const futureTotal = total + missedClasses;
  const futurePct = calculateAttendancePercentage(attended, futureTotal);
  const drop = Math.max(0, currentPct - futurePct);

  return {
    futurePct,
    drop,
    futureTotal,
  };
}

/**
 * Dynamic status assessment based on attendance and target.
 */
export function getAttendanceStatus(
  percentage: number,
  targetPercentage: number,
  attended = 0,
  total = 0,
  classesPerDay = 5
): AttendanceStatusResult {
  if (total === 0) {
    return {
      category: 'warning',
      title: 'No Data Yet',
      message: 'Enter your attendance figures or add subjects to get real-time status and advice.',
      colorClass: 'text-amber-400',
      borderClass: 'border-amber-500/20',
      bgClass: 'bg-amber-500/10',
      badgeBg: 'bg-amber-500/20 text-amber-300',
    };
  }

  const bunks = calculateBunksAvailable(attended, total, targetPercentage);
  const needed = calculateClassesNeeded(attended, total, targetPercentage);
  const daysObj = formatClassesToDays(bunks, classesPerDay);
  const neededDays = formatClassesToDays(needed, classesPerDay);

  if (percentage >= targetPercentage) {
    const diff = (percentage - targetPercentage).toFixed(1);
    let msg = `Your attendance is ${percentage.toFixed(1)}% (${diff}% above your ${targetPercentage}% target).`;
    if (bunks > 0) {
      msg += ` You can safely miss ${bunks} more ${
        bunks === 1 ? 'class' : 'classes'
      } (~${daysObj.formattedString}) while maintaining >= ${targetPercentage}%.`;
    } else {
      msg += ` You are right at your boundary; any missed class will push you below ${targetPercentage}%.`;
    }

    return {
      category: 'safe',
      title: "You're Safe",
      message: msg,
      colorClass: 'text-emerald-400',
      borderClass: 'border-emerald-500/30',
      bgClass: 'bg-emerald-500/10',
      badgeBg: 'bg-emerald-500/20 text-emerald-300',
    };
  }

  // Warning if within 5 percentage points below target
  if (percentage >= targetPercentage - 5) {
    const msg = `Your attendance is ${percentage.toFixed(1)}% (just ${(
      targetPercentage - percentage
    ).toFixed(1)}% below your ${targetPercentage}% target). Attend ${needed} consecutive ${
      needed === 1 ? 'class' : 'classes'
    } (~${neededDays.formattedString}) to get back on track.`;

    return {
      category: 'warning',
      title: 'Attendance Warning',
      message: msg,
      colorClass: 'text-amber-400',
      borderClass: 'border-amber-500/30',
      bgClass: 'bg-amber-500/10',
      badgeBg: 'bg-amber-500/20 text-amber-300',
    };
  }

  // Critical if > 5 percentage points below target
  let msg = `Your attendance is ${percentage.toFixed(1)}%, critically below your ${targetPercentage}% target.`;
  if (needed === Infinity) {
    msg += ` Target of 100% cannot be achieved because classes were already missed.`;
  } else {
    msg += ` You must attend ${needed} consecutive ${
      needed === 1 ? 'class' : 'classes'
    } (~${neededDays.formattedString}) to safely recover.`;
  }

  return {
    category: 'critical',
    title: 'Attendance Critical',
    message: msg,
    colorClass: 'text-rose-400',
    borderClass: 'border-rose-500/30',
    bgClass: 'bg-rose-500/10',
    badgeBg: 'bg-rose-500/20 text-rose-300',
  };
}

/**
 * Calculates aggregate stats across all subjects.
 * Strictly calculates: sum(attended) / sum(total) * 100
 * NOT simple average of percentages.
 */
export function calculateAggregateAttendance(subjects: Subject[]): {
  totalAttended: number;
  totalClasses: number;
  totalAbsent: number;
  overallPercentage: number;
} {
  if (!subjects || subjects.length === 0) {
    return {
      totalAttended: 0,
      totalClasses: 0,
      totalAbsent: 0,
      overallPercentage: 0,
    };
  }

  let totalAttended = 0;
  let totalClasses = 0;

  for (const s of subjects) {
    totalAttended += Math.max(0, s.attended);
    totalClasses += Math.max(0, s.total);
  }

  const totalAbsent = Math.max(0, totalClasses - totalAttended);
  const overallPercentage = calculateAttendancePercentage(totalAttended, totalClasses);

  return {
    totalAttended,
    totalClasses,
    totalAbsent,
    overallPercentage,
  };
}

/**
 * Generates rule-based smart insights from actual user data.
 */
export function generateSmartInsights(
  attended: number,
  total: number,
  target: number,
  subjects: Subject[],
  classesPerDay: number,
  daysPerWeek: number
): string[] {
  const insights: string[] = [];
  if (total === 0) {
    return [
      'Enter your attendance figures or add your subjects to activate real-time predictive insights.',
    ];
  }

  const currentPct = calculateAttendancePercentage(attended, total);
  const bunks = calculateBunksAvailable(attended, total, target);
  const needed = calculateClassesNeeded(attended, total, target);

  // 1. Overall target insight
  if (currentPct >= target) {
    insights.push(`Your attendance (${currentPct.toFixed(1)}%) is currently above your ${target}% target.`);
    if (bunks > 0) {
      const days = formatClassesToDays(bunks, classesPerDay).formattedString;
      insights.push(`You can safely miss up to ${bunks} more classes (${days}) before dipping below your target.`);
    } else {
      insights.push(`Caution: You have 0 bunks remaining. Any missed class will drop you below ${target}%.`);
    }
  } else {
    insights.push(`Your attendance (${currentPct.toFixed(1)}%) is below your ${target}% target.`);
    if (needed === Infinity) {
      insights.push(`A 100% target is impossible since absences already occurred. Consider setting a target of 90% or 85%.`);
    } else {
      const days = formatClassesToDays(needed, classesPerDay).formattedString;
      insights.push(`You need to attend ${needed} consecutive classes (~${days}) to reach your target of ${target}%.`);
    }
  }

  // 2. Weekly Skip Impact insight
  const weekClasses = classesPerDay * daysPerWeek;
  const weeklyFuture = calculateBurnRate(attended, total, weekClasses);
  insights.push(
    `Skipping an entire week (${weekClasses} classes) would reduce your attendance from ${currentPct.toFixed(
      1
    )}% to ${weeklyFuture.futurePct.toFixed(1)}% (a drop of ${weeklyFuture.drop.toFixed(1)}%).`
  );

  // 3. Subject-specific insights
  if (subjects && subjects.length > 0) {
    const validSubjects = subjects.filter((s) => s.total > 0);
    if (validSubjects.length > 0) {
      // Find weakest and strongest
      const sorted = [...validSubjects].sort((a, b) => {
        const pctA = calculateAttendancePercentage(a.attended, a.total);
        const pctB = calculateAttendancePercentage(b.attended, b.total);
        return pctA - pctB;
      });

      const weakest = sorted[0];
      const strongest = sorted[sorted.length - 1];

      const weakestPct = calculateAttendancePercentage(weakest.attended, weakest.total);
      const strongestPct = calculateAttendancePercentage(strongest.attended, strongest.total);

      if (weakestPct < weakest.target) {
        const req = calculateClassesNeeded(weakest.attended, weakest.total, weakest.target);
        insights.push(
          `Your weakest subject is ${weakest.name} at ${weakestPct.toFixed(1)}%. You need ${req} consecutive classes to reach ${weakest.target}%.`
        );
      } else {
        insights.push(
          `Your lowest subject is ${weakest.name} at ${weakestPct.toFixed(1)}% (still above target).`
        );
      }

      if (strongest.id !== weakest.id && strongestPct >= strongest.target) {
        const strongBunks = calculateBunksAvailable(strongest.attended, strongest.total, strongest.target);
        insights.push(
          `Strongest subject: ${strongest.name} at ${strongestPct.toFixed(1)}% with ${strongBunks} safe bunks available.`
        );
      }
    }
  }

  // 4. Single class burn rate
  const singleBurn = calculateBurnRate(attended, total, 1);
  insights.push(`Single missed class burn rate: -${singleBurn.drop.toFixed(2)}% percentage points.`);

  return insights;
}
