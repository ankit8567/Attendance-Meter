/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { SetupWizard } from './components/SetupWizard';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/ToastContainer';
import { SubjectFormModal } from './components/SubjectFormModal';
import { Dashboard } from './pages/Dashboard';
import { Subjects } from './pages/Subjects';
import { Simulator } from './pages/Simulator';
import { CalendarView } from './pages/CalendarView';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

const AppContent: React.FC = () => {
  const { activeTab, addSubject, settings } = useAttendance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // If first-time user and setup not completed yet, show the setup wizard
  if (!settings.setupCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <SetupWizard />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Desktop Sidebar Navigation */}
      <Sidebar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Header */}
        <Navbar onOpenAddModal={() => setIsAddModalOpen(true)} />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'subjects' && <Subjects />}
          {activeTab === 'simulator' && <Simulator />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Toast Container */}
      <ToastContainer />

      {/* Global Add Subject Modal */}
      <SubjectFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(data) => addSubject(data)}
        defaultTarget={settings.defaultTarget}
      />
    </div>
  );
};

export default function App() {
  return (
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
}
