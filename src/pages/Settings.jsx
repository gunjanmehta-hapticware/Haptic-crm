import { useState, useRef } from 'react';
import { User, Bell, Shield, Hospital, Save, Check, ChevronRight, Camera, Users, Plus, Trash2, Mail, X, Crown, UserCheck, UserCog, Eye } from 'lucide-react';
import Header from '../components/Header';
import { currentUser } from '../data/mockData';

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-all duration-300 flex-shrink-0 focus:outline-none ${on ? 'bg-medical-600 shadow-md shadow-medical-200' : 'bg-gray-200'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${on ? 'left-7' : 'left-1'}`} />
    </button>
  );
}

const NAV = [
  { key: 'profile',  icon: User,     label: 'Profile' },
  { key: 'notifs',   icon: Bell,     label: 'Notifications' },
  { key: 'security', icon: Shield,   label: 'Security' },
  { key: 'hospital', icon: Hospital, label: 'Hospital' },
  { key: 'team', icon: Users, label: 'Team' },
];

const ROLES = ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Billing', 'Viewer'];

const ROLE_META = {
  Admin:       { icon: Crown,     color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200',   desc: 'Full access to all modules' },
  Doctor:      { icon: UserCheck, color: 'text-medical-600', bg: 'bg-medical-50 border-medical-200', desc: 'Patient records, appointments, OPD' },
  Nurse:       { icon: UserCog,   color: 'text-teal-600',    bg: 'bg-teal-50 border-teal-200',     desc: 'OPD queue, patient notes' },
  Receptionist:{ icon: UserCog,   color: 'text-purple-600',  bg: 'bg-purple-50 border-purple-200', desc: 'Appointments, calls, leads' },
  Billing:     { icon: UserCog,   color: 'text-green-600',   bg: 'bg-green-50 border-green-200',   desc: 'Billing and invoicing only' },
  Viewer:      { icon: Eye,       color: 'text-gray-500',    bg: 'bg-gray-50 border-gray-200',     desc: 'Read-only access to all modules' },
};

const ACCESS_MODULES = ['Dashboard', 'Patients', 'Appointments', 'OPD', 'Operations', 'Voice Calls', 'Settings'];

const DEFAULT_ACCESS = {
  Admin:       { Dashboard: true,  Patients: true,  Appointments: true,  OPD: true,  Operations: true,  'Voice Calls': true,  Settings: true  },
  Doctor:      { Dashboard: true,  Patients: true,  Appointments: true,  OPD: true,  Operations: false, 'Voice Calls': false, Settings: false },
  Nurse:       { Dashboard: true,  Patients: true,  Appointments: false, OPD: true,  Operations: false, 'Voice Calls': false, Settings: false },
  Receptionist:{ Dashboard: true,  Patients: false, Appointments: true,  OPD: false, Operations: false, 'Voice Calls': true,  Settings: false },
  Billing:     { Dashboard: false, Patients: false, Appointments: false, OPD: false, Operations: false, 'Voice Calls': false, Settings: false },
  Viewer:      { Dashboard: true,  Patients: true,  Appointments: true,  OPD: true,  Operations: true,  'Voice Calls': true,  Settings: false },
};

const OWNER = { id: 1, name: currentUser.name, email: currentUser.email, role: 'Admin', avatar: currentUser.avatar, joinedOn: new Date().toISOString().slice(0, 10), status: 'active' };

export default function Settings() {
  const [active, setActive] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const fileRef = useRef();

  const [profile, setProfile] = useState({
    name: currentUser.name, email: currentUser.email,
    role: currentUser.role, phone: '+91 98100 00001',
    hospital: currentUser.hospital, city: 'Mumbai',
  });

  const [notifs, setNotifs] = useState({
    emailAlerts: true, smsNotifs: true, apptReminders: true,
    operationAlerts: true, callSummaries: false, dailyReport: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false, sessionLock: true, loginAlerts: true, timeout: '30',
  });

  const [hospital, setHospital] = useState({
    compactMode: false, autoAssign: true, waitTimeAlert: true,
    autoCallSummary: true, language: 'English (India)',
  });

  // teams: array of { id, name, description, createdOn, members: [], memberAccess: {} }
  const [teams, setTeams] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);   // null = list view
  const [activeMemberId, setActiveMemberId] = useState(null); // null = team view, id = member permissions
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamDraft, setTeamDraft] = useState({ name: '', description: '' });
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ name: '', email: '', role: 'Viewer' });

  const activeTeam = teams.find(t => t.id === activeTeamId) ?? null;
  const activeMember = activeTeam?.members.find(m => m.id === activeMemberId) ?? null;

  const createTeam = () => {
    if (!teamDraft.name.trim()) return;
    const newTeam = {
      id: Date.now(),
      name: teamDraft.name,
      description: teamDraft.description,
      createdOn: new Date().toISOString().slice(0, 10),
      members: [{ ...OWNER }],
      memberAccess: { [OWNER.id]: { ...DEFAULT_ACCESS['Admin'] } },
    };
    setTeams(t => [...t, newTeam]);
    setTeamDraft({ name: '', description: '' });
    setShowCreateForm(false);
  };

  const sendInvite = () => {
    if (!invite.name.trim() || !invite.email.trim()) return;
    const newMember = {
      id: Date.now(),
      name: invite.name,
      email: invite.email,
      role: invite.role,
      avatar: invite.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      joinedOn: new Date().toISOString().slice(0, 10),
      status: 'invited',
    };
    setTeams(ts => ts.map(t => t.id !== activeTeamId ? t : {
      ...t,
      members: [...t.members, newMember],
      memberAccess: { ...t.memberAccess, [newMember.id]: { ...DEFAULT_ACCESS[invite.role] } },
    }));
    setInvite({ name: '', email: '', role: 'Viewer' });
    setShowInvite(false);
  };

  const removeMember = (memberId) => {
    setTeams(ts => ts.map(t => t.id !== activeTeamId ? t : {
      ...t, members: t.members.filter(m => m.id !== memberId),
    }));
    if (activeMemberId === memberId) setActiveMemberId(null);
  };

  const toggleAccess = (memberId, mod) => {
    setTeams(ts => ts.map(t => t.id !== activeTeamId ? t : {
      ...t, memberAccess: {
        ...t.memberAccess,
        [memberId]: { ...t.memberAccess[memberId], [mod]: !t.memberAccess[memberId][mod] },
      },
    }));
  };

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const Field = ({ label, value, onChange, type = 'text', half }) => (
    <div className={half ? '' : 'col-span-2'}>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 focus:bg-white transition-all duration-200" />
    </div>
  );

  const Row = ({ label, desc, on, onToggle }) => (
    <div className="flex items-center justify-between py-5 border-b border-gray-50 last:border-0 group">
      <div>
        <p className="text-sm font-bold text-gray-800 group-hover:text-medical-700 transition-colors">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="Manage your account and hospital preferences" />

      <div className="flex flex-1 overflow-hidden">
        {/* Left nav */}
        <aside className="w-56 border-r border-gray-100 bg-gray-50/60 flex-shrink-0 p-4 space-y-1">
          {NAV.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setActive(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                active === key
                  ? 'bg-medical-600 text-white shadow-md shadow-medical-200'
                  : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-medical-700'
              }`}>
              <Icon size={17} />
              <span className="flex-1 text-left">{label}</span>
              {active === key && <ChevronRight size={14} className="opacity-60" />}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div key={active} className="max-w-2xl animate-fade-in">

            {/* PROFILE */}
            {active === 'profile' && (
              <div className="space-y-6">
                {/* LinkedIn-style card */}
                <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-card bg-white">
                  {/* Blue banner */}
                  <div className="h-32 bg-gradient-to-r from-medical-900 via-medical-700 to-teal-600 relative">
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'18px 18px'}} />
                  </div>
                  {/* Avatar + name below banner */}
                  <div className="px-6 pb-5">
                    <div className="-mt-10 mb-3">
                      <div className="relative inline-block">
                        <div className="w-20 h-20 rounded-full shadow-xl overflow-hidden border-4 border-white">
                          {avatar
                            ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br from-medical-700 to-medical-900">{currentUser.avatar}</div>
                          }
                        </div>
                        <button onClick={() => fileRef.current.click()}
                          className="absolute bottom-0 right-0 w-6 h-6 bg-medical-600 rounded-full flex items-center justify-center shadow-md hover:bg-medical-700 transition-colors border-2 border-white">
                          <Camera size={11} className="text-white" />
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden"
                          onChange={e => { const f = e.target.files[0]; if (f) setAvatar(URL.createObjectURL(f)); }} />
                      </div>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{profile.role}</p>
                    <p className="text-xs text-medical-600 font-semibold mt-0.5">{profile.hospital}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Full Name" value={profile.name} onChange={v => setProfile(p=>({...p,name:v}))} half />
                  <Field label="Phone" value={profile.phone} onChange={v => setProfile(p=>({...p,phone:v}))} type="tel" half />
                  <Field label="Email Address" value={profile.email} onChange={v => setProfile(p=>({...p,email:v}))} type="email" half />
                  <Field label="City" value={profile.city} onChange={v => setProfile(p=>({...p,city:v}))} half />
                  <Field label="Role / Designation" value={profile.role} onChange={v => setProfile(p=>({...p,role:v}))} half />
                  <Field label="Hospital" value={profile.hospital} onChange={v => setProfile(p=>({...p,hospital:v}))} half />
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {active === 'notifs' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Notifications</h2>
                <p className="text-sm text-gray-400 mb-6">Choose what updates you want to receive and how.</p>
                <div className="card">
                  <Row label="Email Alerts" desc="Appointment confirmations and system updates via email" on={notifs.emailAlerts} onToggle={() => setNotifs(p=>({...p,emailAlerts:!p.emailAlerts}))} />
                  <Row label="SMS Notifications" desc="Critical alerts sent to your registered mobile number" on={notifs.smsNotifs} onToggle={() => setNotifs(p=>({...p,smsNotifs:!p.smsNotifs}))} />
                  <Row label="Appointment Reminders" desc="Auto-reminders sent 24 hours before appointments" on={notifs.apptReminders} onToggle={() => setNotifs(p=>({...p,apptReminders:!p.apptReminders}))} />
                  <Row label="Operation Alerts" desc="Notify when operation room status changes" on={notifs.operationAlerts} onToggle={() => setNotifs(p=>({...p,operationAlerts:!p.operationAlerts}))} />
                  <Row label="AI Call Summaries" desc="Email summary after every AI voice call session" on={notifs.callSummaries} onToggle={() => setNotifs(p=>({...p,callSummaries:!p.callSummaries}))} />
                  <Row label="Daily Report" desc="Receive end-of-day hospital activity digest" on={notifs.dailyReport} onToggle={() => setNotifs(p=>({...p,dailyReport:!p.dailyReport}))} />
                </div>
              </div>
            )}

            {/* SECURITY */}
            {active === 'security' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Security</h2>
                <p className="text-sm text-gray-400 mb-6">Keep your account and patient data protected.</p>
                <div className="card mb-4">
                  <Row label="Two-Factor Authentication" desc="Require OTP verification on every login" on={security.twoFactor} onToggle={() => setSecurity(p=>({...p,twoFactor:!p.twoFactor}))} />
                  <Row label="Auto Screen Lock" desc="Lock session automatically after inactivity" on={security.sessionLock} onToggle={() => setSecurity(p=>({...p,sessionLock:!p.sessionLock}))} />
                  <Row label="Login Alerts" desc="Get notified when a new device logs in to your account" on={security.loginAlerts} onToggle={() => setSecurity(p=>({...p,loginAlerts:!p.loginAlerts}))} />
                </div>
                <div className="card">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Session Timeout (minutes)</label>
                  <p className="text-xs text-gray-400 mb-3">Automatically log out after this many minutes of inactivity.</p>
                  <div className="flex items-center gap-3">
                    {['15','30','60','120'].map(v => (
                      <button key={v} onClick={() => setSecurity(p=>({...p,timeout:v}))}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${security.timeout===v?'bg-medical-600 text-white border-medical-600 shadow-md':'border-gray-200 text-gray-600 hover:border-medical-300 hover:text-medical-600'}`}>
                        {v}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* HOSPITAL */}
            {active === 'hospital' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Hospital Preferences</h2>
                <p className="text-sm text-gray-400 mb-6">Configure how the system behaves for your hospital.</p>
                <div className="card mb-4">
                  <Row label="Compact Mode" desc="Denser layout showing more information at once" on={hospital.compactMode} onToggle={() => setHospital(p=>({...p,compactMode:!p.compactMode}))} />
                  <Row label="Auto-Assign OPD Tokens" desc="Automatically assign queue numbers on patient check-in" on={hospital.autoAssign} onToggle={() => setHospital(p=>({...p,autoAssign:!p.autoAssign}))} />
                  <Row label="Wait Time Alerts" desc="Alert staff when patient wait exceeds 30 minutes" on={hospital.waitTimeAlert} onToggle={() => setHospital(p=>({...p,waitTimeAlert:!p.waitTimeAlert}))} />
                  <Row label="Auto AI Call Summary" desc="Automatically generate summaries after every AI call" on={hospital.autoCallSummary} onToggle={() => setHospital(p=>({...p,autoCallSummary:!p.autoCallSummary}))} />
                </div>
                <div className="card">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">System Language</label>
                  <select value={hospital.language} onChange={e => setHospital(p=>({...p,language:e.target.value}))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all">
                    {['English (India)','Hindi','Tamil','Telugu','Marathi','Gujarati'].map(l=><option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* TEAM */}
            {active === 'team' && (
              <div className="animate-fade-in">

                {/* ── VIEW 1: Teams List ── */}
                {!activeTeamId && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Teams</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Create teams and manage member access.</p>
                      </div>
                      <button onClick={() => setShowCreateForm(v => !v)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-medical-600 hover:bg-medical-700 text-white text-sm font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                        <Plus size={15} /> Create Team
                      </button>
                    </div>

                    {/* Create form */}
                    {showCreateForm && (
                      <div className="card mb-5 border-2 border-medical-200 bg-medical-50/40 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                          <p className="font-bold text-gray-800">New Team</p>
                          <button onClick={() => { setShowCreateForm(false); setTeamDraft({ name: '', description: '' }); }}
                            className="p-1 hover:bg-gray-100 rounded-lg transition"><X size={15} className="text-gray-400" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Team Name <span className="text-red-400">*</span></label>
                            <input value={teamDraft.name} onChange={e => setTeamDraft(p => ({...p, name: e.target.value}))}
                              placeholder="e.g. Clinical Team"
                              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medical-300 transition" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Description <span className="text-gray-300 font-normal normal-case">(optional)</span></label>
                            <input value={teamDraft.description} onChange={e => setTeamDraft(p => ({...p, description: e.target.value}))}
                              placeholder="e.g. Doctors and nurses"
                              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medical-300 transition" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setShowCreateForm(false); setTeamDraft({ name: '', description: '' }); }}
                            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition">Cancel</button>
                          <button onClick={createTeam} disabled={!teamDraft.name.trim()}
                            className="flex items-center gap-2 px-5 py-2 bg-medical-600 text-white text-sm font-bold rounded-xl hover:bg-medical-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                            <Plus size={14} /> Create Team
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Team cards */}
                    {teams.length === 0 && !showCreateForm && (
                      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-medical-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg">
                          <Users size={24} className="text-white" />
                        </div>
                        <p className="text-gray-700 font-bold mb-1">No teams yet</p>
                        <p className="text-sm text-gray-400">Click "Create Team" to get started.</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {teams.map(t => (
                        <div key={t.id} onClick={() => { setActiveTeamId(t.id); setActiveMemberId(null); setShowInvite(false); }}
                          className="card cursor-pointer hover:border-medical-200 hover:shadow-md transition-all duration-200 group flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-medical-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow group-hover:scale-105 transition-transform">
                            <Users size={20} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900">{t.name}</p>
                            {t.description && <p className="text-sm text-gray-400 mt-0.5 truncate">{t.description}</p>}
                            <p className="text-xs text-gray-400 mt-1">{t.members.length} member{t.members.length !== 1 ? 's' : ''} · Created {t.createdOn}</p>
                          </div>
                          <ChevronRight size={18} className="text-gray-300 group-hover:text-medical-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── VIEW 2: Inside a Team ── */}
                {activeTeamId && !activeMemberId && activeTeam && (
                  <div>
                    {/* Breadcrumb */}
                    <button onClick={() => { setActiveTeamId(null); setShowInvite(false); }}
                      className="flex items-center gap-1.5 text-sm text-medical-600 font-semibold mb-5 hover:underline">
                      <ChevronRight size={14} className="rotate-180" /> Teams
                    </button>

                    {/* Team header */}
                    <div className="rounded-2xl bg-gradient-to-r from-medical-600 to-teal-600 p-5 mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                          <Users size={22} className="text-white" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg leading-tight">{activeTeam.name}</p>
                          {activeTeam.description && <p className="text-white/70 text-sm mt-0.5">{activeTeam.description}</p>}
                          <p className="text-white/50 text-xs mt-1">{activeTeam.members.length} member{activeTeam.members.length !== 1 ? 's' : ''} · Created {activeTeam.createdOn}</p>
                        </div>
                      </div>
                      <button onClick={() => setShowInvite(v => !v)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-bold rounded-xl transition-all">
                        <Plus size={15} /> Invite Member
                      </button>
                    </div>

                    {/* Invite form */}
                    {showInvite && (
                      <div className="card mb-5 border-2 border-medical-200 bg-medical-50/40 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                          <p className="font-bold text-gray-800">Invite a member</p>
                          <button onClick={() => setShowInvite(false)} className="p-1 hover:bg-gray-100 rounded-lg transition"><X size={15} className="text-gray-400" /></button>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Full Name</label>
                            <input value={invite.name} onChange={e => setInvite(p => ({...p, name: e.target.value}))}
                              placeholder="e.g. Ravi Kumar"
                              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medical-300 transition" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Email</label>
                            <input value={invite.email} onChange={e => setInvite(p => ({...p, email: e.target.value}))}
                              placeholder="email@medcare.in" type="email"
                              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medical-300 transition" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Role</label>
                            <select value={invite.role} onChange={e => setInvite(p => ({...p, role: e.target.value}))}
                              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medical-300 transition">
                              {ROLES.map(r => <option key={r}>{r}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setShowInvite(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition">Cancel</button>
                          <button onClick={sendInvite}
                            className="flex items-center gap-2 px-5 py-2 bg-medical-600 text-white text-sm font-bold rounded-xl hover:bg-medical-700 transition">
                            <Mail size={14} /> Send Invite
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Member list */}
                    <div className="card p-0 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{activeTeam.members.length} Member{activeTeam.members.length !== 1 ? 's' : ''}</p>
                      </div>
                      {activeTeam.members.map(m => {
                        const meta = ROLE_META[m.role];
                        return (
                          <div key={m.id} onClick={() => setActiveMemberId(m.id)}
                            className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 group transition-all">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-medical-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {m.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-800 truncate">{m.name}</p>
                                {m.id === OWNER.id && <Crown size={11} className="text-amber-500 flex-shrink-0" />}
                              </div>
                              <p className="text-[11px] text-gray-400 truncate">{m.email}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="flex flex-col items-end gap-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}>{m.role}</span>
                                {m.status === 'invited' && <span className="text-[10px] text-amber-600 font-semibold">Pending</span>}
                              </div>
                              {m.id !== OWNER.id && (
                                <button onClick={e => { e.stopPropagation(); removeMember(m.id); }}
                                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                  <Trash2 size={13} />
                                </button>
                              )}
                              <ChevronRight size={15} className="text-gray-300 group-hover:text-medical-500 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── VIEW 3: Member Permissions ── */}
                {activeTeamId && activeMemberId && activeMember && (
                  <div>
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-sm mb-5">
                      <button onClick={() => { setActiveTeamId(null); setActiveMemberId(null); }} className="text-medical-600 font-semibold hover:underline">Teams</button>
                      <ChevronRight size={13} className="text-gray-400" />
                      <button onClick={() => setActiveMemberId(null)} className="text-medical-600 font-semibold hover:underline">{activeTeam.name}</button>
                      <ChevronRight size={13} className="text-gray-400" />
                      <span className="text-gray-500">{activeMember.name}</span>
                    </div>

                    {/* Member card */}
                    <div className="card mb-6 flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-medical-500 to-teal-500 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
                        {activeMember.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-gray-900">{activeMember.name}</p>
                          {activeMember.id === OWNER.id && <Crown size={14} className="text-amber-500" />}
                        </div>
                        <p className="text-sm text-gray-500">{activeMember.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${ROLE_META[activeMember.role].bg} ${ROLE_META[activeMember.role].color}`}>{activeMember.role}</span>
                          {activeMember.status === 'invited' && <span className="text-xs text-amber-600 font-semibold">Invite pending</span>}
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="card">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Module Access</p>
                      <p className="text-xs text-gray-400 mb-5">{ROLE_META[activeMember.role].desc}</p>
                      <div className="space-y-4">
                        {ACCESS_MODULES.map(mod => {
                          const granted = activeTeam.memberAccess[activeMember.id]?.[mod] ?? false;
                          const isOwner = activeMember.id === OWNER.id;
                          return (
                            <div key={mod} className="flex items-center justify-between py-1">
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{mod}</p>
                                <p className="text-xs text-gray-400">{granted ? 'Access granted' : 'No access'}</p>
                              </div>
                              <button disabled={isOwner} onClick={() => toggleAccess(activeMember.id, mod)}
                                className={`w-12 h-6 rounded-full relative transition-all duration-300 flex-shrink-0 ${granted ? 'bg-medical-600 shadow-md shadow-medical-200' : 'bg-gray-200'} ${isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${granted ? 'left-7' : 'left-1'}`} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}


            {/* Save button */}
            {active !== 'team' && <div className="mt-8 flex justify-end">
              <button onClick={save}
                className={`flex items-center gap-2.5 px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-300 ${
                  saved ? 'bg-health-600 text-white scale-95 shadow-health-200' : 'bg-medical-600 hover:bg-medical-700 text-white hover:shadow-lg hover:-translate-y-0.5'
                }`}>
                {saved ? <><Check size={17}/>Saved!</> : <><Save size={17}/>Save Changes</>}
              </button>
            </div>}

          </div>
        </div>
      </div>
    </div>
  );
}
