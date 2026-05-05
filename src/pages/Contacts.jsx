import { useState, useMemo } from 'react';
import { Search, X, ChevronRight, Droplets, Phone, Mail, Calendar, MessageSquare, MapPin, Clock, SearchX } from 'lucide-react';
import Header from '../components/Header';
import { patients, appointments, calls } from '../data/mockData';

const STATUS_CLS = {
  active: 'bg-health-600 text-white',
  critical: 'bg-red-600 text-white',
  recovery: 'bg-amber-500 text-white',
  discharged: 'bg-gray-500 text-white',
};

function Drawer({ patient, onClose }) {
  const appts = useMemo(() => patient
    ? appointments.filter(a => a.patientId === patient.id).sort((a, b) => b.date.localeCompare(a.date))
    : [], [patient]);
  const comms = useMemo(() => patient ? calls.filter(c => c.patientId === patient.id) : [], [patient]);

  if (!patient) return null;
  const closed = patient.status === 'discharged';

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in" />
      <div className="fixed right-0 top-0 h-full w-[500px] bg-white dark:bg-slate-800 z-50 shadow-2xl overflow-y-auto flex flex-col animate-slide-up">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-medical-700 via-medical-600 to-teal-600 p-6 text-white flex-shrink-0 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition">
            <X size={18} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl font-bold">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-bold">{patient.name}</h2>
              <p className="text-white/70 text-sm mt-0.5">
                ID: MED-{String(patient.id).padStart(4, '0')} · {patient.age}y · {patient.gender} · {patient.bloodGroup}
              </p>
              <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-bold mt-2 ${closed ? 'bg-white/20' : 'bg-green-400/30'}`}>
                {closed ? '● Case Closed' : '● Case Open'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Case Summary */}
          <section>
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Case Summary</p>
            <div className="bg-medical-50 dark:bg-slate-700 rounded-2xl p-4 border border-medical-100 dark:border-slate-600">
              <p className="font-bold text-medical-800 dark:text-medical-300">{patient.condition}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Attending: {patient.doctor}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><MapPin size={11}/> {patient.city}</span>
                <span className="flex items-center gap-1"><Calendar size={11}/> Since {new Date(patient.registeredOn).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                <span className="flex items-center gap-1"><Clock size={11}/> Last visit {patient.lastVisit}</span>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Contact Info</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-slate-300">
                <Phone size={15} className="text-medical-500" /> {patient.phone}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-slate-300">
                <Mail size={15} className="text-teal-500" /> {patient.email}
              </div>
            </div>
          </section>

          {/* Appointments */}
          <section>
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              Appointment History ({appts.length})
            </p>
            {appts.length ? appts.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 mb-2 bg-gray-50 dark:bg-slate-700/60 rounded-xl border border-gray-100 dark:border-slate-600 hover:border-medical-200 dark:hover:border-medical-700 transition-colors">
                <Calendar size={14} className="text-medical-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{a.type}</p>
                    <span className={`badge text-[10px] ${a.status === 'completed' ? 'badge-gray' : 'badge-blue'}`}>{a.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{a.date} · {a.time} · {a.doctor}</p>
                  {a.notes && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 italic">{a.notes}</p>}
                </div>
              </div>
            )) : <p className="text-sm text-gray-400 italic">No appointments on record.</p>}
          </section>

          {/* Communications */}
          <section>
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              Agent Communications ({comms.length})
            </p>
            {comms.length ? comms.map(c => (
              <div key={c.id} className="p-3 mb-2 bg-gray-50 dark:bg-slate-700/60 rounded-xl border border-gray-100 dark:border-slate-600 hover:border-teal-200 dark:hover:border-teal-700 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={13} className="text-teal-500" />
                    <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{c.agent}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500">{c.date} · {c.time}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-400 ml-5">{c.outcome} · {c.duration}</p>
                <div className="flex gap-1.5 mt-2 ml-5 flex-wrap">
                  {c.tags?.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full font-medium">{t}</span>
                  ))}
                </div>
              </div>
            )) : <p className="text-sm text-gray-400 italic">No communications on record.</p>}
          </section>
        </div>
      </div>
    </>
  );
}

export default function Contacts() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [blood, setBlood] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => patients.filter(p =>
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase())) &&
    (status === 'All' || p.status === status) &&
    (blood === 'All' || p.bloodGroup === blood)
  ), [search, status, blood]);

  const STATUSES = ['All', 'active', 'critical', 'recovery', 'discharged'];
  const BLOODS = ['All', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  return (
    <div className="flex flex-col h-full">
      <Header title="Patients" subtitle="Patient registry and case management" />
      <div className="flex-1 p-8 overflow-auto">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 animate-slide-up">
          <div className="relative flex-1 min-w-52">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search name or condition..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border capitalize transition-all duration-200 ${
                  status === s
                    ? 'bg-medical-600 text-white border-medical-600 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-medical-400 hover:text-medical-700'
                }`}>
                {s}
              </button>
            ))}
          </div>
          <select value={blood} onChange={e => setBlood(e.target.value)} className="input w-24 text-sm">
            {BLOODS.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden animate-fade-in animate-delay-100">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-medical-100 bg-gradient-to-r from-medical-50 to-teal-50">
                {['Patient', 'ID', 'Condition', 'Doctor', 'Blood', 'Last Visit', 'Status', ''].map(h => (
                  <th key={h} className="table-header text-medical-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} onClick={() => setSelected(p)}
                  style={{ animationDelay: `${i * 55}ms`, opacity: 0, animation: `slideUp 0.45s ease-out ${i * 55}ms forwards` }}
                  className="table-row cursor-pointer group hover:shadow-sm">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md transition-all duration-300">
                        {p.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{p.age}y · {p.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="font-mono text-xs font-bold text-medical-700 bg-medical-100 border border-medical-200 px-2.5 py-1 rounded-lg">
                      MED-{String(p.id).padStart(4, '0')}
                    </span>
                  </td>
                  <td className="table-cell font-semibold text-gray-800">{p.condition}</td>
                  <td className="table-cell font-medium text-gray-700">{p.doctor}</td>
                  <td className="table-cell">
                    <span className="flex items-center gap-1.5 font-bold text-gray-800">
                      <Droplets size={13} className="text-red-500" />{p.bloodGroup}
                    </span>
                  </td>
                  <td className="table-cell font-semibold text-gray-700">{p.lastVisit}</td>
                  <td className="table-cell">
                    <span className={`badge capitalize font-bold ${STATUS_CLS[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="table-cell">
                    <ChevronRight size={17} className="text-gray-400 group-hover:text-medical-600 group-hover:translate-x-1.5 transition-all duration-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="py-16 text-center animate-fade-in">
              <SearchX size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400 text-sm font-medium">No patients match the current filters.</p>
            </div>
          )}
        </div>
      </div>
      <Drawer patient={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
