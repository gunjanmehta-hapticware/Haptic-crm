import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef();
  const dropRef = useRef();

  const selectedIds = Array.isArray(value) ? value : (value === 'All' || !value ? [] : [value]);

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

  const toggleCampaign = (id) => {
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id];
    onChange(newIds);
  };

  const getDisplayText = () => {
    if (!selectedIds.length) return 'All';
    if (selectedIds.length === 1) {
      const camp = campaigns.find(c => String(c.id) === selectedIds[0]);
      if (!camp) return 'All';
      const words = camp.name.split(' ').slice(0, 2).join(' ');
      return words.length < camp.name.length ? words + '...' : words;
    }
    return `${selectedIds.length} selected`;
  };

  const openDropdown = () => {
    setOpen(!open);
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropdownPos({ top: r.bottom + 8, left: r.left });
    }
  };

  return (
    <>
      <div className="w-64">
        <button
          ref={btnRef}
          onClick={openDropdown}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-medical-300 transition-all flex items-center justify-between active:bg-gray-50"
        >
          <span className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Campaign</span>
            <span className="font-semibold text-gray-900">{getDisplayText()}</span>
          </span>
          <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setOpen(false)} />
          <div
            ref={dropRef}
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              zIndex: 9999,
              animation: 'slideUp 0.2s ease-out',
              width: 256,
            }}
            className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Filter by Campaign</p>
            </div>

            <button
              onClick={() => {
                onChange([]);
              }}
              className={`w-full px-4 py-3 text-sm text-left transition-all duration-150 border-b border-gray-50 hover:bg-medical-50 flex items-center gap-3 group ${
                !selectedIds.length ? 'bg-medical-50' : ''
              }`}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                !selectedIds.length ? 'bg-medical-600 border-medical-600' : 'border-gray-300 group-hover:border-medical-400'
              }`}>
                {!selectedIds.length && <CheckCircle size={12} className="text-white" />}
              </div>
              <span className={`font-medium ${!selectedIds.length ? 'text-medical-700 font-semibold' : 'text-gray-700'}`}>All Campaigns</span>
            </button>

            <div className="max-h-64 overflow-y-auto">
              {campaigns.map((c) => {
                const isSelected = selectedIds.includes(String(c.id));
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCampaign(String(c.id))}
                    className="w-full px-4 py-3 text-sm text-left transition-all duration-150 border-b border-gray-50 last:border-0 hover:bg-medical-50 flex items-center gap-3 group"
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected ? 'bg-medical-600 border-medical-600' : 'border-gray-300 group-hover:border-medical-400'
                    }`}>
                      {isSelected && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${isSelected ? 'text-medical-700 font-semibold' : 'text-gray-700 group-hover:text-medical-700'}`}>{c.name}</p>
                    </div>
                    <span className="text-xs text-gray-400 font-medium flex-shrink-0">{c.leads}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

export default function MarketingLeads() {
  const [search, setSearch] = useState('');
  const [sources, setSources] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [campaignFilter, setCampaignFilter] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterBtnRef = useRef();
  const [filterPos, setFilterPos] = useState({ top: 0, left: 0 });

  const SOURCES = ['Instagram', 'Facebook', 'Google Ads', 'WhatsApp', 'YouTube'];
  const STATUSES = ['hot', 'warm', 'cold'];

  const filtered = useMemo(() => marketingLeads.filter(l => {
    const selectedCampaignIds = Array.isArray(campaignFilter) ? campaignFilter : [];
    const sourceMatch = !sources.length || sources.includes(l.source);
    const statusMatch = !statuses.length || statuses.includes(l.status);
    const campaignMatch = !selectedCampaignIds.length || selectedCampaignIds.includes(String(l.campaignId));
    return l.name.toLowerCase().includes(search.toLowerCase()) &&
      sourceMatch && statusMatch && campaignMatch;
  }), [search, sources, statuses, campaignFilter]);

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

          {/* Add Filter Button */}
          <div className="relative">
            <button
              ref={filterBtnRef}
              onClick={() => {
                setFilterMenuOpen(!filterMenuOpen);
                if (filterBtnRef.current) {
                  const r = filterBtnRef.current.getBoundingClientRect();
                  const viewportWidth = window.innerWidth;
                  let left = r.left;
                  if (left + 320 > viewportWidth) {
                    left = viewportWidth - 320 - 16;
                  }
                  setFilterPos({ top: r.bottom + 8, left });
                }
              }}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-medical-600 hover:border-medical-300 hover:bg-medical-50 transition-all flex items-center gap-2 relative"
            >
              <span>+ Add Filter</span>
              {(sources.length + statuses.length) > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-medical-600 rounded-full ml-1">
                  {sources.length + statuses.length}
                </span>
              )}
            </button>

            {filterMenuOpen && createPortal(
              <>
                <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setFilterMenuOpen(false)} />
                <div
                  style={{
                    position: 'fixed',
                    top: filterPos.top,
                    left: filterPos.left,
                    zIndex: 9999,
                    animation: 'slideUp 0.2s ease-out',
                    width: 320,
                    maxHeight: '70vh',
                    overflowY: 'auto',
                  }}
                  className="bg-white border border-gray-100 rounded-xl shadow-lg"
                >
                  {/* Source Filters */}
                  <div className="border-b border-gray-100">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Source</p>
                      <div className="flex gap-2">
                        <button onClick={() => setSources(SOURCES)} className="text-xs text-medical-600 hover:text-medical-700 font-semibold">Select All</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => setSources([])} className="text-xs text-medical-600 hover:text-medical-700 font-semibold">Clear</button>
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {SOURCES.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setSources(sources.includes(s) ? sources.filter(x => x !== s) : [...sources, s]);
                          }}
                          className="w-full px-4 py-3 text-sm text-left transition-all duration-150 border-b border-gray-50 last:border-0 hover:bg-medical-50 flex items-center gap-3 group"
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            sources.includes(s) ? 'bg-medical-600 border-medical-600' : 'border-gray-300 group-hover:border-medical-400'
                          }`}>
                            {sources.includes(s) && <CheckCircle size={12} className="text-white" />}
                          </div>
                          <span className={`text-sm ${sources.includes(s) ? 'text-medical-700 font-semibold' : 'text-gray-700 group-hover:text-medical-700'}`}>{s}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Filters */}
                  <div>
                    <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status</p>
                      <div className="flex gap-2">
                        <button onClick={() => setStatuses(STATUSES)} className="text-xs text-medical-600 hover:text-medical-700 font-semibold">Select All</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => setStatuses([])} className="text-xs text-medical-600 hover:text-medical-700 font-semibold">Clear</button>
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setStatuses(statuses.includes(s) ? statuses.filter(x => x !== s) : [...statuses, s]);
                          }}
                          className="w-full px-4 py-3 text-sm text-left transition-all duration-150 border-b border-gray-50 last:border-0 hover:bg-medical-50 flex items-center gap-3 group"
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            statuses.includes(s) ? 'bg-medical-600 border-medical-600' : 'border-gray-300 group-hover:border-medical-400'
                          }`}>
                            {statuses.includes(s) && <CheckCircle size={12} className="text-white" />}
                          </div>
                          <span className={`capitalize text-sm ${statuses.includes(s) ? 'text-medical-700 font-semibold' : 'text-gray-700 group-hover:text-medical-700'}`}>{s}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>,
              document.body
            )}
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
                      {selected.converted ? `Converted - ${selected.medId}` : 'Lead'}
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
