import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, Calendar, ClipboardList, Stethoscope,
  TrendingUp, PhoneCall, Activity, Clock, ChevronRight, ChevronLeft,
  X, GripVertical, Plus, CheckCircle, LayoutDashboard, Megaphone, ArrowRightLeft,
  ChevronDown, CalendarDays
} from 'lucide-react';
import Header from '../components/Header';
import { stats, chartData, appointments, currentUser } from '../data/mockData';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const KPI_CARDS = [
  { label: 'Total Patients', value: stats.totalPatients, icon: Users, change: '+12 this week', positive: true, iconBg: 'bg-medical-600' },
  { label: 'Appointments Today', value: stats.todayAppointments, icon: Calendar, change: '5 completed', positive: true, iconBg: 'bg-teal-600' },
  { label: 'Active OPD', value: stats.activeOPD, icon: ClipboardList, change: '3 urgent', positive: false, iconBg: 'bg-health-600' },
  { label: 'Operations Today', value: stats.scheduledOperations, icon: Stethoscope, change: '1 in progress', positive: false, iconBg: 'bg-health-600' },
];

const MONTH_DATES = {
  Nov: '2025-11-15', Dec: '2025-12-15', Jan: '2026-01-15',
  Feb: '2026-02-15', Mar: '2026-03-15', Apr: '2026-04-15',
};

const DONUT_COLORS = ['#0284C7', '#14B8A6', '#16A34A', '#0891B2', '#06B6D4'];

const ALL_WIDGET_DEFS = [
  {
    id: 'kpi', title: 'KPI Overview', desc: 'Total patients, today\'s appointments, active OPD & operations',
    category: 'Overview', colSpan: 12, icon: LayoutDashboard, color: '#0284C7',
  },
  {
    id: 'trends', title: 'Appointment Trends', desc: 'Monthly appointments & OPD volume with date range filter',
    category: 'Clinical', colSpan: 8, icon: TrendingUp, color: '#14B8A6',
  },
  {
    id: 'apptTypes', title: 'Appointment Types', desc: 'Donut breakdown — follow-up, new patient, emergency, post-op',
    category: 'Clinical', colSpan: 4, icon: Activity, color: '#7C3AED',
  },
  {
    id: 'todayAppts', title: "Today's Appointments", desc: 'Live list of today\'s scheduled appointments with status',
    category: 'Clinical', colSpan: 12, icon: Calendar, color: '#059669',
  },
  {
    id: 'leadsBySource', title: 'Leads by Source', desc: 'Marketing channel breakdown — Instagram, Facebook, Google Ads, etc.',
    category: 'Marketing', colSpan: 4, icon: Megaphone, color: '#E1306C',
  },
  {
    id: 'turnaround', title: 'Lead Turnaround Time', desc: 'Avg days from inquiry → appointment booked → consultation done',
    category: 'Marketing', colSpan: 8, icon: Clock, color: '#D97706',
  },
  {
    id: 'crmToMed', title: 'CRM → MedID Conversion', desc: 'How many CRM leads actually came to hospital and got a MedID',
    category: 'Marketing', colSpan: 12, icon: ArrowRightLeft, color: '#16A34A',
  },
];

const DEFAULT_WIDGETS = ['kpi', 'trends', 'apptTypes', 'todayAppts'];

// ─── Tiny previews for the widget gallery ───────────────────────────────────

