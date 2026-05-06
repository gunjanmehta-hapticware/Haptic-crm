import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Contacts from './pages/Contacts';
import VoiceCalls from './pages/VoiceCalls';
import Settings from './pages/Settings';
import MarketingLeads from './pages/MarketingLeads';
import Campaigns from './pages/Campaigns';

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('medcare_auth');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="marketing" element={<MarketingLeads />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="settings" element={<Settings />} />
          <Route path="voice-calls" element={<VoiceCalls />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
