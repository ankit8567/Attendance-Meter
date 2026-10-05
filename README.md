# 🎓 Attendance Meter

<div align="center">

```
   ___ _   _                 _                         __  __     _            
  / _ \ |_| |_ ___ _ __   __| | __ _ _ __   ___ ___   |  \/  |___| |_ ___ _ __ 
 / /_\ \ __| __/ _ \ '_ \ / _` |/ _` | '_ \ / __/ _ \  | |\/| / _ \ __/ _ \ '__|
/ /_\\ \ |_| ||  __/ | | | (_| | (_| | | | | (_|  __/  | |  |  __/ ||  __/ |   
\____/\__|\__\___|_| |_|\__,_|\__,_|_| |_|\___\___|  |_|  |_|\___|\__\___|_|   
```

### *“Know your attendance. Plan your bunks. Stay on target.”*

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Local First](https://img.shields.io/badge/Storage-100%25_LocalFirst-10B981?style=for-the-badge&logo=databricks&logoColor=white)](#-privacy--local-first-storage)
[![Author](https://img.shields.io/badge/Developed_By-Ankit_Srivastava-8B5CF6?style=for-the-badge)](#-author--developer)

<br/>

**Attendance Meter** is an intelligent, privacy-first attendance management and tactical bunk planning dashboard engineered specifically for college students. It combines real-time statistical modeling, what-if simulators, burn rate calculations, Indian academic holiday tracking, and high-fidelity multi-page PDF & JPG export statements.

</div>

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [🧮 Mathematical Formulas & Logic](#-mathematical-formulas--logic)
- [🖥️ Screenshots & Modules](#-screenshots--modules)
  - [1. First-Time Setup Wizard](#1-first-time-setup-wizard)
  - [2. Command Center Dashboard](#2-command-center-dashboard)
  - [3. Can I Bunk? & Bunking Limits](#3-can-i-bunk--bunking-limits)
  - [4. Target Recovery Planner](#4-target-recovery-planner)
  - [5. Mathematical Burn Rate & Weekly Skip Simulator](#5-mathematical-burn-rate--weekly-skip-simulator)
  - [6. Subject-Wise Course Management](#6-subject-wise-course-management)
  - [7. Indian Academic Calendar & Gazetted Holidays](#7-indian-academic-calendar--gazetted-holidays)
  - [8. Visual Analytics & Projection Modeling](#8-visual-analytics--projection-modeling)
  - [9. Multi-Format Report Exporter (PDF / JPG / JPEG)](#9-multi-format-report-exporter-pdf--jpg--jpeg)
- [🌓 Universal Dark, Light & System Themes](#-universal-dark-light--system-themes)
- [📱 Responsive Layout System](#-responsive-layout-system)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Architecture](#-project-architecture)
- [🚀 Quick Start & Installation](#-quick-start--installation)
- [🔒 Privacy & Local-First Storage](#-privacy--local-first-storage)
- [👨‍💻 Author & Developer](#-author--developer)
- [📄 License](#-license)

---

## ✨ Key Features

- **🚀 First-Time Onboarding Wizard:** 3-step structured setup configuring student academic profile, overall baseline, and initial courses without pre-populated demo slop.
- **🛡️ "Can I Bunk?" Simulator:** Accurately computes future attendance percentage if 1 class, 1 day, 2 days, 3 days, 1 week, or custom sessions are missed.
- **🎯 Maximum Bunk Limit:** Calculates exact maximum allowable absences while keeping standing $\ge \text{Target}\%$.
- **📈 Target Recovery Planner:** Predicts the exact number of consecutive classes a student must attend to reach 75%, 80%, 85%, 90%, or custom goals.
- **🔥 Mathematical Burn Rate:** Dynamic calculus showing how rapidly attendance drops with each subsequent absence based on total conducted sessions.
- **🗓️ Indian Academic Calendar:** Log daily attendance (🟢 Present, 🔴 Absent, 🟡 Partial) alongside major Indian college holidays and festivals (Republic Day, Holi, Eid, Diwali, Gandhi Jayanti, etc.).
- **📚 Unlimited Subject Management:** Track individual courses with dedicated attendance tracking, subject-specific bunk limits, and color tags.
- **📊 Deep Visual Analytics (Recharts):** Interactive donut charts, trajectory trendlines, and comparative subject bar charts with target reference lines.
- **📄 One-Click Official Export:** Prominently accessible on the Home Dashboard. Generates multi-page official PDF reports, high-resolution 2.5x retina JPG, and JPEG files featuring real student data and attribution.
- **🌓 Dual Dark & Light Themes:** Zero-flicker theme persistence with automatic system preference detection.
- **📱 Touch & Mobile Optimized:** Adaptive mobile bottom navigation bar and desktop sticky sidebar with 100% responsive grid.

---

## 🧮 Mathematical Formulas & Logic

Attendance Meter operates on mathematically rigorous formulas:

### 1. Current Attendance Percentage
$$\text{Attendance } \% = \left(\frac{\text{Attended Classes}}{\text{Total Classes}}\right) \times 100$$

### 2. Maximum Safe Bunks
To find the maximum classes $B$ you can miss while keeping attendance $\ge T$ (where $t = T / 100$):
$$\frac{A}{N + B} \ge t \implies B = \left\lfloor \frac{A - t \cdot N}{t} \right\rfloor$$
*(If $A / N < t$, Safe Bunks = 0)*

### 3. Classes Required to Reach Target
To find consecutive classes $X$ needed to bring attendance up to target $T$ (where $t = T / 100$):
$$\frac{A + X}{N + X} \ge t \implies X = \left\lceil \frac{t \cdot N - A}{1 - t} \right\rceil$$
*(If $t \ge 1.0$ and $A < N$, mathematical recovery is impossible within finite sessions)*

### 4. Mathematical Attendance Burn Rate
The percentage drop $\Delta$ incurred after missing $m$ classes:
$$\Delta = \left(\frac{A}{N} \times 100\right) - \left(\frac{A}{N + m} \times 100\right) = 100 \cdot A \left( \frac{1}{N} - \frac{1}{N + m} \right) = \frac{100 \cdot A \cdot m}{N(N + m)}$$

### 5. Multi-Subject Aggregate Rule
Overall college attendance is calculated strictly as total sessions attended across all subjects divided by total sessions conducted:
$$\text{Overall } \% = \left( \frac{\sum_{i=1}^k A_i}{\sum_{i=1}^k N_i} \right) \times 100$$
*(Never computed by naively averaging percentage numbers)*

---

## 🖥️ Modules & Architecture

### 1. First-Time Setup Wizard
- **Step 1:** Student Profile (Name, College, Course/Branch, Year, Semester).
- **Step 2:** Overall Attendance (Total Classes, Attended Classes, Target %, Classes/Day, Days/Week).
- **Step 3:** Subject-Wise Setup (Add real courses or proceed directly).

### 2. Command Center Dashboard
- SVG Animated Circular Progress Ring with dynamic color status:
  - 🟢 **Safe:** Attendance $\ge \text{Target}\%$
  - 🟡 **Warning:** Attendance within 5% below target
  - 🔴 **Critical:** Attendance $> 5\%$ below target
- Quick counter tiles: Attended, Total, Absent.
- Quick navigation shortcuts to all planning tools.

### 3. Can I Bunk? & Bunking Limits
- Preset absence chips: `1 Class`, `1 Day`, `2 Days`, `3 Days`, `1 Week`, or custom inputs.
- Automatically converts calendar days into class hours based on student schedule.
- Instant safety diagnosis and projected percentage preview.

### 4. Target Recovery Planner
- Instant presets: `75%`, `80%`, `85%`, `90%`, and custom targets.
- Displays exact consecutive sessions and estimated college days required.

### 5. Mathematical Burn Rate & Weekly Skip Simulator
- Non-linear drop calculations for 1 class, 1 day, and 1 week.
- Vacation planner: Visualizes what happens to your semester standing if you skip college for an entire week.

### 6. Subject-Wise Course Management
- Individual subject cards with direct `+ Present` and `+ Absent` log buttons.
- Filter by status (`All`, `Safe`, `Warning`, `Critical`) and live search by name or course code.
- Deep-dive subject modal with subject-specific bunk simulation and notes.

### 7. Indian Academic Calendar & Gazetted Holidays
- Monthly attendance grid with color indicators:
  - 🟢 Present
  - 🔴 Absent
  - 🟡 Partial
  - 🟠 Gazetted Indian Holiday / Festival
- Pre-loaded with Indian college public holidays (Republic Day, Maha Shivratri, Holi, Eid, Independence Day, Gandhi Jayanti, Diwali, Christmas, etc.).
- Facility to add custom college holidays (college fests, sports day, preparatory leave).
- Holidays are neutral and do not penalize attendance statistics.

### 8. Visual Analytics & Projection Modeling
- **Donut Chart:** Visual breakdown of attended vs. absent classes.
- **Trajectory Forecast:** Divergence model comparing 100% attendance pace vs. 0% bunking pace.
- **Subject Bar Chart:** Cross-subject comparison with horizontal target reference lines.

### 9. Multi-Format Report Exporter (PDF / JPG / JPEG)
- Prominent `📄 Export Report` trigger directly on the Dashboard.
- **Save as PDF:** Fully formatted, multi-page vector PDF via `jsPDF` and `jspdf-autotable`.
- **Save as JPG / JPEG:** 2.5x retina resolution canvas capture via `html2canvas`.
- Includes student profile, real attendance counts, course breakdown, burn rate warning, advisory insights, and mandatory attribution:
  > **Attendance Meter · Developed By Ankit Srivastava**

---

## 🌓 Universal Dark, Light & System Themes

- Supports `Dark` (default), `Light`, and `System` modes.
- Instant DOM bootstrap script in `index.html` prevents white-flash on page reloads.
- Responsive theme switches located in desktop sidebar, mobile navigation, setup wizard, and settings.
- All chart axes, grids, tooltips, cards, borders, and modals dynamically adapt contrast.

---

## 📱 Responsive Layout System

| Device Type | Viewport Width | Navigation Mode | Layout Experience |
| :--- | :--- | :--- | :--- |
| **Desktop** | $\ge 768\text{px}$ | Sticky Left Sidebar | Multi-column grid, persistent student info, quick actions |
| **Tablet** | $640\text{px} - 767\text{px}$ | Top Header + Floating | 2-column cards, adaptive charts |
| **Mobile Phone** | $< 640\text{px}$ | Top Header + Mobile Bottom Nav | Touch-optimized bottom bar (Home, Subjects, Simulator, Calendar, Analytics, Settings) |

- Safe-area bottom padding (`pb-24`) ensures buttons and inputs are never obstructed by mobile navigation bars.
- Zero horizontal scrolling with fluid typography.

---

## 🛠️ Tech Stack

- **Core Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Build Tool:** [Vite 8](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with `@custom-variant dark`
- **Charts & Data Visualization:** [Recharts](https://recharts.org/)
- **Document Generation:** [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Image Generation:** [html2canvas](https://html2canvas.hertzen.com/)
- **Iconography:** [Lucide React](https://lucide.dev/)
- **Animations:** CSS transitions + [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Data Persistence:** Browser `LocalStorage` (Zero server dependency)

---

## 📁 Project Architecture

```
attendance-meter/
├── index.html                   # HTML entry point with immediate theme bootstrap
├── metadata.json                # AI Studio application metadata
├── package.json                 # Dependencies and build scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration
└── src/
    ├── main.tsx                 # React DOM mount point
    ├── App.tsx                  # Root application router & layout controller
    ├── index.css                # Tailwind CSS v4 directives & custom scrollbars
    ├── types/
    │   └── attendance.ts        # TypeScript interfaces & types
    ├── utils/
    │   ├── attendanceCalculations.ts # Math formulas (Bunks, Targets, Burn Rate)
    │   ├── indianHolidays.ts    # Gazetted Indian academic holidays schedule
    │   ├── storage.ts           # LocalStorage CRUD & backup JSON export/import
    │   └── reportExport.ts      # Multi-page PDF, JPG, and JPEG export engines
    ├── context/
    │   └── AttendanceContext.tsx # Central state management & theme controller
    ├── pages/
    │   ├── Dashboard.tsx        # Command Center Dashboard
    │   ├── Subjects.tsx         # Course management & subject list
    │   ├── Simulator.tsx        # What-if scenario comparison
    │   ├── CalendarView.tsx     # Indian festival calendar & attendance logger
    │   ├── Analytics.tsx        # Recharts visual trends & donut charts
    │   └── Settings.tsx         # Profile, schedule rules, theme & JSON backups
    └── components/
        ├── AttendanceOverviewCard.tsx # Animated progress ring & dynamic status
        ├── ProgressRing.tsx     # SVG circular gauge component
        ├── QuickAttendanceInput.tsx   # Direct standalone calculator
        ├── BunkCalculator.tsx   # "Can I Bunk?" limit planner
        ├── TargetCalculator.tsx # Recovery class calculator
        ├── BurnRateCard.tsx     # Non-linear drop card
        ├── WeeklyBunkCard.tsx   # 1-week skip vacation simulator
        ├── SmartInsights.tsx    # Rule-based academic advisory
        ├── SubjectCard.tsx      # Interactive course card
        ├── SubjectModal.tsx     # Deep-dive subject inspection modal
        ├── SubjectFormModal.tsx # Add/Edit course modal
        ├── ExportReportModal.tsx# PDF / JPG / JPEG export preview modal
        ├── SetupWizard.tsx      # First-time user onboarding wizard
        ├── Navbar.tsx           # Mobile top navigation bar
        ├── Sidebar.tsx          # Desktop sticky navigation sidebar
        ├── BottomNav.tsx        # Mobile bottom navigation bar
        ├── ThemeSelector.tsx    # Dark / Light / System segmented control
        ├── ToastContainer.tsx   # Floating notification container
        └── Watermark.tsx        # Creator attribution watermark
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (version 18.0 or higher)
- npm or pnpm or yarn

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/attendance-meter.git
   cd attendance-meter
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Type check & lint:**
   ```bash
   npm run lint
   ```

---

## 🔒 Privacy & Local-First Storage

- **100% Client-Side:** Attendance Meter runs completely inside your browser. No attendance data, course lists, or personal details are ever transmitted to any remote server.
- **Offline Capable:** Works without an internet connection.
- **Export & Import Backup:** Under **Settings**, export an encrypted JSON backup file anytime to migrate your attendance records between your phone and laptop.

---

## 👨‍💻 Author & Developer

**Developed with ❤️ by Ankit Srivastava**

- **Project:** Attendance Meter
- **Target Audience:** Indian College & University Students
- **Vision:** Empower students with clear academic visibility, smart bunking limits, and seamless attendance recovery planning.

---

## 📄 License

This project is licensed under the [Apache-2.0 License](LICENSE).
Feel free to use, modify, and distribute this application according to the license terms.

<div align="center">
  <sub>Built with precision for college students everywhere. Stay safe, attend classes, and plan your bunks wisely!</sub>
</div>
