import { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Plus, ChevronLeft, Play, Pause, Copy, CheckCheck,
  QrCode, Link2, X, Megaphone, ArrowRight, CheckCircle,
} from 'lucide-react';
import Header from '../components/Header';
import { campaigns as initialCampaigns } from '../data/mockData';

/* ─── Constants ─── */
const ONLINE_CHANNELS = [
  { id: 'Instagram',   label: 'Instagram',    color: '#E1306C', icon: '📸' },
  { id: 'Facebook',    label: 'Facebook',     color: '#1877F2', icon: '👤' },
  { id: 'Google Ads',  label: 'Google Ads',   color: '#0284C7', icon: '🔍' },
  { id: 'WhatsApp',    label: 'WhatsApp',     color: '#25D366', icon: '💬' },
  { id: 'YouTube',     label: 'YouTube',      color: '#FF0000', icon: '▶️' },
  { id: 'Twitter/X',   label: 'Twitter / X',  color: '#000000', icon: '𝕏' },
];
const OFFLINE_CHANNELS = [
  { id: 'Hospital Counter',  label: 'Hospital Counter',  color: '#0891B2', icon: '🏥' },
  { id: 'Health Camp',       label: 'Health Camp',       color: '#059669', icon: '⛺' },
  { id: 'Pamphlet / Flyer',  label: 'Pamphlet / Flyer',  color: '#D97706', icon: '📄' },
  { id: 'Banner / Hoarding', label: 'Banner / Hoarding', color: '#7C3AED', icon: '🪧' },
  { id: 'Newspaper Ad',      label: 'Newspaper Ad',      color: '#374151', icon: '📰' },
  { id: 'TV / Radio',        label: 'TV / Radio',        color: '#DC2626', icon: '📺' },
];
const DEPARTMENTS = ['OPD','IPD','Operation Theatre','Ophthalmology','Optometry','LASIK','Cardiology','Orthopedics'];
const FORM_FIELD_OPTIONS = ['Name','Phone','Email','Age','City','Gender','Inquiry / Complaint','Current Diagnosis','Doctor Preference','Preferred Date'];

const STATUS_STYLE = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
  paused: { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500',   label: 'Paused' },
  ended:  { bg: 'bg-gray-100',    text: 'text-gray-500',    dot: 'bg-gray-400',    label: 'Ended'  },
};

/* ─── QR Code SVG generator ─── */
function QRCode({ seed, size = 96 }) {
  const cells = 9, cell = size / cells;
  const n = seed.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0);
  const isCorner = (r, c) => (r < 3 && c < 3) || (r < 3 && c >= cells - 3) || (r >= cells - 3 && c < 3);
  const grid = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => isCorner(r, c) || ((n * (r + 3) * (c + 7)) % 4 < 2))
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" rx="4" />
      {grid.map((row, r) => row.map((on, c) =>
        on ? <rect key={`${r}-${c}`} x={c * cell + 0.5} y={r * cell + 0.5} width={cell - 1} height={cell - 1} fill="#1e293b" rx="1.5" /> : null
      ))}
      {/* Corner squares overlay */}
      {[[0, 0], [0, cells - 3], [cells - 3, 0]].map(([r, c], i) => (
        <g key={i}>
          <rect x={c * cell + 0.5} y={r * cell + 0.5} width={3 * cell - 1} height={3 * cell - 1} fill="none" stroke="#1e293b" strokeWidth="2" rx="3" />
          <rect x={c * cell + cell + 0.5} y={r * cell + cell + 0.5} width={cell - 1} height={cell - 1} fill="#1e293b" rx="1" />
        </g>
      ))}
    </svg>
  );
}

/* ─── Funnel bar ─── */
function FunnelBar({ label, value, max, color, pct }) {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW(Math.round((value / max) * 100)), 120); }, [value, max]);
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-600">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{pct}%</span>
          <span className="text-sm font-bold text-gray-900">{value.toLocaleString()}</span>
        </div>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${w}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

/* ─── Animated counter ─── */
function Counter({ to, duration = 1000, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / (duration / 16));
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(t); } else setVal(start);
    }, 16);
    return () => clearInterval(t);
  }, [to, duration]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

