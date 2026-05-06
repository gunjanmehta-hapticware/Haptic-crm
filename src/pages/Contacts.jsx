import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, ChevronRight, Phone, Mail, Calendar, MessageSquare, MapPin, Clock, SearchX, Users, PhoneIncoming, CheckCircle, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import Header from '../components/Header';
import { patients, appointments, calls, leads } from '../data/mockData';

const STATUS_CLS = {
  active: 'bg-health-600 text-white',
  critical: 'bg-red-600 text-white',
  recovery: 'bg-amber-500 text-white',
  discharged: 'bg-gray-500 text-white',
};

const LEAD_STATUS_CLS = {
  hot:  'bg-red-500 text-white',
  warm: 'bg-amber-400 text-white',
  cold: 'bg-health-500 text-white',
};

/* ─── Filter Dropdown ─── */
function FilterDropdown({ type, selected, onChange, options }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef();
  const dropRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target) &&
          dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openDropdown = () => {
    setOpen(!open);
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      let left = r.left;
      if (left + 300 > viewportWidth) {
        left = viewportWidth - 300 - 16;
      }
      setPos({ top: r.bottom + 8, left });
    }
  };

  const toggleOption = (opt) => {
    onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt]);
  };

  const selectAll = () => onChange(options);
  const clearAll = () => onChange([]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={openDropdown}
        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2"
      >
        <span>+ Add Filter</span>
        {selected.length > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-medical-600 rounded-full ml-1">
            {selected.length}
          </span>
        )}
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setOpen(false)} />
          <div
            ref={dropRef}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
              animation: 'slideUp 0.2s ease-out',
              width: 300,
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
            className="bg-white border border-gray-100 rounded-xl shadow-lg"
          >
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Filter by {type}</p>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-medical-600 hover:text-medical-700 font-semibold">Select All</button>
                <span className="text-gray-300">|</span>
                <button onClick={clearAll} className="text-xs text-medical-600 hover:text-medical-700 font-semibold">Clear</button>
              </div>
            </div>

            <div>
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  className="w-full px-4 py-3 text-sm text-left transition-all duration-150 border-b border-gray-50 last:border-0 hover:bg-medical-50 flex items-center gap-3 group"
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selected.includes(opt) ? 'bg-medical-600 border-medical-600' : 'border-gray-300 group-hover:border-medical-400'
                  }`}>
                    {selected.includes(opt) && <CheckCircle size={12} className="text-white" />}
                  </div>
                  <span className={`text-sm capitalize ${selected.includes(opt) ? 'text-medical-700 font-semibold' : 'text-gray-700 group-hover:text-medical-700'}`}>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

function PatientDrawer({ patient, onClose }) {
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
                MED-{String(patient.id).padStart(4, '0')} · {patient.crmId} · {patient.age}y · {patient.gender}
              </p>
              <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-bold mt-2 ${closed ? 'bg-white/20' : 'bg-green-400/30'}`}>
                {closed ? 'Case Closed' : 'Case Open'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <section>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Case Summary</p>
            <div className="bg-medical-50 rounded-2xl p-4 border border-medical-100">
              <p className="font-bold text-medical-800">{patient.condition}</p>
              <p className="text-sm text-gray-500 mt-1">Attending: {patient.doctor}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={11}/> {patient.city}</span>
                <span className="flex items-center gap-1"><Calendar size={11}/> Since {new Date(patient.registeredOn).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                <span className="flex items-center gap-1"><Clock size={11}/> Last visit {patient.lastVisit}</span>
              </div>
            </div>
          </section>

          <section>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Contact Info</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Phone size={15} className="text-medical-500" /> {patient.phone}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Mail size={15} className="text-teal-500" /> {patient.email}
              </div>
            </div>
          </section>

          <section>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Appointment History ({appts.length})
            </p>
            {appts.length ? appts.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 mb-2 bg-gray-50 rounded-xl border border-gray-100 hover:border-medical-200 transition-colors">
                <Calendar size={14} className="text-medical-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800">{a.type}</p>
                    <span className={`badge text-[10px] ${a.status === 'completed' ? 'badge-gray' : 'badge-blue'}`}>{a.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{a.date} · {a.time} · {a.doctor}</p>
                  {a.notes && <p className="text-xs text-gray-500 mt-1 italic">{a.notes}</p>}
                </div>
              </div>
            )) : <p className="text-sm text-gray-400 italic">No appointments on record.</p>}
          </section>

          <section>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Agent Communications ({comms.length})
            </p>
            {comms.length ? comms.map(c => (
              <div key={c.id} className="p-3 mb-2 bg-gray-50 rounded-xl border border-gray-100 hover:border-teal-200 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={13} className="text-teal-500" />
                    <span className="text-sm font-bold text-gray-800">{c.agent}</span>
                  </div>
                  <span className="text-xs text-gray-400">{c.date} · {c.time}</span>
                </div>
                <p className="text-xs text-gray-600 ml-5">{c.outcome} · {c.duration}</p>
                <div className="flex gap-1.5 mt-2 ml-5 flex-wrap">
                  {c.tags?.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium">{t}</span>
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

function LeadDrawer({ lead, onClose }) {
  if (!lead) return null;
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in" />
      <div className="fixed right-0 top-0 h-full w-[460px] bg-white z-50 shadow-2xl overflow-y-auto flex flex-col animate-slide-up">
        <div className="bg-gradient-to-br from-amber-600 via-orange-500 to-red-500 p-6 text-white flex-shrink-0 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition">
            <X size={18} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl font-bold">
              {lead.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-bold">{lead.name}</h2>
              <p className="text-white/70 text-sm mt-0.5">{lead.phone} · {lead.city}</p>
              <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-bold mt-2 capitalize bg-white/20`}>
                {lead.status} Lead
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 p-6 space-y-6">
          <section>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Inquiry Details</p>
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <p className="font-semibold text-amber-900">{lead.inquiry}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><PhoneIncoming size={11}/> {lead.source}</span>
                <span className="flex items-center gap-1"><Clock size={11}/> {lead.callDate} at {lead.callTime}</span>
                <span className="flex items-center gap-1"><MapPin size={11}/> {lead.city}</span>
              </div>
            </div>
          </section>
          <section>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Call Outcome</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Handled by</span>
                <span className="text-sm font-semibold text-gray-800">{lead.agent}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Outcome</span>
                <span className="text-sm font-semibold text-gray-800">{lead.outcome}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Follow-up date</span>
                <span className="text-sm font-semibold text-gray-800">{lead.followUpDate}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default function Contacts() {
  const [tab, setTab] = useState('patients');
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [leadStatuses, setLeadStatuses] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  const filteredPatients = useMemo(() => patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (!statuses.length || statuses.includes(p.status))
  ), [search, statuses]);

  const filteredLeads = useMemo(() => leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) &&
    (!leadStatuses.length || leadStatuses.includes(l.status))
  ), [search, leadStatuses]);

  const PATIENT_STATUS_OPTIONS = ['active', 'critical', 'recovery', 'discharged'];
  const LEAD_STATUS_OPTIONS = ['hot', 'warm', 'cold'];

  return (
    <div className="flex flex-col h-full">
      <Header title="Patients" subtitle="Patient registry and lead management" />
      <div className="flex-1 p-8 overflow-auto">

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => { setTab('patients'); setSearch(''); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${tab === 'patients' ? 'bg-white text-medical-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Users size={15} /> Patients
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tab === 'patients' ? 'bg-medical-100 text-medical-700' : 'bg-gray-200 text-gray-500'}`}>{patients.length}</span>
          </button>
          <button
            onClick={() => { setTab('leads'); setSearch(''); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${tab === 'leads' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <PhoneIncoming size={15} /> Call Leads
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tab === 'leads' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-500'}`}>{leads.length}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 animate-slide-up">
          <div className="relative flex-1 min-w-52">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder={tab === 'patients' ? 'Search patient name...' : 'Search lead name...'}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <FilterDropdown
            type={tab === 'patients' ? 'Patient Status' : 'Lead Status'}
            selected={tab === 'patients' ? statuses : leadStatuses}
            onChange={tab === 'patients' ? setStatuses : setLeadStatuses}
            options={tab === 'patients' ? PATIENT_STATUS_OPTIONS : LEAD_STATUS_OPTIONS}
          />
        </div>

        {/* Patients Table */}
        {tab === 'patients' && (
          <div className="card p-0 overflow-hidden animate-fade-in">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-medical-100 bg-gradient-to-r from-medical-50 to-teal-50">
                  {['Patient', 'Med ID', 'CRM ID', 'Doctor', 'Last Visit', 'Status', ''].map(h => (
                    <th key={h} className="table-header text-medical-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p, i) => (
                  <tr key={p.id} onClick={() => setSelectedPatient(p)}
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
                    <td className="table-cell">
                      <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                        {p.crmId}
                      </span>
                    </td>
                    <td className="table-cell font-medium text-gray-700">{p.doctor}</td>
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
            {!filteredPatients.length && (
              <div className="py-16 text-center animate-fade-in">
                <SearchX size={36} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-400 text-sm font-medium">No patients match the current filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Leads Table */}
        {tab === 'leads' && (
          <div className="card p-0 overflow-hidden animate-fade-in">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-medical-100 bg-gradient-to-r from-medical-50 to-teal-50">
                  {['Lead', 'CRM ID', 'Inquiry', 'Called', 'Follow-up', 'Status', ''].map(h => (
                    <th key={h} className="table-header text-medical-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((l, i) => (
                  <tr key={l.id} onClick={() => setSelectedLead(l)}
                    style={{ animationDelay: `${i * 55}ms`, opacity: 0, animation: `slideUp 0.45s ease-out ${i * 55}ms forwards` }}
                    className="table-row cursor-pointer group hover:shadow-sm">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md transition-all duration-300">
                          {l.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{l.name}</p>
                          <p className="text-xs text-gray-400">{l.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                        {l.crmId}
                      </span>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-gray-700 max-w-52 leading-snug">{l.inquiry}</p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm font-semibold text-gray-700">{l.callDate}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{l.callTime}</p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm font-semibold text-gray-700">{l.followUpDate}</p>
                    </td>
                    <td className="table-cell">
                      <span className={`badge capitalize font-bold ${LEAD_STATUS_CLS[l.status]}`}>{l.status}</span>
                    </td>
                    <td className="table-cell">
                      <ChevronRight size={17} className="text-gray-400 group-hover:text-medical-600 group-hover:translate-x-1.5 transition-all duration-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredLeads.length && (
              <div className="py-16 text-center animate-fade-in">
                <SearchX size={36} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-400 text-sm font-medium">No leads match the current filters.</p>
              </div>
            )}
          </div>
        )}

      </div>
      <PatientDrawer patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
}