function WidgetPreview({ id }) {
  if (id === 'kpi') return (
    <div className="grid grid-cols-4 gap-1.5 w-full">
      {[
        { v: '1,248', label: 'Patients', c: '#0284C7' },
        { v: '24', label: 'Appts', c: '#14B8A6' },
        { v: '9', label: 'OPD', c: '#059669' },
        { v: '4', label: 'Ops', c: '#D97706' },
      ].map((item, i) => (
        <div key={i} className="rounded-xl p-2 text-center" style={{ backgroundColor: item.c + '18' }}>
          <div className="text-sm font-bold" style={{ color: item.c }}>{item.v}</div>
          <div className="text-[9px] text-gray-400 mt-0.5">{item.label}</div>
        </div>
      ))}
    </div>
  );

  if (id === 'trends') return (
    <AreaChart width={260} height={75} data={chartData.monthlyAppointments} margin={{ top: 4, right: 4, bottom: 0, left: -30 }}>
      <Area type="monotone" dataKey="appointments" stroke="#0284C7" strokeWidth={2} fill="#0284C720" dot={false} />
      <Area type="monotone" dataKey="opd" stroke="#14B8A6" strokeWidth={1.5} fill="#14B8A615" dot={false} />
      <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
    </AreaChart>
  );

  if (id === 'apptTypes') return (
    <div className="flex items-center gap-3">
      <PieChart width={80} height={80}>
        <Pie data={chartData.appointmentTypes} cx={40} cy={38} innerRadius={22} outerRadius={36} paddingAngle={2} dataKey="value">
          {chartData.appointmentTypes.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
        </Pie>
      </PieChart>
      <div className="space-y-1">
        {chartData.appointmentTypes.slice(0, 4).map((d, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[i] }} />
            <span className="text-[10px] text-gray-600 truncate max-w-[70px]">{d.name}</span>
            <span className="text-[10px] font-bold text-gray-800 ml-auto">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (id === 'todayAppts') return (
    <div className="space-y-1.5 w-full">
      {[
        { t: '09:00', p: 'Rajesh Kumar', s: 'confirmed', type: 'Follow-up' },
        { t: '09:30', p: 'Sunita Agarwal', s: 'confirmed', type: 'Consultation' },
        { t: '10:00', p: 'Preethi Menon', s: 'arrived', type: 'New Patient' },
      ].map((a, i) => (
        <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 rounded-lg">
          <span className="text-[10px] font-bold text-medical-600 w-10 flex-shrink-0">{a.t}</span>
          <span className="text-[10px] text-gray-700 flex-1 truncate">{a.p}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${a.s === 'arrived' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{a.s}</span>
        </div>
      ))}
    </div>
  );

  if (id === 'leadsBySource') return (
    <div className="flex items-center gap-3">
      <PieChart width={80} height={80}>
        <Pie data={chartData.marketingLeadsBySource} cx={40} cy={38} innerRadius={20} outerRadius={36} paddingAngle={2} dataKey="value">
          {chartData.marketingLeadsBySource.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
      </PieChart>
      <div className="space-y-1">
        {chartData.marketingLeadsBySource.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-[10px] text-gray-600">{d.name}</span>
            <span className="text-[10px] font-bold text-gray-800 ml-1">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (id === 'turnaround') return (
    <BarChart width={260} height={75} data={chartData.turnaroundTime} margin={{ top: 4, right: 4, bottom: 0, left: -30 }} barSize={8}>
      <Bar dataKey="inquiry" fill="#D97706" radius={[2, 2, 0, 0]} />
      <Bar dataKey="appointment" fill="#0284C7" radius={[2, 2, 0, 0]} />
      <Bar dataKey="consultation" fill="#14B8A6" radius={[2, 2, 0, 0]} />
      <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
    </BarChart>
  );

  if (id === 'crmToMed') return (
    <div className="w-full">
      <div className="flex items-end gap-2 h-14 w-full px-1">
        {chartData.crmToMedConversion.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full flex gap-0.5 items-end">
              <div className="flex-1 rounded-t" style={{ height: `${(d.leads / 91) * 48}px`, backgroundColor: '#16A34A30', minHeight: 6 }} />
              <div className="flex-1 rounded-t" style={{ height: `${(d.converted / 35) * 40}px`, backgroundColor: '#16A34A', minHeight: 4 }} />
            </div>
            <span className="text-[8px] text-gray-400">{d.month}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-1.5">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-green-600" /><span className="text-[10px] text-gray-500">Converted (MedID)</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded" style={{ backgroundColor: '#16A34A30', border: '1px solid #16A34A' }} /><span className="text-[10px] text-gray-500">Total CRM Leads</span></div>
      </div>
    </div>
  );

  return null;
}

// ─── Add Widget Modal ────────────────────────────────────────────────────────

function AddWidgetModal({ activeWidgets, onAdd, onClose }) {
  const [tab, setTab] = useState('All');
  const [justAdded, setJustAdded] = useState(null);
  const tabs = ['All', 'Overview', 'Clinical', 'Marketing'];
  const visible = ALL_WIDGET_DEFS.filter(w => tab === 'All' || w.category === tab);

  const handleAdd = (id) => {
    onAdd(id);
    setJustAdded(id);
    setTimeout(() => setJustAdded(null), 1200);
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" style={{ animation: 'fadeInOverlay 0.25s ease-out forwards' }} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[82vh] flex flex-col pointer-events-auto" style={{ animation: 'modalPop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>

          {/* Modal header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add Widget</h2>
              <p className="text-sm text-gray-400 mt-0.5">Pick widgets — you can add as many as you like, then close when done</p>
            </div>
            <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm transition-all hover:scale-105 active:scale-95">
              <X size={15} /> Close
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 px-7 pt-5 pb-3 flex-shrink-0">
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-medical-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Widget cards grid */}
          <div className="flex-1 overflow-y-auto px-7 pb-7 grid grid-cols-2 gap-4 content-start pt-4">
            {visible.map((w, i) => {
              const isActive = activeWidgets.includes(w.id);
              const wasJustAdded = justAdded === w.id;
              const Icon = w.icon;
              return (
                <div
                  key={w.id}
                  onClick={() => { if (!isActive) handleAdd(w.id); }}
                  style={{ animation: `widgetCardIn 0.3s cubic-bezier(0.16,1,0.3,1) ${i * 40}ms both` }}
                  className={`border-2 rounded-2xl p-4 transition-all select-none ${
                    wasJustAdded
                      ? 'border-green-400 bg-green-50 scale-[0.98]'
                      : isActive
                      ? 'border-medical-200 bg-medical-50/60 cursor-default'
                      : 'border-gray-100 hover:border-medical-400 hover:shadow-lg cursor-pointer group'
                  }`}
                >
                  {/* Card top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: w.color + '18' }}>
                        <Icon size={18} style={{ color: w.color }} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 inline-block"
                          style={{ backgroundColor: w.color + '18', color: w.color }}>
                          {w.category}
                        </span>
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">{w.title}</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{w.desc}</p>
                      </div>
                    </div>
                    {wasJustAdded ? (
                      <span className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full whitespace-nowrap" style={{ animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
                        <CheckCircle size={11} /> Added!
                      </span>
                    ) : isActive ? (
                      <span className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-medical-600 bg-medical-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                        <CheckCircle size={11} /> On dashboard
                      </span>
                    ) : (
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-medical-600 text-gray-400 group-hover:text-white flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-90">
                        <Plus size={16} />
                      </div>
                    )}
                  </div>

                  {/* Widget preview */}
                  <div className={`rounded-xl border p-3 flex items-center justify-center min-h-[100px] overflow-hidden transition-colors ${isActive ? 'bg-white/60 border-gray-100' : 'bg-white border-gray-100 group-hover:border-medical-100'}`}>
                    <WidgetPreview id={w.id} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, change, positive, iconBg }) {
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-lg shadow-current/20`}>
          <Icon size={22} className="text-white" />
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${positive ? 'bg-health-50 text-health-700' : 'bg-amber-50 text-amber-700'}`}>
          {change}
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-3 text-sm">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: <span className="text-gray-800">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

const MN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MN_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function MiniCal({ value, onChange, accentColor }) {
  const [view, setView] = useState(() => { const d = new Date(value); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selY, selM, selD] = value.split('-').map(Number);

  const firstDay = view.getDay();
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const pick = (day) => {
    if (!day) return;
    const m = String(view.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${view.getFullYear()}-${m}-${d}`);
  };

  const isSelected = (day) => day && view.getMonth() + 1 === selM && view.getFullYear() === selY && day === selD;
  const isToday = (day) => {
    const t = new Date();
    return day && view.getMonth() === t.getMonth() && view.getFullYear() === t.getFullYear() && day === t.getDate();
  };

  return (
    <div className="w-64 select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setView(v => new Date(v.getFullYear(), v.getMonth() - 1, 1))}
          className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <ChevronLeft size={16} className="text-gray-500" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-900">{MN[view.getMonth()]}</p>
          <p className="text-xs text-gray-400">{view.getFullYear()}</p>
        </div>
        <button
          onClick={() => setView(v => new Date(v.getFullYear(), v.getMonth() + 1, 1))}
          className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-300 py-1 uppercase tracking-wider">{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          const sel = isSelected(day);
          const tod = isToday(day);
          return (
            <button
              key={i}
              onClick={() => pick(day)}
              className={`
                h-9 w-full rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-center
                ${!day ? 'invisible pointer-events-none' : ''}
                ${sel
                  ? 'text-white font-bold shadow-lg scale-105'
                  : tod
                  ? 'border-2 text-gray-800 font-bold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              style={sel
                ? { backgroundColor: accentColor, boxShadow: `0 4px 14px ${accentColor}55` }
                : tod
                ? { borderColor: accentColor, color: accentColor }
                : {}
              }
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Period helpers ───────────────────────────────────────────────────────────

const PERIODS = [
  { id: 'week',   label: 'Weekly',  months: ['Apr'] },
  { id: 'month',  label: 'Monthly', months: ['Feb', 'Mar', 'Apr'] },
  { id: 'year',   label: 'Yearly',  months: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'] },
];

function PeriodBar({ period, setPeriod, startDate, setStartDate, endDate, setEndDate }) {
  const [showCustom, setShowCustom] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef();
  const dropRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        dropRef.current && !dropRef.current.contains(e.target)
      ) setShowCustom(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openCustom = () => {
    setPeriod('custom');
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropdownPos({ top: r.bottom + 8, left: r.left });
    }
    setShowCustom(v => !v);
  };

  const current = PERIODS.find(p => p.id === period);
  const periodLabel = period === 'custom' ? `${startDate} → ${endDate}` : current?.label;

  return (
    <div className="flex items-center gap-3 mb-6 flex-wrap" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
      {/* Period pills */}
      <div className="flex items-center bg-gray-100 rounded-2xl p-1 gap-1">
        {PERIODS.map(p => (
          <button
            key={p.id}
            onClick={() => { setPeriod(p.id); setShowCustom(false); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              period === p.id
                ? 'bg-white text-medical-700 shadow-sm shadow-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom range button */}
      <button
        ref={btnRef}
        onClick={openCustom}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
          period === 'custom'
            ? 'bg-medical-600 text-white border-medical-600 shadow-sm'
            : 'bg-white border-gray-200 text-gray-600 hover:border-medical-400'
        }`}
      >
        <CalendarDays size={15} />
        {period === 'custom' ? periodLabel : 'Custom Range'}
        <ChevronDown size={14} className={`transition-transform duration-200 ${showCustom ? 'rotate-180' : ''}`} />
      </button>

      {/* Active label */}
      <span className="text-sm text-gray-400 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-medical-500 inline-block" />
        Showing {period === 'custom' ? 'custom range' : `${current?.months.length} month${current?.months.length > 1 ? 's' : ''}`} data
      </span>

      {/* Portal calendar — mounts directly on body, immune to any stacking context */}
      {showCustom && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setShowCustom(false)} />
          <div
            ref={dropRef}
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              zIndex: 9999,
              animation: 'modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="bg-gradient-to-r from-medical-600 to-teal-600 px-6 py-4">
              <p className="text-white font-bold text-sm">Custom Date Range</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 bg-white/20 rounded-xl px-3 py-1.5 text-white text-xs font-semibold flex items-center gap-2">
                  <CalendarDays size={12} />
                  <span>{startDate}</span>
                </div>
                <div className="text-white/60 text-xs font-bold">→</div>
                <div className="flex-1 bg-white/20 rounded-xl px-3 py-1.5 text-white text-xs font-semibold flex items-center gap-2">
                  <CalendarDays size={12} />
                  <span>{endDate}</span>
                </div>
              </div>
            </div>

            {/* Calendars */}
            <div className="flex gap-0 divide-x divide-gray-100">
              <div className="p-5">
                <p className="text-[11px] font-bold text-medical-600 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-medical-500 inline-block" /> From
                </p>
                <MiniCal value={startDate} onChange={setStartDate} accentColor="#0284C7" />
              </div>
              <div className="p-5">
                <p className="text-[11px] font-bold text-teal-600 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" /> To
                </p>
                <MiniCal value={endDate} onChange={setEndDate} accentColor="#14B8A6" />
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/60">
              <button
                onClick={() => { setStartDate('2025-11-01'); setEndDate('2026-04-30'); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-all"
              >
                <X size={13} /> Reset to default
              </button>
              <button
                onClick={() => setShowCustom(false)}
                className="flex items-center gap-2 px-5 py-2 bg-medical-600 hover:bg-medical-700 text-white text-xs font-bold rounded-xl transition-all hover:shadow-md active:scale-95"
              >
                <CheckCircle size={13} /> Apply Range
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('2026-02-01');
  const [endDate, setEndDate] = useState('2026-04-30');
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
  const [showAddModal, setShowAddModal] = useState(false);
  const dragId = useRef(null);
  const dragOverId = useRef(null);

  const todayAppts = appointments.filter(a => a.date === '2026-04-27');

  const activeMonths = useMemo(() => {
    if (period === 'custom') {
      return chartData.monthlyAppointments
        .filter(row => MONTH_DATES[row.month] >= startDate && MONTH_DATES[row.month] <= endDate)
        .map(r => r.month);
    }
    return PERIODS.find(p => p.id === period)?.months ?? [];
  }, [period, startDate, endDate]);

  const filteredTrend = useMemo(() =>
    chartData.monthlyAppointments.filter(r => activeMonths.includes(r.month)),
    [activeMonths]);

  const filteredTurnaround = useMemo(() =>
    chartData.turnaroundTime.filter(r => activeMonths.includes(r.month)),
    [activeMonths]);

  const filteredCrmToMed = useMemo(() =>
    chartData.crmToMedConversion.filter(r => activeMonths.includes(r.month)),
    [activeMonths]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const removeWidget = (id) => setWidgets(w => w.filter(wid => wid !== id));
  const addWidget = (id) => setWidgets(w => w.includes(id) ? w : [...w, id]);

  const onDragStart = (id) => { dragId.current = id; };
  const onDragOver = (e, id) => { e.preventDefault(); dragOverId.current = id; };
  const onDrop = () => {
    if (!dragId.current || dragId.current === dragOverId.current) return;
    setWidgets(prev => {
      const arr = [...prev];
      const from = arr.indexOf(dragId.current);
      const to = arr.indexOf(dragOverId.current);
      arr.splice(from, 1);
      arr.splice(to, 0, dragId.current);
      return arr;
    });
    dragId.current = null;
    dragOverId.current = null;
  };

  const colSpanOf = (id) => ALL_WIDGET_DEFS.find(w => w.id === id)?.colSpan ?? 12;
  const gridColStyle = (span) =>
    span === 8 ? { gridColumn: 'span 8' } : span === 4 ? { gridColumn: 'span 4' } : { gridColumn: 'span 12' };

  const dragProps = (id) => ({
    draggable: true,
    onDragStart: () => onDragStart(id),
    onDragOver: (e) => onDragOver(e, id),
    onDrop,
  });

  const WidgetShell = ({ id, children, extraStyle }) => (
    <div
      {...dragProps(id)}
      style={{ ...gridColStyle(colSpanOf(id)), ...extraStyle }}
      className="group relative"
    >
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-grab active:cursor-grabbing p-1">
        <GripVertical size={14} className="text-gray-400" />
      </div>
      <button
        onClick={() => removeWidget(id)}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
      >
        <X size={14} />
      </button>
      {children}
    </div>
  );

  const renderWidget = (id) => {
    if (id === 'kpi') return (
      <WidgetShell key={id} id={id}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {KPI_CARDS.map((card, i) => (
            <div key={card.label} style={{ animationDelay: `${i * 80}ms` }}>
              <StatCard {...card} />
            </div>
          ))}
        </div>
      </WidgetShell>
    );

    if (id === 'trends') return (
      <WidgetShell key={id} id={id}>
        <div className="card animate-fade-in animate-delay-200">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="section-title">Appointment Trends</h3>
              <p className="text-gray-400 text-sm mt-0.5">{filteredTrend.length} month{filteredTrend.length !== 1 ? 's' : ''} · filtered by dashboard period</p>
            </div>
          </div>
          {filteredTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={filteredTrend} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="opdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="appointments" name="Appointments" stroke="#0284C7" strokeWidth={2.5} fill="url(#apptGrad)" dot={{ r: 4, fill: '#0284C7', strokeWidth: 0 }} />
                <Area type="monotone" dataKey="opd" name="OPD" stroke="#14B8A6" strokeWidth={2} fill="url(#opdGrad)" dot={{ r: 3, fill: '#14B8A6', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No data in selected range</div>
          )}
        </div>
      </WidgetShell>
    );

    if (id === 'apptTypes') return (
      <WidgetShell key={id} id={id}>
        <div className="card animate-fade-in animate-delay-300 h-full">
          <div className="mb-6">
            <h3 className="section-title">Appointment Types</h3>
            <p className="text-gray-400 text-sm mt-0.5">This month's breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={chartData.appointmentTypes} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                {chartData.appointmentTypes.map((_, index) => (
                  <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {chartData.appointmentTypes.map(({ name, value }, index) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }} />
                  <span className="text-xs text-gray-600">{name}</span>
                </div>
                <span className="text-xs font-semibold text-gray-700">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </WidgetShell>
    );

    if (id === 'todayAppts') return (
      <WidgetShell key={id} id={id}>
        <div className="card animate-fade-in animate-delay-400">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">Today's Appointments</h3>
            <button className="btn-ghost text-xs">View all <ChevronRight size={14} /></button>
          </div>
          <div className="space-y-3">
            {todayAppts.slice(0, 5).map(appt => (
              <div key={appt.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-50 hover:border-gray-100">
                <div className="text-center w-16 flex-shrink-0">
                  <p className="font-bold text-medical-600 text-sm">{appt.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{appt.patient}</p>
                  <p className="text-gray-400 text-xs truncate">{appt.doctor} · {appt.type}</p>
                </div>
                <span className={`badge ${
                  appt.status === 'confirmed' ? 'badge-blue' :
                  appt.status === 'arrived' ? 'badge-green' :
                  appt.status === 'completed' ? 'badge-gray' : 'badge-yellow'
                }`}>{appt.status}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1"><Clock size={12} /> Avg wait</div>
              <p className="font-bold text-gray-800">{stats.avgWaitTime} min</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1"><PhoneCall size={12} /> Calls</div>
              <p className="font-bold text-gray-800">{stats.pendingCalls}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1"><Activity size={12} /> Satisfaction</div>
              <p className="font-bold text-emerald-600">{stats.patientSatisfaction}%</p>
            </div>
          </div>
        </div>
      </WidgetShell>
    );

    if (id === 'leadsBySource') return (
      <WidgetShell key={id} id={id}>
        <div className="card animate-fade-in h-full">
          <div className="mb-5">
            <h3 className="section-title">Leads by Source</h3>
            <p className="text-gray-400 text-sm mt-0.5">Marketing channel breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={chartData.marketingLeadsBySource}
                cx="50%" cy="50%"
                innerRadius={48} outerRadius={75}
                paddingAngle={3} dataKey="value"
              >
                {chartData.marketingLeadsBySource.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {chartData.marketingLeadsBySource.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-gray-600">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-8 text-right">{d.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </WidgetShell>
    );

    if (id === 'turnaround') return (
      <WidgetShell key={id} id={id}>
        <div className="card animate-fade-in">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="section-title">Lead Turnaround Time</h3>
              <p className="text-gray-400 text-sm mt-0.5">Avg days at each stage of the patient journey</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: '#D97706' }} /><span>Inquiry → Contact</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: '#0284C7' }} /><span>Contact → Appointment</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: '#14B8A6' }} /><span>Appointment → Consultation</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filteredTurnaround} margin={{ top: 5, right: 5, bottom: 0, left: -10 }} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit=" d" />
              <Tooltip content={<CustomTooltip />} formatter={(v, n) => [`${v} days`, n]} />
              <Bar dataKey="inquiry" name="Inquiry → Contact" fill="#D97706" radius={[4, 4, 0, 0]} />
              <Bar dataKey="appointment" name="Contact → Appointment" fill="#0284C7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="consultation" name="Appt → Consultation" fill="#14B8A6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-50">
            {[
              { label: 'Avg Inquiry Wait', value: '2.5 days', color: '#D97706' },
              { label: 'Avg Booking Time', value: '1.5 days', color: '#0284C7' },
              { label: 'Avg Consult Gap', value: '0.4 days', color: '#14B8A6' },
            ].map(item => (
              <div key={item.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: item.color + '10' }}>
                <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </WidgetShell>
    );

    if (id === 'crmToMed') return (
      <WidgetShell key={id} id={id}>
        <div className="card animate-fade-in">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="section-title">CRM → MedID Conversion</h3>
              <p className="text-gray-400 text-sm mt-0.5">Leads that actually visited hospital and received a MedID</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 rounded-2xl bg-green-50 border border-green-100">
                <p className="text-2xl font-bold text-green-700">
                  {filteredCrmToMed.reduce((s, d) => s + d.converted, 0)}
                </p>
                <p className="text-xs text-green-600 mt-0.5">Total Converted</p>
              </div>
              <div className="text-center px-4 py-2 rounded-2xl bg-medical-50 border border-medical-100">
                <p className="text-2xl font-bold text-medical-700">
                  {filteredCrmToMed.length ? Math.round(filteredCrmToMed.reduce((s, d) => s + d.converted, 0) /
                    filteredCrmToMed.reduce((s, d) => s + d.leads, 0) * 100) : 0}%
                </p>
                <p className="text-xs text-medical-600 mt-0.5">Conversion Rate</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filteredCrmToMed} margin={{ top: 5, right: 5, bottom: 0, left: -10 }} barSize={24} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="leads" name="CRM Leads" fill="#0284C730" stroke="#0284C7" strokeWidth={1} radius={[4, 4, 0, 0]} />
              <Bar dataKey="converted" name="Got MedID" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid gap-2 mt-4 pt-4 border-t border-gray-50" style={{ gridTemplateColumns: `repeat(${filteredCrmToMed.length}, 1fr)` }}>
            {filteredCrmToMed.map(d => (
              <div key={d.month} className="text-center">
                <p className="text-xs font-bold text-gray-700">{d.month}</p>
                <p className="text-lg font-bold text-green-700 mt-1">{d.converted}</p>
                <p className="text-[10px] text-gray-400">of {d.leads}</p>
                <div className="w-full bg-gray-100 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${(d.converted / d.leads) * 100}%` }} />
                </div>
                <p className="text-[10px] text-green-600 font-semibold mt-0.5">{Math.round((d.converted / d.leads) * 100)}%</p>
              </div>
            ))}
          </div>
        </div>
      </WidgetShell>
    );

    return null;
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`${greeting}, ${currentUser.name.split(' ')[1]}`}
        subtitle="Here's what's happening at MedCare today"
      />

      <div className="flex-1 p-8 overflow-auto">
        <PeriodBar
          period={period} setPeriod={setPeriod}
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
        />

        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-medical-50 flex items-center justify-center">
              <LayoutDashboard size={36} className="text-medical-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-700">Your dashboard is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add widgets to see your key metrics</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-medical-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-all hover:bg-medical-700"
            >
              <Plus size={16} /> Add Your First Widget
            </button>
          </div>
        ) : (
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
            {widgets.map(id => renderWidget(id))}
          </div>
        )}
      </div>

      {/* Floating Add Widget button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 z-30 flex items-center gap-2.5 px-5 py-3.5 bg-medical-600 hover:bg-medical-700 text-white font-semibold text-sm rounded-2xl shadow-xl shadow-medical-600/40 transition-all hover:shadow-2xl hover:shadow-medical-600/50 hover:-translate-y-1 active:scale-95 active:translate-y-0"
        style={{ animation: 'fabIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both' }}
      >
        <Plus size={18} className="transition-transform duration-300 group-hover:rotate-90" />
        Add Widget
      </button>

      {showAddModal && (
        <AddWidgetModal
          activeWidgets={widgets}
          onAdd={addWidget}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
