import { useState, useRef, useEffect } from 'react';
import {
  PhoneCall, PhoneIncoming, PhoneMissed,
  Play, Pause, Volume2, Clock, Tag,
  ChevronRight, Search, Mic, MessageSquare,
  History, TrendingUp, TrendingDown, Minus,
  ArrowRightLeft, Bot, User, FileText,
  Droplets, Stethoscope, CalendarDays, MapPin,
  PanelLeftClose, PanelRightClose, PanelLeftOpen, PanelRightOpen, CheckCircle
} from 'lucide-react';
import { createPortal } from 'react-dom';
import Header from '../components/Header';
import { calls, patients } from '../data/mockData';

const OUTCOME_CFG = {
  'Appointment Booked':    'bg-health-100 text-health-700',
  'Query Resolved':        'bg-medical-100 text-medical-700',
  'Reminder Sent':         'bg-amber-100 text-amber-700',
  'Reschedule':            'bg-purple-100 text-purple-700',
  'Missed Call':           'bg-red-100 text-red-600',
  'Complaint Escalated':   'bg-red-100 text-red-700',
  'Transferred to Agent':  'bg-amber-100 text-amber-700',
  'Follow-up Done':        'bg-teal-100 text-teal-700',
};
const outcomeCls = (o) => OUTCOME_CFG[o] || 'bg-gray-100 text-gray-600';

