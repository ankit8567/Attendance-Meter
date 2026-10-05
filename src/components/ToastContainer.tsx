import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useAttendance();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClass = 'border-blue-500/30';
        let bgClass = 'bg-slate-900/95 text-slate-100';
        let iconClass = 'text-blue-400';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-emerald-500/30';
          iconClass = 'text-emerald-400';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-500/30';
          iconClass = 'text-amber-400';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'border-rose-500/30';
          iconClass = 'text-rose-400';
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${bgClass} ${borderClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconClass}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-white tracking-wide">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors -mr-1"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
