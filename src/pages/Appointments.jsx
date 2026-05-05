import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import Header from '../components/Header';
import { appointments, operations, doctors } from '../data/mockData';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

const getEvents = (dateStr, doctorName) => [
  ...appointments
    .filter(a => a.date === dateStr && (!doctorName || a.doctor === doctorName))
    .map(a => ({ kind: 'appt', title: a.patient, time: a.time, sub: `${a.type} · ${a.doctor}`, duration: a.duration })),
  ...operations
    .filter(o => o.date === dateStr && (!doctorName || o.surgeon === doctorName))
    .map(o => ({ kind: 'op', title: o.surgery, time: o.startTime, sub: `${o.or} · ${o.surgeon}`, duration: o.duration })),
].sort((a, b) => a.time.localeCompare(b.time));

function EventChip({ e, small }) {
  const cls = e.kind === 'appt'
    ? 'bg-medical-100 text-medical-800 border-l-4 border-medical-500'
    : 'bg-health-100 text-health-800 border-l-4 border-health-500';
  return small ? (
    <div className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate ${e.kind === 'appt' ? 'bg-medical-100 text-medical-700' : 'bg-health-100 text-health-700'}`}>
      {e.time} {e.title}
    </div>
  ) : (
    <div className={`p-2 rounded-lg text-xs ${cls}`}>
      <p className="font-bold">{e.time} · {e.kind === 'appt' ? 'Appointment' : 'Operation'}</p>
      <p className="font-semibold mt-0.5">{e.title}</p>
      <p className="opacity-60 text-[10px]">{e.sub}</p>
    </div>
  );
}

function MonthView({ currentDate, doctorName, onDayClick }) {
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
          const events = day ? getEvents(dateStr, doctorName) : [];
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

function WeekView({ currentDate, doctorName }) {
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
        <div key={hour} className="grid grid-cols-8 border-b border-gray-50 min-h-16">
          <div className="p-2 pr-3 text-right flex-shrink-0">
            <span className="text-xs text-gray-400">{hour % 12 || 12}{hour < 12 ? 'am' : 'pm'}</span>
          </div>
          {weekDays.map((d, i) => {
            const events = getEvents(toDateStr(d), doctorName).filter(e => parseInt(e.time) === hour);
            return (
              <div key={i} className="border-l border-gray-50 p-1 space-y-1">
                {events.map((e, j) => (
                  <div key={j} className={`text-[10px] px-1.5 py-1 rounded font-medium leading-tight ${e.kind === 'appt' ? 'bg-medical-100 text-medical-700' : 'bg-health-100 text-health-700'}`}>
                    <p className="font-bold">{e.time}</p>
                    <p className="truncate">{e.title}</p>
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

function DayView({ currentDate, doctorName }) {
  const events = getEvents(toDateStr(currentDate), doctorName);
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
  const [selectedDoctor, setSelectedDoctor] = useState(null);

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
      <Header title="Appointments" subtitle="Hospital schedule and doctor calendars" />
      <div className="flex flex-1 overflow-hidden">

        {/* Doctor sidebar */}
        <aside className="w-56 border-r border-gray-100 bg-gray-50/50 overflow-y-auto flex-shrink-0 p-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-3">Doctors</p>
          <button
            onClick={() => setSelectedDoctor(null)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition ${!selectedDoctor ? 'bg-medical-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
          >
            <Users size={15} /> All Doctors
          </button>
          {doctors.map(doc => (
            <button key={doc.id} onClick={() => setSelectedDoctor(doc.name)} style={{ animationDelay: `${doc.id * 50}ms` }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1 transition text-left ${selectedDoctor === doc.name ? 'bg-medical-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: doc.color }}>{doc.avatar}</div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{doc.name.replace('Dr. ', '')}</p>
                <p className={`text-[10px] truncate ${selectedDoctor === doc.name ? 'text-white/70' : 'text-gray-400'}`}>{doc.specialty}</p>
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
            {view === 'month' && <MonthView currentDate={currentDate} doctorName={selectedDoctor} onDayClick={d => { setCurrentDate(new Date(d + 'T12:00:00')); setView('day'); }} />}
            {view === 'week' && <WeekView currentDate={currentDate} doctorName={selectedDoctor} />}
            {view === 'day' && <DayView currentDate={currentDate} doctorName={selectedDoctor} />}
          </div>
        </div>
      </div>
    </div>
  );
}