/* ─── Multi-step Create Campaign ─── */
function CreateCampaign({ onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', department: 'OPD', startDate: '', endDate: '', budget: '',
    channels: [], captureMethod: [], formFields: ['Name', 'Phone', 'City', 'Inquiry / Complaint'],
  });

  const toggle = (key, val) => setForm(f => ({
    ...f,
    [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
  }));

  const canNext = () => {
    if (step === 1) return form.name.trim() && form.department;
    if (step === 2) return form.channels.length > 0;
    if (step === 3) return form.captureMethod.length > 0;
    return true;
  };

  const handleCreate = () => {
    const slug = form.name.toLowerCase().replace(/\s+/g, '-');
    onCreate({
      id: Date.now(), name: form.name, status: 'active', version: '1.0',
      department: form.department, startDate: form.startDate || new Date().toISOString().slice(0, 10),
      endDate: form.endDate, budget: Number(form.budget) || 0,
      leads: 0, conversions: 0, avgConvDays: 0,
      channels: form.channels, captureMethod: form.captureMethod, formFields: form.formFields,
      formLink: `https://medcare.in/forms/${slug}`, qrSlug: `${slug}-2026`,
      color: '#0284C7',
      leadsOverTime: [], trafficBySource: [],
      funnel: { saw: 0, scanned: 0, filled: 0, contacted: 0, converted: 0 },
    });
    onClose();
  };

  const STEPS = ['Basic Info', 'Channels', 'Lead Capture', 'Preview'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="bg-gradient-to-r from-medical-600 to-teal-600 px-8 py-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-white font-bold text-lg">New Campaign</p>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition text-white"><X size={18} /></button>
          </div>
          {/* Step progress */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i + 1 < step ? 'bg-white text-medical-600' : i + 1 === step ? 'bg-white/30 text-white ring-2 ring-white' : 'bg-white/10 text-white/50'
                }`}>
                  {i + 1 < step ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={`text-xs font-medium transition-all ${i + 1 === step ? 'text-white' : 'text-white/50'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${i + 1 < step ? 'bg-white' : 'bg-white/20'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-8 min-h-72">

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Campaign Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Summer Eye Care Drive"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medical-300 focus:bg-white transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Department *</label>
                  <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medical-300 transition-all">
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Budget (₹)</label>
                  <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    placeholder="e.g. 25000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medical-300 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medical-300 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medical-300 transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Channels */}
          {step === 2 && (
            <div className="animate-fade-in">
              <p className="text-sm text-gray-500 mb-5">Select all channels where this campaign will run. You can mix online and offline.</p>
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">🌐 Online / Digital</p>
                <div className="grid grid-cols-3 gap-2">
                  {ONLINE_CHANNELS.map(ch => {
                    const on = form.channels.includes(ch.id);
                    return (
                      <button key={ch.id} onClick={() => toggle('channels', ch.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${on ? 'shadow-md scale-[1.02]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                        style={on ? { borderColor: ch.color, backgroundColor: ch.color + '15', color: ch.color } : {}}>
                        <span className="text-base">{ch.icon}</span>
                        <span className="text-xs">{ch.label}</span>
                        {on && <CheckCircle size={12} className="ml-auto flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">🏥 Offline / Physical</p>
                <div className="grid grid-cols-3 gap-2">
                  {OFFLINE_CHANNELS.map(ch => {
                    const on = form.channels.includes(ch.id);
                    return (
                      <button key={ch.id} onClick={() => toggle('channels', ch.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${on ? 'shadow-md scale-[1.02]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                        style={on ? { borderColor: ch.color, backgroundColor: ch.color + '15', color: ch.color } : {}}>
                        <span className="text-base">{ch.icon}</span>
                        <span className="text-xs">{ch.label}</span>
                        {on && <CheckCircle size={12} className="ml-auto flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Lead Capture */}
          {step === 3 && (
            <div className="animate-fade-in">
              <p className="text-sm text-gray-500 mb-5">Choose how people will submit their details. Select one or both.</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { id: 'qr', icon: QrCode, title: 'QR Code', desc: 'Print on pamphlets, banners, counters. People scan to open form.', color: '#0284C7' },
                  { id: 'form', icon: Link2, title: 'Form Link', desc: 'Share digitally via WhatsApp, social media, email campaigns.', color: '#7C3AED' },
                ].map(({ id, icon: Icon, title, desc, color }) => {
                  const on = form.captureMethod.includes(id);
                  return (
                    <button key={id} onClick={() => toggle('captureMethod', id)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 ${on ? 'shadow-lg scale-[1.02]' : 'border-gray-100 hover:border-gray-200'}`}
                      style={on ? { borderColor: color, backgroundColor: color + '08' } : {}}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300"
                        style={{ backgroundColor: on ? color : '#F3F4F6' }}>
                        <Icon size={20} className={on ? 'text-white' : 'text-gray-400'} />
                      </div>
                      <p className="font-bold text-gray-900 text-sm mb-1">{title}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                      {on && <div className="mt-3 flex items-center gap-1 text-xs font-bold" style={{ color }}><CheckCircle size={12} /> Selected</div>}
                    </button>
                  );
                })}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Form Fields</p>
                <div className="flex flex-wrap gap-2">
                  {FORM_FIELD_OPTIONS.map(f => {
                    const on = form.formFields.includes(f);
                    return (
                      <button key={f} onClick={() => toggle('formFields', f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${on ? 'bg-medical-600 text-white border-medical-600 shadow-sm' : 'border-gray-200 text-gray-500 hover:border-medical-300'}`}>
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 4 && (
            <div className="animate-fade-in">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 mb-4">
                <div className="flex items-start gap-4">
                  {form.captureMethod.includes('qr') && (
                    <div className="flex-shrink-0 p-2 bg-white rounded-xl shadow-sm">
                      <QRCode seed={form.name.toLowerCase().replace(/\s+/g, '-') + '-2026'} size={72} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-base">{form.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{form.department} · v1.0</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.channels.map(ch => (
                        <span key={ch} className="text-xs font-medium px-2 py-0.5 bg-white border border-gray-200 rounded-lg text-gray-600">{ch}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {form.captureMethod.includes('form') && (
                  <div className="mt-4 flex items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-100">
                    <Link2 size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500 flex-1 truncate">
                      medcare.in/forms/{form.name.toLowerCase().replace(/\s+/g, '-')}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Form will collect</p>
                <div className="flex flex-wrap gap-1.5">
                  {form.formFields.map(f => (
                    <span key={f} className="text-xs px-2.5 py-1 bg-medical-50 text-medical-700 border border-medical-200 rounded-lg font-medium">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-all">
            <ChevronLeft size={15} /> {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <div className="flex items-center gap-2">
            {[1,2,3,4].map(i => <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-medical-600' : i < step ? 'w-3 bg-medical-300' : 'w-3 bg-gray-200'}`} />)}
          </div>
          {step < 4 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="flex items-center gap-2 px-6 py-2.5 bg-medical-600 hover:bg-medical-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5">
              Next <ArrowRight size={15} />
            </button>
          ) : (
            <button onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-medical-600 to-teal-600 hover:opacity-90 text-white text-sm font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
              <Megaphone size={15} /> Launch Campaign
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Campaign Detail View ─── */
function CampaignDetail({ campaign: c, onBack, onToggleStatus }) {
  const st = STATUS_STYLE[c.status] || STATUS_STYLE.active;
  const allChannels = [...ONLINE_CHANNELS, ...OFFLINE_CHANNELS];
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(c.formLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const funnelMax = c.funnel.saw || 1;
  const funnelSteps = [
    { label: 'Saw Campaign',     value: c.funnel.saw,       pct: 100 },
    { label: 'Scanned / Clicked',value: c.funnel.scanned + (c.funnel.filled > c.funnel.scanned ? c.funnel.filled : 0), pct: Math.round(((c.funnel.scanned || c.funnel.filled) / funnelMax) * 100) },
    { label: 'Filled Form',      value: c.funnel.filled,    pct: Math.round((c.funnel.filled / funnelMax) * 100) },
    { label: 'Contacted',        value: c.funnel.contacted, pct: Math.round((c.funnel.contacted / funnelMax) * 100) },
    { label: 'Converted',        value: c.funnel.converted, pct: Math.round((c.funnel.converted / funnelMax) * 100) },
  ];

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-medical-600 font-semibold mb-6 hover:underline group">
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> All Campaigns
      </button>

      {/* Hero */}
      <div className="rounded-3xl overflow-hidden mb-8 shadow-xl">
        <div className="relative p-8 text-white" style={{ background: `linear-gradient(135deg, ${c.color}dd 0%, ${c.color}88 100%)` }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {st.label}
                </span>
                <span className="text-white/60 text-xs font-mono">v{c.version}</span>
              </div>
              <h1 className="text-2xl font-bold mb-1">{c.name}</h1>
              <p className="text-white/70 text-sm">{c.department} · {c.startDate}{c.endDate ? ` → ${c.endDate}` : ''}</p>

              {/* Channel badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {c.channels.map(ch => {
                  const meta = allChannels.find(x => x.id === ch);
                  return (
                    <span key={ch} className="flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/30 rounded-full text-xs font-semibold">
                      {meta?.icon} {ch}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* QR + actions */}
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              {c.captureMethod.includes('qr') && (
                <div className="p-3 bg-white rounded-2xl shadow-lg">
                  <QRCode seed={c.qrSlug} size={100} />
                </div>
              )}
              <div className="flex gap-2">
                {c.status !== 'ended' && (
                  <button onClick={() => onToggleStatus(c.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold rounded-xl transition-all">
                    {c.status === 'active' ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Resume</>}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form link */}
          {c.captureMethod.includes('form') && (
            <div className="relative mt-5 flex items-center gap-3 p-3 bg-white/10 border border-white/20 rounded-xl">
              <Link2 size={14} className="text-white/70 flex-shrink-0" />
              <span className="text-white/80 text-xs flex-1 font-mono truncate">{c.formLink}</span>
              <button onClick={copy} className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all flex-shrink-0">
                {copied ? <><CheckCheck size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          )}
        </div>

        {/* KPI strip */}
        <div className="bg-white grid grid-cols-5 divide-x divide-gray-100">
          {[
            { label: 'Total Leads',  value: c.leads,          suffix: '',   color: '#0284C7' },
            { label: 'Converted',    value: c.conversions,    suffix: '',   color: '#16A34A' },
            { label: 'Conv. Rate',   value: c.leads ? Math.round((c.conversions / c.leads) * 100) : 0, suffix: '%', color: '#7C3AED' },
            { label: 'Avg Conv.',    value: c.avgConvDays,    suffix: 'd',  color: '#D97706' },
            { label: 'Budget',       value: `₹${(c.budget / 1000).toFixed(0)}K`, suffix: '', color: '#0891B2', raw: true },
          ].map(({ label, value, suffix, color, raw }) => (
            <div key={label} className="py-5 px-4 text-center">
              <p className="text-2xl font-bold" style={{ color }}>
                {raw ? value : <Counter to={Number(value)} suffix={suffix} />}
              </p>
              <p className="text-xs text-gray-400 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Leads over time */}
        <div className="card animate-fade-in">
          <h3 className="section-title mb-1">Leads Over Time</h3>
          <p className="text-gray-400 text-sm mb-5">Cumulative lead count</p>
          {c.leadsOverTime.length > 1 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={c.leadsOverTime} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id={`lg-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={c.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Area type="monotone" dataKey="leads" name="Leads" stroke={c.color} strokeWidth={2.5} fill={`url(#lg-${c.id})`} dot={{ r: 4, fill: c.color, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-gray-300 text-sm">No data yet</div>
          )}
        </div>

        {/* Traffic by source */}
        <div className="card animate-fade-in">
          <h3 className="section-title mb-1">Traffic by Source</h3>
          <p className="text-gray-400 text-sm mb-5">Leads per channel</p>
          {c.trafficBySource.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={c.trafficBySource} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="source" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Bar dataKey="count" name="Leads" fill={c.color} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-gray-300 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Conversion funnel */}
      {c.funnel.saw > 0 && (
        <div className="card mb-8 animate-fade-in">
          <h3 className="section-title mb-1">Conversion Funnel</h3>
          <p className="text-gray-400 text-sm mb-6">From campaign exposure to patient conversion</p>
          <div className="max-w-lg">
            {funnelSteps.map(({ label, value, pct }, i) => (
              <FunnelBar key={label} label={label} value={value} max={funnelMax} pct={pct}
                color={['#0284C7','#14B8A6','#16A34A','#7C3AED','#DC2626'][i]} />
            ))}
          </div>
        </div>
      )}

      {/* Form fields */}
      {c.formFields?.length > 0 && (
        <div className="card animate-fade-in">
          <h3 className="section-title mb-1">Form Fields</h3>
          <p className="text-gray-400 text-sm mb-4">Data collected from every lead</p>
          <div className="flex flex-wrap gap-2">
            {c.formFields.map(f => (
              <div key={f} className="flex items-center gap-2 px-3 py-2 bg-medical-50 border border-medical-200 rounded-xl">
                <div className="w-1.5 h-1.5 bg-medical-500 rounded-full" />
                <span className="text-sm font-semibold text-medical-700">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Campaign Card ─── */
function CampaignCard({ c, onClick, onToggle, index }) {
  const [entered, setEntered] = useState(false);
  const allChannels = [...ONLINE_CHANNELS, ...OFFLINE_CHANNELS];
  const st = STATUS_STYLE[c.status] || STATUS_STYLE.active;
  const convRate = c.leads ? Math.round((c.conversions / c.leads) * 100) : 0;

  useEffect(() => { setTimeout(() => setEntered(true), index * 80); }, []);

  return (
    <div onClick={onClick}
      className={`card cursor-pointer group transition-all duration-500 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

      {/* Color top bar */}
      <div className="h-1 rounded-full mb-5 transition-all duration-300 group-hover:h-1.5" style={{ background: `linear-gradient(90deg, ${c.color}, ${c.color}66)` }} />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${c.status === 'active' ? 'animate-pulse' : ''}`} />
              {st.label}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">v{c.version}</span>
          </div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-medical-700 transition-colors">{c.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{c.department}</p>
        </div>
        {c.captureMethod?.includes('qr') && (
          <div className="flex-shrink-0 p-1.5 bg-gray-50 rounded-xl border border-gray-100 group-hover:border-gray-200 transition-all">
            <QRCode seed={c.qrSlug} size={44} />
          </div>
        )}
      </div>

      {/* Channel pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {c.channels?.slice(0, 3).map(ch => {
          const meta = allChannels.find(x => x.id === ch);
          return (
            <span key={ch} className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ borderColor: meta?.color + '40', backgroundColor: meta?.color + '10', color: meta?.color }}>
              {meta?.icon} {ch}
            </span>
          );
        })}
        {c.channels?.length > 3 && <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5">+{c.channels.length - 3}</span>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Leads',     value: c.leads,       color: '#0284C7' },
          { label: 'Conv.',     value: c.conversions,  color: '#16A34A' },
          { label: 'Rate',      value: `${convRate}%`, color: '#7C3AED' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center group-hover:bg-gray-100 transition-colors">
            <p className="text-base font-bold" style={{ color }}>{value}</p>
            <p className="text-[10px] text-gray-400 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Mini sparkline */}
      {c.leadsOverTime?.length > 1 && (
        <div className="mb-4 h-12 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={c.leadsOverTime} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
              <defs>
                <linearGradient id={`spark-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={c.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="leads" stroke={c.color} strokeWidth={1.5} fill={`url(#spark-${c.id})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <p className="text-[10px] text-gray-400">{c.startDate}{c.endDate ? ` → ${c.endDate}` : ''}</p>
        {c.status !== 'ended' && (
          <button onClick={e => { e.stopPropagation(); onToggle(c.id); }}
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${c.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
            {c.status === 'active' ? <><Pause size={10} /> Pause</> : <><Play size={10} /> Resume</>}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Campaigns() {
  const [camps, setCamps] = useState(initialCampaigns);
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);


  const toggleStatus = id => setCamps(cs => cs.map(c => c.id !== id ? c : { ...c, status: c.status === 'active' ? 'paused' : 'active' }));

  if (selected) return (
    <div className="flex flex-col h-full">
      <Header title="Campaign Details" subtitle={selected.name} />
      <div className="flex-1 p-8 overflow-auto">
        <CampaignDetail campaign={selected} onBack={() => setSelected(null)} onToggleStatus={id => { toggleStatus(id); setSelected(c => ({ ...c, status: c.status === 'active' ? 'paused' : 'active' })); }} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="Campaigns" subtitle="Plan, launch and track all your marketing campaigns" />
      <div className="flex-1 p-8 overflow-auto">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {['all', 'active', 'paused', 'ended'].map(s => (
              <button key={s} className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize border border-gray-200 text-gray-500 hover:border-medical-400 hover:text-medical-600 transition-all">
                {s === 'all' ? `All (${camps.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${camps.filter(c => c.status === s).length})`}
              </button>
            ))}
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-medical-600 to-teal-600 hover:opacity-90 text-white text-sm font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl">
            <Plus size={16} /> New Campaign
          </button>
        </div>

        {/* Campaign grid */}
        <div className="grid grid-cols-3 gap-5">
          {camps.map((c, i) => (
            <CampaignCard key={c.id} c={c} index={i}
              onClick={() => setSelected(c)}
              onToggle={toggleStatus} />
          ))}
        </div>

      </div>

      {showCreate && (
        <CreateCampaign
          onClose={() => setShowCreate(false)}
          onCreate={newC => setCamps(cs => [...cs, newC])}
        />
      )}
    </div>
  );
}
