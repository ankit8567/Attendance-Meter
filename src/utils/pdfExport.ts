import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subject, UserSettings } from '../types/attendance';
import {
  calculateAttendancePercentage,
  calculateBunksAvailable,
  calculateClassesNeeded,
  calculateBurnRate,
  generateSmartInsights,
} from './attendanceCalculations';

interface GeneratePDFParams {
  settings: UserSettings;
  subjects: Subject[];
  currentAttended: number;
  currentTotal: number;
  currentTarget: number;
}

export function generateAttendancePDF({
  settings,
  subjects,
  currentAttended,
  currentTotal,
  currentTarget,
}: GeneratePDFParams): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const studentName = settings.studentName || 'Student';
  const currentPct = calculateAttendancePercentage(currentAttended, currentTotal);
  const bunks = calculateBunksAvailable(currentAttended, currentTotal, currentTarget);
  const needed = calculateClassesNeeded(currentAttended, currentTotal, currentTarget);
  const burn = calculateBurnRate(currentAttended, currentTotal, 1);
  const absences = Math.max(0, currentTotal - currentAttended);

  // Background header banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 40, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('ATTENDANCE METER', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254); // indigo-200
  doc.text('Official Attendance Performance & Bunk Advisory Report', 14, 24);

  // Date
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  doc.text(`Generated: ${todayStr}`, 155, 18);
  doc.text(`Target Benchmark: ${currentTarget}%`, 155, 24);

  // Student Profile Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 45, 182, 28, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 45, 182, 28, 3, 3, 'S');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT PROFILE', 18, 51);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Name: ${studentName}`, 18, 58);
  doc.text(`College: ${settings.collegeName || 'Not specified'}`, 18, 64);
  doc.text(`Branch / Course: ${settings.courseBranch || 'Not specified'}`, 18, 70);

  doc.text(`Year: ${settings.year || 'Not specified'}`, 110, 58);
  doc.text(`Semester: ${settings.semester || 'Not specified'}`, 110, 64);
  doc.text(`Daily Pace: ${settings.classesPerDay || 5} classes/day · ${settings.daysPerWeek || 5} days/week`, 110, 70);

  // Executive Summary KPI boxes
  const boxY = 78;
  const boxWidth = 43;
  const boxHeight = 22;

  // Box 1: Overall %
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(14, boxY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(79, 70, 229);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('OVERALL ATTENDANCE', 18, boxY + 6);
  doc.setFontSize(14);
  doc.text(`${currentPct.toFixed(1)}%`, 18, boxY + 16);

  // Box 2: Attended / Total
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(60, boxY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(7.5);
  doc.text('ATTENDED / TOTAL', 64, boxY + 6);
  doc.setFontSize(12);
  doc.text(`${currentAttended} / ${currentTotal}`, 64, boxY + 15);
  doc.setFontSize(7);
  doc.text(`(${absences} absences)`, 64, boxY + 19);

  // Box 3: Safe Bunks
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(106, boxY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(7.5);
  doc.text('SAFE BUNKS AVAILABLE', 110, boxY + 6);
  doc.setFontSize(14);
  doc.text(`${bunks} classes`, 110, boxY + 16);

  // Box 4: Needed for Target
  doc.setFillColor(255, 241, 242);
  doc.roundedRect(152, boxY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(190, 18, 60);
  doc.setFontSize(7.5);
  doc.text('RECOVERY CLASSES', 156, boxY + 6);
  doc.setFontSize(14);
  doc.text(needed === 0 ? '0 (Safe)' : needed === Infinity ? 'Impossible' : `${needed} classes`, 156, boxY + 16);

  // Subject Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Subject-Wise Attendance Breakdown', 14, 108);

  const tableRows = subjects.map((s, idx) => {
    const sPct = calculateAttendancePercentage(s.attended, s.total);
    const sBunks = calculateBunksAvailable(s.attended, s.total, s.target);
    const sNeeded = calculateClassesNeeded(s.attended, s.total, s.target);
    const status = sPct >= s.target ? 'SAFE' : sPct >= s.target - 5 ? 'WARNING' : 'CRITICAL';

    return [
      (idx + 1).toString(),
      s.name + (s.code ? ` (${s.code})` : ''),
      `${s.attended} / ${s.total}`,
      `${sPct.toFixed(1)}%`,
      `${s.target}%`,
      status,
      `${sBunks} classes`,
      sNeeded === 0 ? 'Achieved' : sNeeded === Infinity ? 'Impossible' : `${sNeeded} classes`,
    ];
  });

  autoTable(doc, {
    startY: 112,
    head: [['#', 'Subject Name', 'Attended/Total', 'Current %', 'Target %', 'Status', 'Safe Bunks', 'Needed']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      halign: 'center',
    },
    columnStyles: {
      1: { halign: 'left', fontStyle: 'bold' },
    },
    styles: {
      cellPadding: 2,
    },
  });

  // Calculate position after table
  const finalY = (doc as any).lastAutoTable?.finalY || 180;

  // Strategic Insights & Projections
  const insights = generateSmartInsights(
    currentAttended,
    currentTotal,
    currentTarget,
    subjects,
    settings.classesPerDay || 5,
    settings.daysPerWeek || 5
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Tactical Bunk & Recovery Advisory', 14, finalY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  let insightY = finalY + 16;
  insights.slice(0, 5).forEach((ins) => {
    doc.text(`•  ${ins}`, 16, insightY);
    insightY += 5.5;
  });

  // Burn Rate Note
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, insightY + 2, 182, 14, 2, 2, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Burn Rate Alert:', 18, insightY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Missing 1 class will drop your attendance by -${burn.drop.toFixed(2)} percentage points (resulting in ${burn.futurePct.toFixed(2)}%).`,
    18,
    insightY + 12
  );

  // Footer Watermark (Mandatory: Developed By Ankit Srivastava)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Attendance Meter · Developed By Ankit Srivastava', 105, 287, { align: 'center' });

  // Save the PDF
  const cleanStudentName = studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Attendance_Meter_${cleanStudentName}.pdf`);
}
