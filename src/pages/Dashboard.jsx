import { useState, useMemo, useRef, useEffect } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, Calendar, ClipboardList, Stethoscope,
  TrendingUp, PhoneCall, Activity, Clock, ChevronRight, ChevronLeft
} from 'lucide-react';
import Header from '../components/Header';
import { stats, chartData, appointments, operations, currentUser } from '../data/mockData';

const KPI_CARDS = [
  { label: 'Total Patients', value: stats.totalPatients.toLocaleString(), icon: Users, change: '+12%', positive: true, iconBg: 'bg-medical-600' },
  { label: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, change: '+3 from yesterday', positive: true, iconBg: 'bg-teal-600' },
  { label: 'Active OPD', value: stats.activeOPD, icon: ClipboardList, change: '~18 min avg wait', positive: true, iconBg: 'bg-health-500' },
  { label: 'Operations Today', value: stats.scheduledOperations, icon: Stethoscope, change: '1 in progress', positive: false, iconBg: 'bg-health-600' },
];

// Map month labels to mid-month dates for range filtering
const MONTH_DATES = {
  Nov: '2025-11-15', Dec: '2025-12-15', Jan: '2026-01-15',
  Feb: '2026-02-15', Mar: '2026-03-15', Apr: '2026-04-15',
};

const DONUT_COLORS = ['#0284C7', '#14B8A6', '#16A34A', '#0891B2', '#06B6D4'];

function StatCard({ label, value, icon: Icon, change, positive, iconBg }) {
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
          <p className="font-display text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <TrendingUp size={14} className={positive ? 'text-emerald-500' : 'text-amber-500'} />
        <span className={`text-xs font-medium ${positive ? 'text-emerald-600' : 'text-amber-600'}`}>{change}</span>
      </div>
    </div>
  );
}

const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function DatePicker({ label, value, onChange, accent, alignRight }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => { const d = new Date(value); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const ref = useRef();

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [selY, selM, selD] = value.split('-').map(Number);
  const firstDay = view.getDay();
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const pick = (day) => {
    const m = String(view.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${view.getFullYear()}-${m}-${d}`);
    setOpen(false);
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const { btn, ring, sel, hover } = accent === 'teal'
    ? { btn: 'border-teal-300 bg-teal-50 text-teal-700', ring: 'ring-teal-200', sel: 'bg-teal-600', hover: 'hover:bg-teal-50' }
    : { btn: 'border-medical-300 bg-medical-50 text-medical-700', ring: 'ring-medical-200', sel: 'bg-medical-600', hover: 'hover:bg-medical-50' };

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-semibold text-gray-500">{label}</label>
        <button
          onClick={() => setOpen(o => !o)}
          className={`flex items-center gap-2 border-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:shadow-md ${btn} ${open ? `ring-2 ${ring}` : ''}`}
        >
          <Calendar size={13} /> {fmt(value)}
        </button>
      </div>

      {open && (
        <div className={`absolute top-10 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 w-72 animate-fade-in ${alignRight ? 'right-0' : 'left-0'}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setView(v => new Date(v.getFullYear(), v.getMonth() - 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
              <ChevronLeft size={15} className="text-gray-500" />
            </button>
            <span className="text-sm font-bold text-gray-800">{MONTHS[view.getMonth()]} {view.getFullYear()}</span>
            <button onClick={() => setView(v => new Date(v.getFullYear(), v.getMonth() + 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
              <ChevronRight size={15} className="text-gray-500" />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>)}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              const isSelected = day && view.getMonth() + 1 === selM && view.getFullYear() === selY && day === selD;
              return (
                <button key={i} onClick={() => day && pick(day)} disabled={!day}
                  className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-all duration-150 font-medium
                    ${!day ? '' : isSelected ? `${sel} text-white shadow-sm scale-105` : `text-gray-700 ${hover}`}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [startDate, setStartDate] = useState('2025-11-01');
  const [endDate, setEndDate] = useState('2026-04-30');

  const todayAppts = appointments.filter(a => a.date === '2026-04-27');

  const filteredTrend = useMemo(() =>
    chartData.monthlyAppointments.filter(row =>
      MONTH_DATES[row.month] >= startDate && MONTH_DATES[row.month] <= endDate
    ), [startDate, endDate]);


  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`${greeting}, ${currentUser.name.split(' ')[1]}`}
        subtitle="Here's what's happening at MedCare today"
      />

      <div className="flex-1 p-8 overflow-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {KPI_CARDS.map((card, i) => (
            <div key={card.label} style={{ animationDelay: `${i * 80}ms` }}>
              <StatCard {...card} />
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
          {/* Appointment Trends with date-range filter */}
          <div className="card xl:col-span-2 animate-fade-in animate-delay-200">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="section-title">Appointment Trends</h3>
                <p className="text-gray-400 text-sm mt-0.5">
                  {filteredTrend.length} month{filteredTrend.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <DatePicker label="From" value={startDate} onChange={setStartDate} accent="medical" />
                <DatePicker label="To" value={endDate} onChange={setEndDate} accent="teal" alignRight />
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
              <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
                No data in selected range
              </div>
            )}
          </div>

          {/* Appointment Type Distribution — blue/teal/green palette */}
          <div className="card animate-fade-in animate-delay-300">
            <div className="mb-6">
              <h3 className="section-title">Appointment Types</h3>
              <p className="text-gray-400 text-sm mt-0.5">This month's breakdown</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={chartData.appointmentTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
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
        </div>

        {/* Today's Appointments — full width */}
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
                  <p className="text-gray-400 text-xs truncate">{appt.doctor} • {appt.type}</p>
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
      </div>
    </div>
  );
}
