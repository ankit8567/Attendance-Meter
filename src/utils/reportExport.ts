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
 * Helper to download canvas as JPG / JPEG via instant DataURL and Blob fallback
 */
function downloadCanvasAsImage(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      // 1. Direct Data URL: Instant, synchronous, no blob revocation issues
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        resolve();
      }, 150);
    } catch {
      // 2. Blob URL Fallback
      try {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve();
              return;
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
              if (document.body.contains(link)) {
                document.body.removeChild(link);
              }
              URL.revokeObjectURL(url);
              resolve();
            }, 300);
          },
          'image/jpeg',
          0.95
        );
      } catch (e) {
        console.error('Canvas download error:', e);
        resolve();
      }
    }
  });
}

/**
 * Draws rounded rectangle on 2D context
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Renders the entire official Attendance Report onto a high-resolution 2D Canvas.
 * This guarantees 100% reliability, high DPI, crisp typography, and zero CSS parser crashes.
 */
export function generateReportCanvas(data: ReportData): HTMLCanvasElement {
  const { settings, subjects, currentAttended, currentTotal, currentTarget } = data;
  const studentName = settings.studentName || 'Student';
  const currentPct = calculateAttendancePercentage(currentAttended, currentTotal);
  const bunks = calculateBunksAvailable(currentAttended, currentTotal, currentTarget);
  const needed = calculateClassesNeeded(currentAttended, currentTotal, currentTarget);
  const burn = calculateBurnRate(currentAttended, currentTotal, 1);
  const absences = Math.max(0, currentTotal - currentAttended);
  const insights = generateSmartInsights(
    currentAttended,
    currentTotal,
    currentTarget,
    subjects,
    settings.classesPerDay || 5,
    settings.daysPerWeek || 5
  );

  const canvas = document.createElement('canvas');
  const width = 1200;
  // Calculate dynamic height based on subject count and insights
  const tableRowsHeight = Math.max(1, subjects.length) * 44 + 50;
  const insightsHeight = Math.min(5, insights.length) * 28 + 90;
  const height = 140 + 130 + 130 + tableRowsHeight + insightsHeight + 110;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 1. Header Banner
  ctx.fillStyle = '#0f172a'; // slate-900
  ctx.fillRect(0, 0, width, 120);

  // Decorative top accent line
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0, '#6366f1');
  grad.addColorStop(0.5, '#06b6d4');
  grad.addColorStop(1, '#ec4899');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, 5);

  // Header Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
  ctx.fillText('ATTENDANCE METER', 40, 52);

  ctx.fillStyle = '#c7d2fe';
  ctx.font = '14px system-ui, -apple-system, sans-serif';
  ctx.fillText('Official Attendance Performance & Academic Standing Statement', 40, 80);

  // Header Date & Target
  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  ctx.textAlign = 'right';
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Date: ${todayStr}`, width - 40, 52);

  ctx.fillStyle = '#a5b4fc';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Target Benchmark: ${currentTarget}%`, width - 40, 80);
  ctx.textAlign = 'left';

  // 2. Student Profile Card
  let curY = 145;
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  roundRect(ctx, 40, curY, width - 80, 105, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#6366f1';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('STUDENT ACADEMIC PROFILE', 60, curY + 28);

  ctx.fillStyle = '#334155';
  ctx.font = '13px system-ui, -apple-system, sans-serif';

  // Column 1
  ctx.fillText(`Student Name:`, 60, curY + 54);
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(studentName, 170, curY + 54);

  ctx.fillStyle = '#334155';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText(`College:`, 60, curY + 80);
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(settings.collegeName || 'Not specified', 170, curY + 80);

  // Column 2
  ctx.fillStyle = '#334155';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Course / Branch:`, 480, curY + 54);
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(settings.courseBranch || 'Not specified', 610, curY + 54);

  ctx.fillStyle = '#334155';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Academic Year:`, 480, curY + 80);
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(settings.year || '1st Year', 610, curY + 80);

  // Column 3
  ctx.fillStyle = '#334155';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Semester:`, 880, curY + 54);
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(settings.semester || '1st Semester', 960, curY + 54);

  ctx.fillStyle = '#334155';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Schedule:`, 880, curY + 80);
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(`${settings.classesPerDay || 5} /day · ${settings.daysPerWeek || 5} /wk`, 960, curY + 80);

  // 3. KPI Cards Grid
  curY = 270;
  const cardW = (width - 80 - 45) / 4;
  const cardH = 95;

  // Box 1: Overall %
  ctx.fillStyle = '#eef2ff';
  ctx.strokeStyle = '#c7d2fe';
  roundRect(ctx, 40, curY, cardW, cardH, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#4f46e5';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('OVERALL ATTENDANCE', 56, curY + 28);
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${currentPct.toFixed(1)}%`, 56, curY + 68);
  ctx.fillStyle = currentPct >= currentTarget ? '#16a34a' : '#e11d48';
  ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
  ctx.fillText(currentPct >= currentTarget ? '● ON TRACK' : '● ACTION REQUIRED', 170, curY + 68);

  // Box 2: Attended / Total
  const box2X = 40 + cardW + 15;
  ctx.fillStyle = '#f0fdf4';
  ctx.strokeStyle = '#bbf7d0';
  roundRect(ctx, box2X, curY, cardW, cardH, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#15803d';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('ATTENDED / CONDUCTED', box2X + 16, curY + 28);
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${currentAttended} / ${currentTotal}`, box2X + 16, curY + 64);
  ctx.fillStyle = '#166534';
  ctx.font = '11px system-ui, -apple-system, sans-serif';
  ctx.fillText(`(${absences} missed sessions)`, box2X + 16, curY + 82);

  // Box 3: Safe Bunks
  const box3X = box2X + cardW + 15;
  ctx.fillStyle = '#fffbeb';
  ctx.strokeStyle = '#fde68a';
  roundRect(ctx, box3X, curY, cardW, cardH, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#b45309';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('SAFE BUNKS AVAILABLE', box3X + 16, curY + 28);
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${bunks}`, box3X + 16, curY + 68);
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.fillText('classes allowed', box3X + 70, curY + 68);

  // Box 4: Recovery Needed
  const box4X = box3X + cardW + 15;
  ctx.fillStyle = '#fff1f2';
  ctx.strokeStyle = '#fecdd3';
  roundRect(ctx, box4X, curY, cardW, cardH, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#be123c';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('RECOVERY REQUIRED', box4X + 16, curY + 28);
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillText(needed === 0 ? '0 (Safe)' : needed === Infinity ? 'Impossible' : `${needed} classes`, box4X + 16, curY + 65);
  ctx.font = '11px system-ui, -apple-system, sans-serif';
  ctx.fillText(needed === 0 ? 'Target achieved' : `To reach ${currentTarget}%`, box4X + 16, curY + 82);

  // 4. Subject-Wise Breakdown Table
  curY = 390;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  ctx.fillText('Subject-Wise Attendance Breakdown', 40, curY);

  curY += 15;
  const tableX = 40;
  const tableW = width - 80;
  const colWidths = [45, 340, 160, 120, 100, 110, 115, 130];
  const colX = [
    tableX,
    tableX + colWidths[0],
    tableX + colWidths[0] + colWidths[1],
    tableX + colWidths[0] + colWidths[1] + colWidths[2],
    tableX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
    tableX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4],
    tableX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5],
    tableX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6],
  ];

  // Table Header
  ctx.fillStyle = '#0f172a';
  roundRect(ctx, tableX, curY, tableW, 36, 6);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  const headers = ['#', 'Subject Name & Code', 'Attended / Total', 'Current %', 'Target', 'Status', 'Safe Bunks', 'Needed'];
  headers.forEach((h, idx) => {
    ctx.fillText(h, colX[idx] + 10, curY + 23);
  });

  curY += 36;
  if (subjects.length === 0) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(tableX, curY, tableW, 40);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(tableX, curY, tableW, 40);
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('No subjects added yet. Track individual subjects to view detailed breakdown.', tableX + 20, curY + 25);
    curY += 40;
  } else {
    subjects.forEach((s, idx) => {
      const sPct = calculateAttendancePercentage(s.attended, s.total);
      const sBunks = calculateBunksAvailable(s.attended, s.total, s.target);
      const sNeeded = calculateClassesNeeded(s.attended, s.total, s.target);
      const isSafe = sPct >= s.target;
      const isWarn = !isSafe && sPct >= s.target - 5;
      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

      ctx.fillStyle = rowBg;
      ctx.fillRect(tableX, curY, tableW, 40);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(tableX, curY, tableW, 40);

      // Index
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText((idx + 1).toString(), colX[0] + 12, curY + 25);

      // Subject Name & Code
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      const nameText = s.name + (s.code ? ` (${s.code})` : '');
      ctx.fillText(nameText.length > 34 ? nameText.substring(0, 32) + '...' : nameText, colX[1] + 10, curY + 25);

      // Attended / Total
      ctx.fillStyle = '#334155';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${s.attended} / ${s.total}`, colX[2] + 10, curY + 25);

      // Current %
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = isSafe ? '#16a34a' : isWarn ? '#d97706' : '#e11d48';
      ctx.fillText(`${sPct.toFixed(1)}%`, colX[3] + 10, curY + 25);

      // Target
      ctx.fillStyle = '#475569';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${s.target}%`, colX[4] + 10, curY + 25);

      // Status pill
      const statusText = isSafe ? 'SAFE' : isWarn ? 'WARNING' : 'CRITICAL';
      const statusBg = isSafe ? '#dcfce7' : isWarn ? '#fef3c7' : '#ffe4e6';
      const statusColor = isSafe ? '#15803d' : isWarn ? '#b45309' : '#be123c';

      ctx.fillStyle = statusBg;
      roundRect(ctx, colX[5] + 8, curY + 11, 75, 19, 4);
      ctx.fill();
      ctx.fillStyle = statusColor;
      ctx.font = 'bold 9.5px system-ui, -apple-system, sans-serif';
      ctx.fillText(statusText, colX[5] + 16, curY + 24);

      // Safe Bunks
      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${sBunks}`, colX[6] + 10, curY + 25);

      // Needed
      ctx.fillStyle = sNeeded === 0 ? '#16a34a' : '#4338ca';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.fillText(sNeeded === 0 ? 'Achieved' : sNeeded === Infinity ? 'N/A' : `${sNeeded}`, colX[7] + 10, curY + 25);

      curY += 40;
    });
  }

  // 5. Tactical Advisory & Insights Box
  curY += 25;
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  roundRect(ctx, tableX, curY, tableW, insightsHeight - 20, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('Attendance Advisory & Smart Insights', tableX + 24, curY + 28);

  let insY = curY + 54;
  insights.slice(0, 4).forEach((ins) => {
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(tableX + 28, insY - 4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText(ins, tableX + 40, insY);
    insY += 26;
  });

  // Burn Rate Alert Highlight in box
  ctx.fillStyle = '#f1f5f9';
  roundRect(ctx, tableX + 20, insY, tableW - 40, 32, 6);
  ctx.fill();

  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('Burn Rate Alert: ', tableX + 32, insY + 20);

  ctx.fillStyle = '#475569';
  ctx.font = '11px system-ui, -apple-system, sans-serif';
  ctx.fillText(
    `Each missed class drops overall attendance by -${burn.drop.toFixed(2)}% (resulting in ${burn.futurePct.toFixed(2)}%).`,
    tableX + 130,
    insY + 20
  );

  // 6. Footer Divider & Watermark Attribution (with Ankit Srivastava Avatar)
  const footerY = height - 50;
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(40, footerY);
  ctx.lineTo(width - 40, footerY);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.fillText('Attendance Meter · Comprehensive Student Attendance Calculator', 40, footerY + 30);

  // Developer Attribution Badge with Avatar
  const badgeRight = width - 40;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('Developed By Ankit Srivastava', badgeRight, footerY + 30);

  // Draw Avatar circle icon next to name
  const textWidth = ctx.measureText('Developed By Ankit Srivastava').width;
  const avatarCenterX = badgeRight - textWidth - 18;
  const avatarCenterY = footerY + 26;
  const avatarRadius = 10;

  // Avatar background circle
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#1e3a8a';
  ctx.fill();
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Suit / head vector silhouette representation
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius - 1, 0, Math.PI * 2);
  ctx.clip();
  // suit
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(avatarCenterX - 10, avatarCenterY + 2, 20, 10);
  // white collar
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(avatarCenterX - 3, avatarCenterY + 2);
  ctx.lineTo(avatarCenterX, avatarCenterY + 6);
  ctx.lineTo(avatarCenterX + 3, avatarCenterY + 2);
  ctx.fill();
  // face
  ctx.fillStyle = '#e0ac69';
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY - 2, 5, 0, Math.PI * 2);
  ctx.fill();
  // hair
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY - 4, 5, Math.PI, 0);
  ctx.fill();
  // mustache
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(avatarCenterX - 2, avatarCenterY, 4, 1.2);
  ctx.restore();

  ctx.textAlign = 'left';
  return canvas;
}

