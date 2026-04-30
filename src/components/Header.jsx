import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Clock, Calendar, Stethoscope, AlertTriangle, PhoneCall, X, PanelLeftOpen } from 'lucide-react';
import { currentUser } from '../data/mockData';
import { useOutletContext } from 'react-router-dom';

const NOTIFICATIONS = [
  { id: 1, icon: Calendar, color: 'text-medical-600 bg-medical-50', title: 'New Appointment', body: 'Rajesh Kumar booked for Dr. Priya Sharma — Apr 27, 9:00 AM', time: '5 min ago', unread: true },
  { id: 2, icon: AlertTriangle, color: 'text-red-600 bg-red-50', title: 'Critical Patient Alert', body: 'Mohan Lal Gupta flagged as critical — Cardiac Arrhythmia', time: '18 min ago', unread: true },
  { id: 3, icon: Stethoscope, color: 'text-health-600 bg-health-50', title: 'Operation Starting', body: 'Hepatic Resection in OR-1 begins in 15 minutes', time: '32 min ago', unread: true },
  { id: 4, icon: PhoneCall, color: 'text-teal-600 bg-teal-50', title: 'Missed Call', body: 'Ananya Krishnan called — callback required', time: '1 hr ago', unread: false },
  { id: 5, icon: Calendar, color: 'text-amber-600 bg-amber-50', title: 'Appointment Rescheduled', body: 'Sunita Agarwal moved to Apr 27 at 9:30 AM', time: '2 hrs ago', unread: false },
];

export default function Header({ title, subtitle }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const ref = useRef();
  const ctx = useOutletContext?.() || {};
  const { sidebarOpen, setSidebarOpen } = ctx;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const unreadCount = notifs.filter(n => n.unread).length;

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
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

      <div className="flex items-center gap-4">
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

        {/* Notifications */}
        <div className="relative" ref={ref}>
          <button onClick={() => setShowNotifs(v => !v)}
            className="relative w-10 h-10 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-medical-50 hover:border-medical-200 transition-colors">
            <Bell size={17} className="text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-medical-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none" style={{width:'18px',height:'18px'}}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <p className="font-bold text-gray-900 text-sm">Notifications</p>
                  <p className="text-xs text-gray-400">{unreadCount} unread</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setNotifs(n => n.map(x => ({...x, unread: false})))}
                    className="text-xs text-medical-600 font-semibold hover:text-medical-700">Mark all read</button>
                  <button onClick={() => setShowNotifs(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
                    <X size={15} className="text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.map((n, i) => (
                  <div key={n.id} onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? {...x, unread: false} : x))}
                    className={`flex gap-3 px-5 py-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${n.unread ? 'bg-medical-50/40' : ''}`}
                    style={{animationDelay:`${i*40}ms`}}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                      <n.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-gray-800">{n.title}</p>
                        {n.unread && <span className="w-2 h-2 rounded-full bg-medical-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-[11px] text-gray-400 mt-1 font-medium">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
