import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, PhoneCall, Settings, LogOut,
  Hospital, ChevronRight, PanelLeftClose, Megaphone, Radio,
} from 'lucide-react';
import { currentUser } from '../data/mockData';

const navItems = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard',       exact: true },
  { to: '/appointments', icon: Calendar,      label: 'Appointments' },
  { to: '/contacts',   icon: Users,           label: 'Patients' },
  { to: '/marketing',  icon: Megaphone,       label: 'Marketing Leads' },
  { to: '/campaigns',  icon: Radio,           label: 'Campaigns' },
  { to: '/voice-calls', icon: PhoneCall,      label: 'Voice Calls' },
  { to: '/settings',   icon: Settings,        label: 'Settings' },
];

export default function Sidebar({ onCollapse }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('medcare_auth');
    navigate('/login');
  }

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-medical-900 to-medical-950 flex flex-col shadow-sidebar flex-shrink-0">
      <div className="px-4 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <Hospital size={20} className="text-medical-600" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg leading-tight">Haptic CRM</p>
          </div>
        </div>
        <button onClick={onCollapse} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
          <PanelLeftClose size={17} className="text-medical-300" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="text-medical-400 text-xs font-semibold uppercase tracking-widest px-4 mb-3">Main Menu</p>
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink key={to} to={to} end={exact}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-30" />
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={handleLogout} className="sidebar-item w-full text-left text-medical-300 hover:text-white">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
