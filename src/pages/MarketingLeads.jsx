import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronRight, SearchX, CheckCircle, X, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import { marketingLeads, campaigns } from '../data/mockData';

const SOURCE_COLORS = {
  Instagram: { bg: 'bg-pink-100', text: 'text-pink-700', dot: 'bg-pink-500' },
  Facebook:  { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Google Ads': { bg: 'bg-medical-100', text: 'text-medical-700', dot: 'bg-medical-500' },
  WhatsApp:  { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  YouTube:   { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const STATUS_CLS = {
  hot:  'bg-red-500 text-white',
  warm: 'bg-amber-400 text-white',
  cold: 'bg-health-500 text-white',
};

function CampaignFilter({ value, onChange, campaigns }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentCamp = value !== 'All' ? campaigns.find(c => String(c.id) === value) : null;

  return (
    <div ref={ref} className="relative w-64">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-medical-300 transition-all flex items-center justify-between active:bg-gray-50"
      >
        <span className="flex items-center gap-2">
          <span className="text-xs">Campaign:</span>
          <span className="font-semibold text-gray-900">{currentCamp?.name || 'All'}</span>
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden" style={{ animation: 'slideUp 0.2s ease-out' }}>
          {/* All option */}
          <button
            onClick={() => {
              onChange('All');
              setOpen(false);
            }}
            className={`w-full px-4 py-3 text-sm text-left transition-all duration-150 border-b border-gray-50 hover:bg-medical-50 flex items-center justify-between ${
              value === 'All' ? 'bg-medical-100 text-medical-700 font-semibold' : 'text-gray-700 hover:text-medical-600'
            }`}
          >
            <span>All Campaigns</span>
            {value === 'All' && <CheckCircle size={14} className="text-medical-600" />}
          </button>

          {/* Campaign options */}
          {campaigns.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                onChange(String(c.id));
                setOpen(false);
              }}
              className={`w-full px-4 py-3 text-sm text-left transition-all duration-150 border-b border-gray-50 last:border-0 hover:bg-medical-50 flex items-center justify-between group ${
                value === String(c.id) ? 'bg-medical-100 text-medical-700 font-semibold' : 'text-gray-700 hover:text-medical-600'
              }`}
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span>{c.name}</span>
                <span className="text-[10px] text-gray-400 font-medium ml-auto">{c.leads} leads</span>
              </div>
              {value === c.id && <CheckCircle size={14} className="text-medical-600 flex-shrink-0 ml-2" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketingLeads() {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [campaignFilter, setCampaignFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const SOURCES = ['All', 'Instagram', 'Facebook', 'Google Ads', 'WhatsApp', 'YouTube'];
  const STATUSES = ['All', 'hot', 'warm', 'cold'];

  const filtered = useMemo(() => marketingLeads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) &&
    (sourceFilter === 'All' || l.source === sourceFilter) &&
    (statusFilter === 'All' || l.status === statusFilter) &&
    (campaignFilter === 'All' || l.campaignId === Number(campaignFilter))
  ), [search, sourceFilter, statusFilter, campaignFilter]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Marketing Leads" subtitle="Leads captured from social campaigns and digital marketing" />
      <div className="flex-1 p-8 overflow-auto">



        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 animate-slide-up">
          <div className="relative flex-1 min-w-52">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search lead name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <CampaignFilter
            value={campaignFilter}
            onChange={setCampaignFilter}
            campaigns={campaigns}
          />
          <div className="flex gap-1.5">
            {SOURCES.map(s => (
              <button key={s} onClick={() => setSourceFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border capitalize transition-all ${sourceFilter === s ? 'bg-medical-600 text-white border-medical-600 shadow-sm' : 'border-gray-200 text-gray-700 hover:border-medical-400'}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border capitalize transition-all ${statusFilter === s ? 'bg-medical-600 text-white border-medical-600 shadow-sm' : 'border-gray-200 text-gray-700 hover:border-medical-400'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden animate-fade-in">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-medical-100 bg-gradient-to-r from-medical-50 to-teal-50">
                {['Lead', 'CRM ID', 'Source / Campaign', 'Inquiry', 'Date', 'Follow-up', 'Status', 'Converted', ''].map(h => (
                  <th key={h} className="table-header text-medical-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => {
                const srcStyle = SOURCE_COLORS[l.source] ?? { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };
                return (
                  <tr key={l.id} onClick={() => setSelected(l)}
                    style={{ animationDelay: `${i * 45}ms`, opacity: 0, animation: `slideUp 0.4s ease-out ${i * 45}ms forwards` }}
                    className="table-row cursor-pointer group hover:shadow-sm">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          {l.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{l.name}</p>
                          <p className="text-xs text-gray-400">{l.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">{l.crmId}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className={`w-2 h-2 rounded-full ${srcStyle.dot}`} />
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${srcStyle.bg} ${srcStyle.text}`}>{l.source}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate max-w-36">{l.campaign}</p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-gray-700 max-w-44 truncate">{l.inquiry}</p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm font-semibold text-gray-700">{l.date}</p>
                    </td>
                    <td className="table-cell text-sm font-semibold text-gray-700">{l.followUpDate}</td>
                    <td className="table-cell">
                      <span className={`badge capitalize font-bold ${STATUS_CLS[l.status]}`}>{l.status}</span>
                    </td>
                    <td className="table-cell">
                      {l.converted
                        ? <span className="flex items-center gap-1 text-xs font-bold text-health-600"><CheckCircle size={13} /> {l.medId}</span>
                        : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="table-cell">
                      <ChevronRight size={17} className="text-gray-400 group-hover:text-medical-600 group-hover:translate-x-1.5 transition-all duration-300" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="py-16 text-center">
              <SearchX size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400 text-sm font-medium">No leads match the current filters.</p>
            </div>
          )}
        </div>

        {/* Lead detail drawer */}
        {selected && (
          <>
            <div onClick={() => setSelected(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in" />
            <div className="fixed right-0 top-0 h-full w-[420px] bg-white z-50 shadow-2xl overflow-y-auto flex flex-col animate-slide-up">
              <div className="bg-gradient-to-br from-medical-700 via-medical-600 to-teal-600 p-6 text-white flex-shrink-0 relative">
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition"><X size={18} /></button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl font-bold">
                    {selected.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{selected.name}</h2>
                    <p className="text-white/70 text-sm mt-0.5">{selected.crmId} · {selected.city}</p>
                    <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-bold mt-2 ${selected.converted ? 'bg-green-400/30' : 'bg-white/20'}`}>
                      {selected.converted ? `✓ Converted → ${selected.medId}` : '● Lead'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-6 space-y-5">
                <section>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Inquiry</p>
                  <div className="bg-medical-50 rounded-2xl p-4 border border-medical-100">
                    <p className="font-semibold text-medical-800">{selected.inquiry}</p>
                  </div>
                </section>
                <section>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Campaign Details</p>
                  <div className="space-y-2">
                    {[
                      ['Campaign', selected.campaign],
                      ['Source', selected.source],
                      ['Date', selected.date],
                      ['Follow-up', selected.followUpDate],
                      ['Phone', selected.phone],
                      ['Email', selected.email],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm text-gray-500">{k}</span>
                        <span className="text-sm font-semibold text-gray-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </section>
                {selected.converted && (
                  <section>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Conversion</p>
                    <div className="bg-health-50 rounded-2xl p-4 border border-health-200 flex items-center gap-3">
                      <CheckCircle size={20} className="text-health-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-health-800">Converted to Patient</p>
                        <p className="text-sm text-health-600">{selected.medId} · {selected.convertedDate}</p>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
