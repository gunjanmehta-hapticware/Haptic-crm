import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import Header from '../components/Header';
import { appointments, operations, doctors } from '../data/mockData';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEPARTMENTS = Array.from(new Set(doctors.map(d => d.department))).sort();

const toDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getWeekDays = (date) => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

const getEvents = (dateStr, departmentName) => {
  const doctorsInDept = departmentName ? doctors.filter(d => d.department === departmentName).map(d => d.name) : null;
  return [
    ...appointments
      .filter(a => a.date === dateStr && (!departmentName || doctorsInDept.includes(a.doctor)))
      .map(a => ({ kind: 'appt', title: a.patient, patientId: a.patientId, time: a.time, reason: a.reason, sub: `${a.type} · ${a.doctor}`, duration: a.duration })),
    ...operations
      .filter(o => o.date === dateStr && (!departmentName || doctors.find(d => d.name === o.surgeon && d.department === departmentName)))
      .map(o => ({ kind: 'op', title: o.surgery, time: o.startTime, reason: o.or, sub: `${o.or} · ${o.surgeon}`, duration: o.duration })),
  ].sort((a, b) => a.time.localeCompare(b.time));
};

function EventChip({ e, small }) {
  const cls = e.kind === 'appt'
    ? 'bg-medical-100 text-medical-800 border-l-4 border-medical-500'
    : 'bg-health-100 text-health-800 border-l-4 border-health-500';

  if (small) {
    return (
      <div className={`text-[10px] px-2 py-1 rounded font-medium ${e.kind === 'appt' ? 'bg-medical-100 text-medical-700' : 'bg-health-100 text-health-700'}`}>
        <p className="font-bold">{e.time}</p>
        <p className="text-[9px] truncate">{e.title}</p>
        {e.patientId && <p className="text-[9px] text-opacity-70">ID: #{e.patientId}</p>}
        <p className="text-[9px] truncate">{e.reason}</p>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-lg text-xs ${cls}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold text-sm">{e.time}</p>
          {e.patientId && <p className="text-[10px] opacity-70">Patient ID: #{e.patientId}</p>}
        </div>
        <span className="text-[10px] font-medium opacity-75 px-2 py-1 rounded bg-white/40">
          {e.kind === 'appt' ? 'Appointment' : 'Operation'}
        </span>
      </div>
      <p className="font-semibold mt-2">{e.title}</p>
      <p className="text-[11px] font-medium mt-2 mb-1 italic opacity-80">{e.reason}</p>
      <p className="opacity-60 text-[10px] mt-1 pt-1 border-t border-current border-opacity-20">{e.sub}</p>
    </div>
  );
}

function MonthView({ currentDate, departmentName, onDayClick }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = toDateStr(new Date());
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAYS.map(d => <div key={d} className="text-center text-xs font-bold text-gray-400 py-3">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 flex-1">
        {cells.map((day, i) => {
          const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
          const events = day ? getEvents(dateStr, departmentName) : [];
          const isToday = dateStr === todayStr;
          return (
            <div key={i} onClick={() => day && onDayClick(dateStr)}
              className={`min-h-28 p-2 border-r border-b border-gray-100 cursor-pointer hover:bg-medical-50/30 transition-all duration-200 hover:shadow-inner ${!day ? 'bg-gray-50/40' : ''}`}>
              {day && (
                <>
                  <span className={`text-xs font-semibold inline-flex w-6 h-6 items-center justify-center rounded-full mb-1 ${isToday ? 'bg-medical-600 text-white' : 'text-gray-600'}`}>{day}</span>
                  <div className="space-y-0.5">
                    {events.slice(0, 3).map((e, j) => <EventChip key={j} e={e} small />)}
                    {events.length > 3 && <p className="text-[10px] text-gray-400 pl-1">+{events.length - 3} more</p>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ currentDate, departmentName }) {
  const weekDays = getWeekDays(currentDate);
  const todayStr = toDateStr(new Date());
  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-8 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="p-3" />
        {weekDays.map((d, i) => {
          const isToday = toDateStr(d) === todayStr;
          return (
            <div key={i} className="p-3 text-center border-l border-gray-100">
              <p className="text-xs text-gray-400">{DAYS[d.getDay()]}</p>
              <span className={`text-sm font-bold inline-flex w-8 h-8 items-center justify-center rounded-full ${isToday ? 'bg-medical-600 text-white' : 'text-gray-700'}`}>{d.getDate()}</span>
            </div>
          );
        })}
      </div>
      {HOURS.map(hour => (
        <div key={hour} className="grid grid-cols-8 border-b border-gray-50 min-h-20">
          <div className="p-2 pr-3 text-right flex-shrink-0">
            <span className="text-xs text-gray-400">{hour % 12 || 12}{hour < 12 ? 'am' : 'pm'}</span>
          </div>
          {weekDays.map((d, i) => {
            const events = getEvents(toDateStr(d), departmentName).filter(e => parseInt(e.time) === hour);
            return (
              <div key={i} className="border-l border-gray-50 p-1.5 space-y-1">
                {events.map((e, j) => (
                  <div key={j} className={`p-2 rounded text-xs leading-relaxed ${e.kind === 'appt' ? 'bg-medical-100 text-medical-800 border-l-3 border-medical-500' : 'bg-health-100 text-health-800 border-l-3 border-health-500'}`}>
                    <p className="font-bold text-xs">{e.time}</p>
                    {e.patientId && <p className="text-[9px] opacity-70">ID: #{e.patientId}</p>}
                    <p className="font-semibold text-xs truncate mt-0.5">{e.title}</p>
                    <p className="text-[9px] italic opacity-75 mt-0.5">{e.reason}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function DayView({ currentDate, departmentName }) {
  const events = getEvents(toDateStr(currentDate), departmentName);
  return (
    <div className="flex-1 overflow-auto">
      {HOURS.map(hour => {
        const hourEvents = events.filter(e => parseInt(e.time) === hour);
        return (
          <div key={hour} className="flex border-b border-gray-200 min-h-16">
            <div className="w-20 p-3 text-right pr-4 flex-shrink-0">
              <span className="text-xs text-gray-400">{hour % 12 || 12}{hour < 12 ? 'am' : 'pm'}</span>
            </div>
            <div className="flex-1 border-l border-gray-200 p-2 space-y-2">
              {hourEvents.map((e, i) => <EventChip key={i} e={e} small={false} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Appointments() {
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 27));
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const navigate = (dir) => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const headerLabel = useMemo(() => {
    if (view === 'month') return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (view === 'week') {
      const w = getWeekDays(currentDate);
      return `${w[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${w[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }, [view, currentDate]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Appointments" subtitle="Hospital departments and schedules" />
      <div className="flex flex-1 overflow-hidden">

        {/* Department sidebar */}
        <aside className="w-56 border-r border-gray-100 bg-gray-50/50 overflow-y-auto flex-shrink-0 p-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-3">Departments</p>
          <button
            onClick={() => setSelectedDepartment(null)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition ${!selectedDepartment ? 'bg-medical-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
          >
            <Building2 size={15} /> All Departments
          </button>
          {DEPARTMENTS.map((dept, idx) => (
            <button key={dept} onClick={() => setSelectedDepartment(dept)} style={{ animationDelay: `${(idx + 1) * 50}ms` }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1 transition text-left ${selectedDepartment === dept ? 'bg-medical-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-medical-500">{dept.charAt(0)}</div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{dept}</p>
                <p className={`text-[10px] truncate ${selectedDepartment === dept ? 'text-white/70' : 'text-gray-400'}`}>
                  {doctors.filter(d => d.department === dept).length} staff
                </p>
              </div>
            </button>
          ))}
        </aside>

        {/* Calendar area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-1">
              <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><ChevronLeft size={18} className="text-gray-500" /></button>
              <button onClick={() => navigate(1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><ChevronRight size={18} className="text-gray-500" /></button>
              <button onClick={() => setCurrentDate(new Date())} className="ml-1 px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600">Today</button>
              <span className="text-sm font-bold text-gray-800 ml-3">{headerLabel}</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {['Day', 'Week', 'Month'].map(v => (
                <button key={v} onClick={() => setView(v.toLowerCase())}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition ${view === v.toLowerCase() ? 'bg-white text-medical-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >{v}</button>
              ))}
            </div>
          </div>

            <div key={`${view}-${currentDate.toISOString()}`} className="flex-1 overflow-hidden flex flex-col animate-fade-in">
            {view === 'month' && <MonthView currentDate={currentDate} departmentName={selectedDepartment} onDayClick={d => { setCurrentDate(new Date(d + 'T12:00:00')); setView('day'); }} />}
            {view === 'week' && <WeekView currentDate={currentDate} departmentName={selectedDepartment} />}
            {view === 'day' && <DayView currentDate={currentDate} departmentName={selectedDepartment} />}
          </div>
        </div>
      </div>
    </div>
  );
}