const TYPE_CFG = {
  inbound:  { label: 'Inbound',  icon: PhoneIncoming, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  outbound: { label: 'Outbound', icon: PhoneCall,     color: 'text-blue-600',    bg: 'bg-blue-100' },
  missed:   { label: 'Missed',   icon: PhoneMissed,   color: 'text-red-600',     bg: 'bg-red-100' },
};

const SENT_CFG = {
  positive: { icon: TrendingUp,   color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Positive' },
  neutral:  { icon: Minus,        color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200',       label: 'Neutral' },
  negative: { icon: TrendingDown, color: 'text-red-600',     bg: 'bg-red-50 border-red-200',         label: 'Negative' },
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

function WaveformPlayer({ duration, isPlaying, onToggle }) {
  const bars = Array.from({ length: 44 }, () => Math.random() * 0.6 + 0.3);
  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-medical-50 to-teal-50 rounded-xl border border-medical-100">
      <button onClick={onToggle}
        className="w-11 h-11 bg-medical-600 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-medical-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105">
        {isPlaying ? <Pause size={17} className="text-white" /> : <Play size={17} className="text-white ml-0.5" />}
      </button>
      <div className="flex items-center gap-0.5 flex-1 h-8 overflow-hidden">
        {bars.map((h, i) => (
          <div key={i}
            className={`flex-1 rounded-full transition-all duration-300 ${
              isPlaying && i < 16 ? 'bg-medical-600' :
              isPlaying ? 'bg-medical-200' : 'bg-gray-300'
            }`}
            style={{
              height: `${h * 100}%`,
              animation: isPlaying && i < 16 ? `wave ${0.8 + (i % 3) * 0.3}s ease-in-out infinite` : 'none',
              animationDelay: isPlaying ? `${(i % 5) * 0.1}s` : '0s',
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs font-mono font-bold text-gray-600">{duration}</span>
        <Volume2 size={14} className="text-medical-400" />
      </div>
    </div>
  );
}

function TranscriptLine({ line, index }) {
  if (line.speaker === 'System') {
    return (
      <div className="flex items-center gap-3 py-2 animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
        <div className="flex-1 h-px bg-amber-200" />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full flex-shrink-0">
          <ArrowRightLeft size={12} className="text-amber-600" />
          <span className="text-xs font-bold text-amber-700">{line.text}</span>
        </div>
        <div className="flex-1 h-px bg-amber-200" />
      </div>
    );
  }
  const isPatient = line.speaker === 'Patient';
  const isAI = line.agentType === 'AI' || (!isPatient && !line.agentType);
  const isCS = line.agentType === 'Customer Service';
  return (
    <div className={`flex gap-3 animate-slide-up ${isPatient ? 'flex-row-reverse' : ''}`}
      style={{ animationDelay: `${index * 35}ms`, opacity: 0, animation: `slideUp 0.35s ease-out ${index * 35}ms forwards` }}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-sm ${
        isPatient ? 'bg-gray-500' : isCS ? 'bg-teal-600' : 'bg-medical-600'
      }`}>
        {isPatient ? <User size={13} /> : isCS ? <User size={13} /> : <Bot size={13} />}
      </div>
      <div className={`max-w-[72%] ${isPatient ? 'text-right' : ''}`}>
        <p className={`text-[10px] font-bold mb-1 ${isPatient ? 'text-gray-500' : isCS ? 'text-teal-600' : 'text-medical-600'}`}>
          {isPatient ? 'Patient' : isCS ? 'Customer Service' : 'MedVoice AI'} · {line.time}
        </p>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isPatient ? 'bg-gray-100 border border-gray-200 text-gray-800 rounded-tr-sm' :
          isCS ? 'bg-teal-50 border border-teal-100 text-gray-800 rounded-tl-sm' :
          'bg-medical-50 border border-medical-100 text-gray-800 rounded-tl-sm'
        }`}>{line.text}</div>
      </div>
    </div>
  );
}

export default function VoiceCalls() {
  const [selectedCall, setSelectedCall] = useState(calls[0]);
  const [playing, setPlaying] = useState(false);
  const [playingHistoryId, setPlayingHistoryId] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilters, setTypeFilters] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');
  const [historySelected, setHistorySelected] = useState(null);
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);

  const patientCalls = selectedCall ? calls.filter(c => c.patientId === selectedCall.patientId) : [];
  const filteredCalls = calls.filter(c =>
    (c.patient.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)) &&
    (!typeFilters.length || typeFilters.includes(c.type))
  );

  const sCfg = selectedCall ? SENT_CFG[selectedCall.sentiment] : null;
  const SIcon = sCfg?.icon;

  const selectCall = (call) => { setSelectedCall(call); setPlaying(false); setHistorySelected(null); setActiveTab('summary'); };

  return (
    <div className="flex flex-col h-full">
      <Header title="Voice Calls" subtitle="AI & agent call recordings, transcripts and patient history" />
      <div className="flex-1 overflow-hidden flex">

        {/* Left: Call List */}
        <div className={`flex-shrink-0 border-r border-gray-100 flex flex-col bg-white transition-all duration-300 ${showLeft ? 'w-80' : 'w-0 overflow-hidden'}`}>
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">All Calls</span>
              <button onClick={() => setShowLeft(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <PanelLeftClose size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="flex gap-2 items-center mb-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9 text-sm py-2" placeholder="Search calls..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <FilterDropdown
                type="Call Type"
                selected={typeFilters}
                onChange={setTypeFilters}
                options={['inbound', 'outbound', 'missed']}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredCalls.map((call, i) => {
              const tCfg = TYPE_CFG[call.type];
              const TypeIcon = tCfg.icon;
              const isSelected = selectedCall?.id === call.id;
              return (
                <button key={call.id} onClick={() => selectCall(call)}
                  style={{ animationDelay: `${i * 40}ms`, opacity: 0, animation: `slideUp 0.4s ease-out ${i * 40}ms forwards` }}
                  className={`w-full p-4 border-b border-gray-50 text-left transition-all hover:bg-gray-50 border-l-4 ${
                    isSelected ? 'bg-medical-50 border-l-medical-500' : 'border-l-transparent'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl ${tCfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <TypeIcon size={16} className={tCfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="font-bold text-gray-900 text-sm truncate">{call.patient}</p>
                        <span className="text-xs text-gray-400 flex-shrink-0">{call.time}</span>
                      </div>
                      <p className="text-gray-500 text-xs truncate font-medium">{call.phone}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs font-bold ${tCfg.color}`}>{tCfg.label}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 font-medium"><Clock size={10}/>{call.duration}</span>
                        {call.transferred && <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5"><ArrowRightLeft size={9}/>Transfer</span>}
                        {call.recording && <Mic size={10} className="text-medical-400" />}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 pl-12">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${outcomeCls(call.outcome)}`}>{call.outcome}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Detail */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedCall ? (
            <>
              {/* Panel toggles bar */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-50 bg-gray-50/60">
                {!showLeft && (
                  <button onClick={() => setShowLeft(true)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-medical-600 px-2 py-1.5 rounded-lg hover:bg-white transition-all">
                    <PanelLeftOpen size={15}/> Calls
                  </button>
                )}
                <span className="flex-1" />
                {!showRight && (
                  <button onClick={() => setShowRight(true)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-medical-600 px-2 py-1.5 rounded-lg hover:bg-white transition-all">
                    Patient Info <PanelRightOpen size={15}/>
                  </button>
                )}
              </div>

              {/* Call Header */}
              <div className="p-6 border-b border-gray-100 bg-white animate-fade-in">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-medical-500 to-teal-500 flex items-center justify-center text-white font-bold text-base shadow-md">
                      {selectedCall.patient.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 text-lg">{selectedCall.patient}</h2>
                      <p className="text-gray-500 text-sm">{selectedCall.phone} · {selectedCall.date} at {selectedCall.time}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          selectedCall.agent.includes('→') ? 'bg-amber-100 text-amber-700' :
                          selectedCall.agent === 'Customer Service' ? 'bg-teal-100 text-teal-700' :
                          'bg-medical-100 text-medical-700'
                        }`}>
                          {selectedCall.agent.includes('→') ? <><ArrowRightLeft size={10} className="inline mr-1"/>{selectedCall.agent}</> : selectedCall.agent}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">Duration</p>
                    <p className="font-bold text-gray-800">{selectedCall.duration}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${outcomeCls(selectedCall.outcome)}`}>{selectedCall.outcome}</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 bg-white">
                {[
                  { key: 'summary', icon: FileText, label: 'Summary' },
                  { key: 'history', icon: History, label: `Call History (${patientCalls.length})` },
                ].map(({ key, icon: Icon, label }) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all ${
                      activeTab === key ? 'border-medical-500 text-medical-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}>
                    <Icon size={15}/>{label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/40">
                {/* SUMMARY TAB */}
                {activeTab === 'summary' && (
                  <div className="animate-fade-in">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText size={16} className="text-medical-600" />
                        <h3 className="font-bold text-gray-800">Call Summary</h3>
                      </div>
                      <p className="text-gray-700 text-base leading-relaxed">{selectedCall.summary || 'No summary available for this call.'}</p>
                    </div>
                  </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'history' && (
                  <div className="space-y-3 animate-fade-in">
                    {patientCalls.map((call, i) => {
                      const tCfg = TYPE_CFG[call.type]; const TypeIcon = tCfg.icon;
                      const isOpen = historySelected?.id === call.id;
                      return (
                        <div key={call.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card animate-slide-up"
                          style={{ animationDelay: `${i * 60}ms` }}>
                          <div onClick={() => setHistorySelected(isOpen ? null : call)}
                            className={`flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-gray-50 ${isOpen ? 'border-b border-gray-100' : ''}`}>
                            <div className={`w-10 h-10 rounded-xl ${tCfg.bg} flex items-center justify-center flex-shrink-0`}>
                              <TypeIcon size={16} className={tCfg.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-bold text-gray-800 text-sm">{call.outcome}</p>
                                <span className="text-xs text-gray-400 flex-shrink-0">{call.date}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-xs font-bold ${
                                  call.agent.includes('→') ? 'text-amber-600' :
                                  call.agent === 'Customer Service' ? 'text-teal-600' : 'text-medical-600'
                                }`}>{call.agent}</span>
                                <span className="text-gray-300">·</span>
                                <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><Clock size={10}/>{call.duration}</span>
                                {call.transferred && <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5"><ArrowRightLeft size={10}/>Transferred</span>}
                                {call.recording && <Mic size={10} className="text-medical-400" />}
                              </div>
                            </div>
                            <ChevronRight size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
                          </div>

                          {isOpen && (
                            <div className="p-4 bg-gray-50/60 animate-fade-in">
                              {call.recording && (
                                <div className="mb-4">
                                  <WaveformPlayer
                                    duration={call.duration}
                                    isPlaying={playingHistoryId === call.id}
                                    onToggle={() => setPlayingHistoryId(p => p === call.id ? null : call.id)}
                                  />
                                </div>
                              )}
                              {call.transcript.length > 0 ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-2 flex-wrap">
                                    <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-medical-600 flex items-center justify-center"><Bot size={10} className="text-white"/></div>MedVoice AI</div>
                                    <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center"><User size={10} className="text-white"/></div>Customer Service</div>
                                    <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center"><User size={10} className="text-white"/></div>Patient</div>
                                  </div>
                                  {call.transcript.map((line, j) => <TranscriptLine key={j} line={line} index={j} />)}
                                </div>
                              ) : (
                                <p className="text-center text-gray-400 text-sm py-6 italic">No transcript available</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center animate-fade-in">
                <PhoneCall size={40} className="mx-auto mb-3 opacity-30" />
                <p>Select a call to view details</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Patient Info */}
        {selectedCall && (() => {
          const patient = patients.find(p => p.id === selectedCall.patientId);
          if (!patient) return null;
          return (
            <div className={`flex-shrink-0 border-l border-gray-100 bg-white flex flex-col overflow-y-auto animate-fade-in transition-all duration-300 ${showRight ? 'w-60' : 'w-0 overflow-hidden'}`}>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Info</p>
                <button onClick={() => setShowRight(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <PanelRightClose size={15} className="text-gray-400" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="text-center py-3 border-b border-gray-50">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-medical-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 shadow-md">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{patient.name}</p>
                  <p className="text-gray-500 text-xs">{patient.age}y · {patient.gender}</p>
                  <span className={`badge mt-2 font-bold ${
                    patient.status === 'active' ? 'bg-health-600 text-white' :
                    patient.status === 'critical' ? 'bg-red-600 text-white' :
                    patient.status === 'recovery' ? 'bg-amber-500 text-white' : 'bg-gray-500 text-white'
                  }`}>{patient.status}</span>
                </div>
                {[
                  { label: 'Blood Group', value: patient.bloodGroup },
                  { label: 'Condition',   value: patient.condition },
                  { label: 'Doctor',      value: patient.doctor },
                  { label: 'Last Visit',  value: new Date(patient.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Call Overview</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['inbound','outbound','missed'].map(type => {
                      const count = patientCalls.filter(c => c.type === type).length;
                      const cfg = TYPE_CFG[type]; const TIcon = cfg.icon;
                      return (
                        <div key={type} className={`${cfg.bg} rounded-xl p-2.5 text-center`}>
                          <TIcon size={15} className={`${cfg.color} mx-auto mb-1`} />
                          <p className={`font-bold text-xl ${cfg.color}`}>{count}</p>
                          <p className="text-[10px] text-gray-500 capitalize font-medium">{type}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