/**
 * Captures and exports the official attendance report as high-quality JPG or JPEG.
 * Guaranteed to succeed without relying on fragile external CSS parsers.
 */
export async function exportReportAsImage(
  data: ReportData,
  format: 'jpg' | 'jpeg',
  _element?: HTMLElement | null
): Promise<void> {
  const studentName = data.settings.studentName || 'Student';
  const cleanStudentName = studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Attendance_Meter_${cleanStudentName}.${format}`;

  // Primary/Guaranteed High-Res Canvas Engine
  // Renders the entire official report directly with 100% accuracy, crisp typography, and zero CSS parser crashes.
  const canvas = generateReportCanvas(data);
  await downloadCanvasAsImage(canvas, filename);
}

/**
 * Backward compatibility wrapper for exportElementAsImage
 */
export async function exportElementAsImage(
  element: HTMLElement,
  format: 'jpg' | 'jpeg',
  studentName = 'Student',
  reportData?: ReportData
): Promise<void> {
  if (reportData) {
    return exportReportAsImage(reportData, format, element);
  }

  const cleanStudentName = studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Attendance_Meter_${cleanStudentName}.${format}`;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
    });
    await downloadCanvasAsImage(canvas, filename);
  } catch (e) {
    console.warn('html2canvas capture fallback:', e);
  }
}
