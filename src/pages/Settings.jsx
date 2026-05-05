import { useState, useRef } from 'react';
import { User, Bell, Shield, Hospital, Save, Check, ChevronRight, Camera } from 'lucide-react';
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
];

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

            {/* Save button */}
            <div className="mt-8 flex justify-end">
              <button onClick={save}
                className={`flex items-center gap-2.5 px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-300 ${
                  saved ? 'bg-health-600 text-white scale-95 shadow-health-200' : 'bg-medical-600 hover:bg-medical-700 text-white hover:shadow-lg hover:-translate-y-0.5'
                }`}>
                {saved ? <><Check size={17}/>Saved!</> : <><Save size={17}/>Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
