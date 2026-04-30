import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hospital, Eye, EyeOff, Shield, Activity, Users } from 'lucide-react';

const DEMO_CREDS = { email: 'admin@medcare.in', password: 'admin123' };

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (form.email === DEMO_CREDS.email && form.password === DEMO_CREDS.password) {
        localStorage.setItem('medcare_auth', JSON.stringify({ email: form.email, role: 'admin' }));
        navigate('/');
      } else {
        setError('Invalid email or password. Use admin@medcare.in / admin123');
        setLoading(false);
      }
    }, 900);
  }

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-medical-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Hospital size={22} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-gray-900 text-2xl leading-tight">MedCare</p>
              <p className="text-gray-400 text-xs font-medium tracking-widest uppercase">Hospital CRM</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500">Sign in to access your healthcare dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="admin@medcare.in"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-medical-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-medical-600 hover:bg-medical-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Demo Credentials</p>
            <p className="text-sm text-gray-700"><span className="font-medium">Email:</span> admin@medcare.in</p>
            <p className="text-sm text-gray-700"><span className="font-medium">Password:</span> admin123</p>
          </div>

          <p className="mt-8 text-center text-gray-400 text-xs">
            © 2026 MedCare Multi-Specialty Hospital. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right: Visual panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-medical-900 via-medical-800 to-medical-950 flex-col justify-center px-16 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${(i + 1) * 80}px`,
                height: `${(i + 1) * 80}px`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        {/* Cross pattern */}
        <div className="absolute top-12 right-12 w-16 h-16 opacity-20">
          <div className="absolute left-1/2 top-0 bottom-0 w-4 -translate-x-1/2 bg-white rounded" />
          <div className="absolute top-1/2 left-0 right-0 h-4 -translate-y-1/2 bg-white rounded" />
        </div>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/20">
            <Activity size={32} className="text-white" />
          </div>

          <h2 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
            Comprehensive<br />Healthcare CRM
          </h2>
          <p className="text-medical-200 text-lg mb-10 leading-relaxed">
            Manage appointments, OPD queues, surgical operations, and patient communications — all in one place.
          </p>

          <div className="space-y-4">
            {[
              { icon: Users, text: '1,248 patients managed' },
              { icon: Shield, text: 'HIPAA-compliant & secure' },
              { icon: Activity, text: 'Real-time OPD tracking' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/80">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-medical-200" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-3">
          {[
            { val: '24', label: "Today's Appts" },
            { val: '9', label: 'Active OPD' },
            { val: '94.2%', label: 'Satisfaction' },
          ].map(({ val, label }) => (
            <div key={label} className="bg-white/10 rounded-xl p-4 border border-white/10 text-center">
              <p className="font-display text-2xl font-bold text-white">{val}</p>
              <p className="text-medical-300 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
