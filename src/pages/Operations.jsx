import { useState } from 'react';
import { Stethoscope, Clock, Users, AlertTriangle, CheckCircle, Activity, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import Header from '../components/Header';
import { operations } from '../data/mockData';

const STATUS_CONFIG = {
  'in-progress': { label: 'In Progress', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', barColor: 'bg-emerald-500', dot: 'bg-emerald-400 animate-pulse' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700 border-blue-200', barColor: 'bg-blue-400', dot: 'bg-blue-400' },
  completed: { label: 'Completed', className: 'bg-gray-100 text-gray-600 border-gray-200', barColor: 'bg-gray-300', dot: 'bg-gray-400' },
};

const COMPLEXITY_CONFIG = {
  Emergency: 'badge-red',
  Major: 'badge-yellow',
  Minor: 'badge-blue',
};

const OR_ROOMS = ['OR-1', 'OR-2', 'OR-3'];

function OperationCard({ op, expanded, onToggle }) {
  const sCfg = STATUS_CONFIG[op.status];
  const endTime = new Date(`2026-01-01T${op.startTime}:00`);
  endTime.setMinutes(endTime.getMinutes() + op.duration);
  const endTimeStr = endTime.toTimeString().slice(0, 5);

  const progressPercent = op.status === 'in-progress' ? 65 : op.status === 'completed' ? 100 : 0;

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
      op.status === 'in-progress' ? 'border-emerald-200 shadow-md' : 'border-gray-100'
    }`}>
      {/* Progress bar */}
      {op.status === 'in-progress' && (
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <div className="bg-white p-5">
        <div className="flex items-start gap-4">
          {/* OR Badge */}
          <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 ${
            op.status === 'in-progress' ? 'bg-emerald-50 border-emerald-300' : 'bg-gray-50 border-gray-200'
          }`}>
            <p className="text-xs font-bold text-gray-500">{op.or.split('-')[0]}</p>
            <p className={`text-xl font-bold font-display ${op.status === 'in-progress' ? 'text-emerald-600' : 'text-gray-700'}`}>
              {op.or.split('-')[1]}
            </p>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-display font-bold text-gray-900 text-base">{op.surgery}</h3>
                <p className="text-gray-500 text-sm">{op.patient}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`badge ${COMPLEXITY_CONFIG[op.complexity]}`}>{op.complexity}</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sCfg.className}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                  {sCfg.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>{op.startTime} — {endTimeStr} ({op.duration} min)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Stethoscope size={12} />
                <span>{op.surgeon}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity size={12} />
                <span>Anesthesia: {op.anesthetist}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-red-500 font-bold">⬤</span>
                <span>Blood: {op.blood}</span>
              </div>
            </div>

            <button
              onClick={onToggle}
              className="mt-3 flex items-center gap-1 text-xs text-medical-600 hover:text-medical-700 font-medium"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expanded ? 'Hide details' : 'Show details'}
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Surgical Team</p>
              <div className="flex flex-wrap gap-2">
                {op.team.map((member, i) => (
                  <span key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full">
                    <Users size={11} />
                    {member}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-gray-600 bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
                <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                {op.notes}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Operations() {
  const [expanded, setExpanded] = useState({});
  const [selectedDate, setSelectedDate] = useState('2026-04-27');
  const [selectedOR, setSelectedOR] = useState('All');

  const dates = [...new Set(operations.map(o => o.date))].sort();
  const filtered = operations.filter(o =>
    o.date === selectedDate && (selectedOR === 'All' || o.or === selectedOR)
  );

  const counts = {
    inProgress: filtered.filter(o => o.status === 'in-progress').length,
    scheduled: filtered.filter(o => o.status === 'scheduled').length,
    completed: filtered.filter(o => o.status === 'completed').length,
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Operations" subtitle="Surgical schedule and operating room management" />

      <div className="flex-1 p-8 overflow-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-5 mb-6">
          {[
            { label: 'In Progress', value: counts.inProgress, Icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
            { label: 'Scheduled', value: counts.scheduled, Icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
            { label: 'Completed', value: counts.completed, Icon: CheckCircle, color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
          ].map(({ label, value, Icon, color, bg }) => (
            <div key={label} className={`flex items-center gap-4 p-5 rounded-2xl border ${bg}`}>
              <Icon size={24} className={color} />
              <div>
                <p className="font-display text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <div className="flex gap-2">
              {dates.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    selectedDate === d ? 'bg-medical-600 text-white border-medical-600 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-gray-500 font-medium">OR Room:</span>
            {['All', ...OR_ROOMS].map(room => (
              <button
                key={room}
                onClick={() => setSelectedOR(room)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedOR === room ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {room}
              </button>
            ))}
          </div>
        </div>

        {/* OR Timeline View */}
        <div className="space-y-3">
          {OR_ROOMS.map(room => {
            const roomOps = filtered.filter(o => o.or === room);
            if (selectedOR !== 'All' && selectedOR !== room) return null;

            return (
              <div key={room} className="card p-0 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-medical-600 flex items-center justify-center">
                    <Stethoscope size={14} className="text-white" />
                  </div>
                  <span className="font-semibold text-gray-800">Operating Room {room.split('-')[1]}</span>
                  <span className="badge badge-gray">{roomOps.length} operation{roomOps.length !== 1 ? 's' : ''}</span>
                  {roomOps.some(o => o.status === 'in-progress') && (
                    <span className="badge badge-green ml-auto">● Currently Active</span>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  {roomOps.length > 0 ? roomOps.map(op => (
                    <OperationCard
                      key={op.id}
                      op={op}
                      expanded={!!expanded[op.id]}
                      onToggle={() => setExpanded(e => ({ ...e, [op.id]: !e[op.id] }))}
                    />
                  )) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No operations scheduled for this room
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
