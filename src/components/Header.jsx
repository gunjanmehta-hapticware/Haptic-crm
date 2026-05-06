import { Search, Clock, PanelLeftOpen } from 'lucide-react';
import { currentUser } from '../data/mockData';
import { useOutletContext } from 'react-router-dom';

export default function Header({ title, subtitle, action }) {
  const ctx = useOutletContext?.() || {};
  const { sidebarOpen, setSidebarOpen } = ctx;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {!sidebarOpen && setSidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" title="Open menu">
            <PanelLeftOpen size={20} className="text-gray-500" />
          </button>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        {action && <div className="flex-shrink-0">{action}</div>}
        <div className="hidden lg:flex items-center gap-2 text-gray-500 text-sm bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
          <Clock size={14} className="text-medical-400" />
          <span className="text-gray-400">{dateStr}</span>
          <span className="font-semibold text-gray-700">{timeStr}</span>
        </div>

        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search patients, doctors..."
            className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-200 focus:border-medical-400 w-56 bg-gray-50 transition-all duration-200 focus:bg-white" />
        </div>


        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-medical-600 flex items-center justify-center text-white text-sm font-bold">
            {currentUser.avatar}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{currentUser.name}</p>
            <p className="text-xs text-gray-400">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
