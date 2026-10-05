import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Subject, UserSettings } from '../types/attendance';
import {
  calculateAttendancePercentage,
  calculateBunksAvailable,
  calculateClassesNeeded,
  calculateBurnRate,
  generateSmartInsights,
} from './attendanceCalculations';

export interface ReportData {
  settings: UserSettings;
  subjects: Subject[];
  currentAttended: number;
  currentTotal: number;
  currentTarget: number;
}

/**
 * Generates and downloads a multi-page PDF report.
 */
export function exportReportAsPDF({
  settings,
  subjects,
  currentAttended,
  currentTotal,
  currentTarget,
}: ReportData): void {
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

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ATTENDANCE METER', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(199, 210, 254);
  doc.text('Official Attendance Report & Academic Standing Summary', 14, 23);

  // Date and Target in Header
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  doc.text(`Date: ${todayStr}`, 155, 16);
  doc.text(`Target Benchmark: ${currentTarget}%`, 155, 22);

  // Student Profile Section
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, 182, 26, 2.5, 2.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 42, 182, 26, 2.5, 2.5, 'S');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT PROFILE', 18, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Student Name: ${studentName}`, 18, 54);
  doc.text(`College: ${settings.collegeName || 'Not specified'}`, 18, 60);
  doc.text(`Course/Branch: ${settings.courseBranch || 'Not specified'}`, 18, 65);

  doc.text(`Year: ${settings.year || '1st Year'}`, 110, 54);
  doc.text(`Semester: ${settings.semester || '1st Semester'}`, 110, 60);
  doc.text(`Schedule: ${settings.classesPerDay || 5} classes/day · ${settings.daysPerWeek || 5} days/week`, 110, 65);

  // KPI Boxes
  const boxY = 72;
  const boxWidth = 43;
  const boxHeight = 20;

  // Box 1: Overall %
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(14, boxY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(79, 70, 229);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('OVERALL ATTENDANCE', 18, boxY + 5.5);
  doc.setFontSize(13);
  doc.text(`${currentPct.toFixed(1)}%`, 18, boxY + 14);

  // Box 2: Attended / Total
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(60, boxY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(7.5);
  doc.text('ATTENDED / CONDUCTED', 64, boxY + 5.5);
  doc.setFontSize(11.5);
  doc.text(`${currentAttended} / ${currentTotal}`, 64, boxY + 13.5);
  doc.setFontSize(7);
  doc.text(`(${absences} missed classes)`, 64, boxY + 17.5);

  // Box 3: Safe Bunks
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(106, boxY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(7.5);
  doc.text('SAFE BUNKS AVAILABLE', 110, boxY + 5.5);
  doc.setFontSize(13);
  doc.text(`${bunks} classes`, 110, boxY + 14);

  // Box 4: Recovery Needed
  doc.setFillColor(255, 241, 242);
  doc.roundedRect(152, boxY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(190, 18, 60);
  doc.setFontSize(7.5);
  doc.text('RECOVERY REQUIRED', 156, boxY + 5.5);
  doc.setFontSize(12);
  doc.text(needed === 0 ? '0 (Safe)' : needed === Infinity ? 'Impossible' : `${needed} classes`, 156, boxY + 14);

  // Subject Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Subject-Wise Attendance Breakdown', 14, 99);

  const tableRows = subjects.length > 0
    ? subjects.map((s, idx) => {
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
          sNeeded === 0 ? 'Target Met' : sNeeded === Infinity ? 'Impossible' : `${sNeeded} classes`,
        ];
      })
    : [['—', 'No subjects added yet', '0 / 0', '0.0%', `${currentTarget}%`, 'NO DATA', '0', '0']];

  autoTable(doc, {
    startY: 103,
    head: [['#', 'Subject Name', 'Attended/Total', 'Current %', 'Target %', 'Status', 'Safe Bunks', 'Needed']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
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
    margin: { bottom: 25 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 160;

  // Strategic Insights
  const insights = generateSmartInsights(
    currentAttended,
    currentTotal,
    currentTarget,
    subjects,
    settings.classesPerDay || 5,
    settings.daysPerWeek || 5
  );

  let curY = finalY + 8;
  if (curY > 240) {
    doc.addPage();
    curY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Attendance Advisory & Smart Insights', 14, curY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  curY += 5;
  insights.slice(0, 5).forEach((ins) => {
    doc.text(`•  ${ins}`, 16, curY);
    curY += 5;
  });

  // Burn Rate Alert Box
  if (curY > 260) {
    doc.addPage();
    curY = 20;
  }

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, curY + 2, 182, 12, 2, 2, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Burn Rate Alert:', 18, curY + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Missing 1 class will drop your attendance by -${burn.drop.toFixed(2)} percentage points (resulting in ${burn.futurePct.toFixed(2)}%).`,
    18,
    curY + 11
  );

  // Footer Watermark on all pages (Mandatory: Developed By Ankit Srivastava)
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Attendance Meter · Developed By Ankit Srivastava', 105, 290, { align: 'center' });
    doc.setFontSize(7);
    doc.text(`Page ${i} of ${pageCount}`, 196, 290, { align: 'right' });
  }

  const cleanStudentName = studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Attendance_Meter_${cleanStudentName}.pdf`);
}

/**
 * Captures an HTML element and exports it as high-quality JPG or JPEG.
 */
export async function exportElementAsImage(
  element: HTMLElement,
  format: 'jpg' | 'jpeg',
  studentName = 'Student'
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2.5, // High retina resolution
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    scrollX: 0,
    scrollY: 0,
  });

  const mimeType = 'image/jpeg';
  const dataUrl = canvas.toDataURL(mimeType, 0.95);

  const cleanStudentName = studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Attendance_Meter_${cleanStudentName}.${format}`;

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
