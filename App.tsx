
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import Dashboard from './components/Dashboard';
import VisitorEntryForm from './components/VisitorEntry';
import DeliveryLog from './components/DeliveryLog';
import StaffManagement from './components/StaffManagement';
import EmergencyPanel from './components/EmergencyPanel';
import NoticeBoard from './components/NoticeBoard';
import Reports from './components/Reports';
import ResidentManager from './components/ResidentManager';
import Login from './components/Login';
import Settings from './components/Settings';

const Sidebar = ({ societyName, onLogout }: { societyName: string; onLogout: () => void }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Don't show sidebar on the Guard Entry page or Login
  if (location.pathname.startsWith('/entry')) return null;

  const links = [
    { path: '/', label: 'Dashboard', icon: 'fa-chart-pie' },
    { path: '/residents', label: 'Residents', icon: 'fa-home' },
    { path: '/delivery', label: 'Deliveries', icon: 'fa-truck' },
    { path: '/staff', label: 'Staff Log', icon: 'fa-users' },
    { path: '/notices', label: 'Notice Board', icon: 'fa-bullhorn' },
    { path: '/emergency', label: 'Emergency', icon: 'fa-exclamation-triangle', color: 'text-red-600' },
    { path: '/reports', label: 'Reports', icon: 'fa-file-alt' },
    { path: '/settings', label: 'Settings', icon: 'fa-cog' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen sticky top-0 hidden md:flex flex-col border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
          <i className="fas fa-shield-alt"></i>
          GateBuddy
        </h1>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Secretary Panel</p>
      </div>
      <nav className="mt-6 px-4 space-y-1 flex-1 overflow-y-auto">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              isActive(link.path)
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : `text-slate-400 hover:bg-slate-800 ${link.color || ''}`
            }`}
          >
            <i className={`fas ${link.icon} w-5`}></i>
            <span className="font-medium">{link.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-400">Current Building</p>
          <p className="text-sm font-bold text-white truncate">{societyName || 'Loading...'}</p>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all font-bold text-sm"
        >
          <i className="fas fa-sign-out-alt w-5"></i> Logout
        </button>
      </div>
    </aside>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [society, setSociety] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // 1. Listen for Auth Changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchSociety(session.user.id);
      else setInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchSociety(session.user.id);
      else {
        setSociety(null);
        setInitializing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchSociety = async (userId: string) => {
    const { data } = await supabase
      .from('societies')
      .select('*')
      .eq('owner_id', userId)
      .single();
    
    setSociety(data);
    setInitializing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* Guard Terminal is PUBLIC (Protected by society ID in URL) */}
        <Route path="/entry" element={<VisitorEntryForm />} />

        {/* Auth Gated Admin Routes */}
        <Route
          path="/*"
          element={
            session ? (
              <div className="flex min-h-screen bg-gray-50">
                <Sidebar societyName={society?.name} onLogout={handleLogout} />
                <main className="flex-1">
                  <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard societyId={society?.id} />} />
                      <Route path="/residents" element={<ResidentManager societyId={society?.id} />} />
                      <Route path="/delivery" element={<DeliveryLog societyId={society?.id} />} />
                      <Route path="/staff" element={<StaffManagement societyId={society?.id} />} />
                      <Route path="/notices" element={<NoticeBoard societyId={society?.id} />} />
                      <Route path="/emergency" element={<EmergencyPanel societyId={society?.id} />} />
                      <Route path="/reports" element={<Reports societyId={society?.id} />} />
                      <Route path="/settings" element={<Settings societyId={society?.id} societyName={society?.name} />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </div>
                </main>
              </div>
            ) : (
              <Login />
            )
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
