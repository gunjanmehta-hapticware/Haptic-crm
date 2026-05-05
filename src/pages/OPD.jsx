import { useState } from 'react';
import { Clock, User, AlertTriangle, CheckCircle, Loader, RefreshCw, Search, Filter, ClipboardList } from 'lucide-react';
import Header from '../components/Header';
import { opdQueue } from '../data/mockData';

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', className: 'badge-red', dot: 'bg-red-500' },
  high: { label: 'High', className: 'badge-yellow', dot: 'bg-amber-400' },
  normal: { label: 'Normal', className: 'badge-blue', dot: 'bg-blue-400' },
  low: { label: 'Low', className: 'badge-gray', dot: 'bg-gray-400' },
};

const STATUS_CONFIG = {
  'in-consultation': { label: 'In Consultation', icon: Loader, className: 'bg-emerald-100 text-emerald-700 border-emerald-200', rowBg: 'bg-emerald-50/50 border-emerald-100' },
  waiting: { label: 'Waiting', icon: Clock, className: 'bg-amber-100 text-amber-700 border-amber-200', rowBg: 'bg-white border-gray-100' },
  completed: { label: 'Completed', icon: CheckCircle, className: 'bg-gray-100 text-gray-500 border-gray-200', rowBg: 'bg-gray-50/50 border-gray-100 opacity-70' },
};

const DEPARTMENTS = ['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Surgery', 'Gynecology', 'Pulmonology'];

export default function OPD() {
  const [queue, setQueue] = useState(opdQueue);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');

  const counts = {
    total: queue.length,
    waiting: queue.filter(q => q.status === 'waiting').length,
    inConsultation: queue.filter(q => q.status === 'in-consultation').length,
    completed: queue.filter(q => q.status === 'completed').length,
  };

  const filtered = queue.filter(q => {
    const matchSearch = q.patient.toLowerCase().includes(search.toLowerCase()) || q.token.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === 'All' || q.department === dept;
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  function updateStatus(id, newStatus) {
    setQueue(q => q.map(item => item.id === id ? { ...item, status: newStatus } : item));
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="OPD Queue" subtitle="Real-time outpatient department management" />

      <div className="flex-1 p-8 overflow-auto">
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Today', value: counts.total, icon: User, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
            { label: 'Waiting', value: counts.waiting, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
            { label: 'In Consultation', value: counts.inConsultation, icon: Loader, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
            { label: 'Completed', value: counts.completed, icon: CheckCircle, color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`flex items-center gap-4 p-4 rounded-2xl border ${bg}`}>
              <Icon size={22} className={color} />
              <div>
                <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Search patient or token..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDept(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      dept === d ? 'bg-medical-600 text-white border-medical-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {['all', 'waiting', 'in-consultation', 'completed'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    statusFilter === s ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {s === 'all' ? 'All Status' : s.replace('-', ' ')}
                </button>
              ))}
            </div>

            <button
              onClick={() => setQueue(opdQueue)}
              className="btn-ghost ml-auto"
            >
              <RefreshCw size={14} /> Reset
            </button>
          </div>
        </div>

        {/* Queue Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="table-header">Token</th>
                  <th className="table-header">Patient</th>
                  <th className="table-header">Doctor / Dept</th>
                  <th className="table-header">Complaint</th>
                  <th className="table-header">Arrival</th>
                  <th className="table-header">Wait</th>
                  <th className="table-header">Priority</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const pCfg = PRIORITY_CONFIG[item.priority];
                  const sCfg = STATUS_CONFIG[item.status];
                  const StatusIcon = sCfg.icon;

                  return (
                    <tr key={item.id} className={`table-row ${item.status === 'in-consultation' ? 'bg-emerald-50/30' : ''}`}>
                      <td className="table-cell">
                        <span className="font-mono font-bold text-medical-600 bg-medical-50 px-2 py-0.5 rounded-lg text-xs">{item.token}</span>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.patient}</p>
                          <p className="text-gray-400 text-xs">{item.age} years</p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="font-medium text-gray-700 text-sm">{item.doctor}</p>
                          <p className="text-gray-400 text-xs">{item.department}</p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <p className="text-gray-600 text-sm max-w-48 truncate" title={item.complaint}>{item.complaint}</p>
                      </td>
                      <td className="table-cell">
                        <span className="text-gray-600 text-sm">{item.arrivalTime}</span>
                      </td>
                      <td className="table-cell">
                        {item.status === 'completed' ? (
                          <span className="text-gray-400 text-sm">—</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className={item.waitTime > 30 ? 'text-red-400' : 'text-amber-400'} />
                            <span className={`text-sm font-medium ${item.waitTime > 30 ? 'text-red-600' : 'text-gray-700'}`}>
                              {item.waitTime} min
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${pCfg.dot}`} />
                          <span className={`badge ${pCfg.className}`}>{pCfg.label}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sCfg.className}`}>
                          <StatusIcon size={11} className={item.status === 'in-consultation' ? 'animate-spin' : ''} />
                          {sCfg.label}
                        </span>
                      </td>
                      <td className="table-cell">
                        {item.status === 'waiting' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => updateStatus(item.id, 'in-consultation')}
                              className="text-xs font-medium px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                              Call In
                            </button>
                          </div>
                        )}
                        {item.status === 'in-consultation' && (
                          <button
                            onClick={() => updateStatus(item.id, 'completed')}
                            className="text-xs font-medium px-3 py-1.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        {item.status === 'completed' && (
                          <span className="text-gray-400 text-xs">Done</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
                <p>No patients match the current filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
