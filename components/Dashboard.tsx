
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { VisitorEntry } from '../types';

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} text-white text-xl`}>
      <i className={`fas ${icon}`}></i>
    </div>
  </div>
);

const Dashboard: React.FC<{ societyId: string }> = ({ societyId }) => {
  const [stats, setStats] = useState({ visitors: 0, deliveries: 0, staffIn: 0 });
  const [recentEntries, setRecentEntries] = useState<VisitorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [manualBaseUrl, setManualBaseUrl] = useState('');

  // Auto-detect the base URL on mount
  useEffect(() => {
    let base = window.location.href.split('#')[0].split('?')[0].replace(/\/+$/, '');
    // Remove blob prefix if present
    base = base.replace(/^blob:/, '');
    setManualBaseUrl(base);
  }, []);

  /**
   * Generates the terminal link using the manual or detected base URL.
   */
  const getTerminalLink = () => {
    if (!societyId) return '#';
    const base = manualBaseUrl.replace(/\/+$/, '').replace(/^blob:/, '');
    return `${base}/#/entry?sid=${societyId}`;
  };

  const guardLink = getTerminalLink();
  const isBlobUrl = guardLink.startsWith('blob:') || guardLink.includes('blob:');
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=20&data=${encodeURIComponent(guardLink)}`;

  useEffect(() => {
    if (societyId) fetchDashboardData();
  }, [societyId]);

  const fetchDashboardData = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [visitorsRes, recentRes, staffRes] = await Promise.all([
      supabase.from('visitor_entries')
        .select('visitor_type, created_at')
        .eq('society_id', societyId)
        .gte('created_at', today.toISOString()),
      supabase.from('visitor_entries')
        .select('*')
        .eq('society_id', societyId)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('staff')
        .select('id', { count: 'exact' })
        .eq('society_id', societyId)
        .eq('status', 'In')
    ]);

    const visitorCount = visitorsRes.data?.filter(v => v.visitor_type !== 'Delivery').length || 0;
    const deliveryCount = visitorsRes.data?.filter(v => v.visitor_type === 'Delivery').length || 0;

    setStats({
      visitors: visitorCount,
      deliveries: deliveryCount,
      staffIn: staffRes.count || 0
    });
    setRecentEntries(recentRes.data || []);
    setLoading(false);
  };

  const copyGuardLink = () => {
    if (guardLink === '#') return;
    navigator.clipboard.writeText(guardLink);
    alert('Terminal Link copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Security Command Center</h2>
          <p className="text-gray-500">Building Management Console</p>
        </div>
        <div className="flex gap-2">
          <Link to="/emergency" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <i className="fas fa-bullhorn"></i> Emergency
          </Link>
          <button 
            onClick={() => setShowQRModal(true)}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
          >
            <i className="fas fa-qrcode"></i> Gate Link & QR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Today's Visitors" value={stats.visitors} icon="fa-user-friends" color="bg-blue-500" />
        <StatCard title="Deliveries Today" value={stats.deliveries} icon="fa-box" color="bg-orange-500" />
        <StatCard title="Staff Currently In" value={stats.staffIn} icon="fa-hard-hat" color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-history text-blue-500"></i> Recent Activity
          </h3>
          <div className="space-y-4">
            {recentEntries.length > 0 ? recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                    <i className={`fas ${entry.visitor_type === 'Delivery' ? 'fa-truck' : 'fa-user'}`}></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{entry.visitor_name}</p>
                    <p className="text-xs text-gray-500">Flat {entry.flat_number} • {entry.visitor_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    entry.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                    entry.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {entry.status}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-center py-8 text-gray-400 text-sm italic">No entries found for today.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-200">
            <h3 className="text-xl font-black mb-2">Gate Terminal Access</h3>
            <p className="text-blue-100 text-sm mb-6 opacity-90">Generate the specific entry link for your security gate personnel.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowQRModal(true)}
                className="flex-1 text-center bg-white text-blue-600 py-4 rounded-2xl font-black text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                <i className="fas fa-qrcode mr-2"></i> Manage Gate
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <i className="fas fa-bolt text-yellow-500"></i> Administration
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/residents" className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group">
                <i className="fas fa-users text-blue-600 mb-2 block text-xl group-hover:scale-110 transition-transform"></i>
                <p className="font-bold text-blue-900 text-sm">Residents</p>
              </Link>
              <Link to="/notices" className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group">
                <i className="fas fa-bullhorn text-orange-600 mb-2 block text-xl group-hover:scale-110 transition-transform"></i>
                <p className="font-bold text-orange-900 text-sm">Post Notice</p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
              <h3 className="font-black uppercase tracking-widest text-sm">Gate Terminal Configuration</h3>
              <button onClick={() => setShowQRModal(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              {isBlobUrl && (
                <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex gap-4 items-start">
                  <i className="fas fa-exclamation-triangle text-amber-600 mt-1"></i>
                  <div className="text-xs text-amber-800 font-medium leading-relaxed">
                    <p className="font-black uppercase tracking-widest mb-1">Sandbox Preview Detected</p>
                    <p>The system detected a 'blob' URL. To get a working QR code, copy the URL from your browser's address bar and paste it below.</p>
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Verify Base URL</label>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-mono outline-none focus:border-blue-500 transition-colors"
                    value={manualBaseUrl}
                    onChange={(e) => setManualBaseUrl(e.target.value)}
                    placeholder="https://your-site.com"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-white border-4 border-slate-50 rounded-3xl mb-6 shadow-inner">
                  {!isBlobUrl ? (
                    <img src={qrCodeUrl} alt="Gate QR Code" className="w-56 h-56 rounded-2xl" />
                  ) : (
                    <div className="w-56 h-56 bg-slate-100 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400">
                      <i className="fas fa-qrcode text-4xl mb-4 opacity-20"></i>
                      <p className="text-[10px] font-bold uppercase tracking-widest">QR Disabled for Blob URLs</p>
                    </div>
                  )}
                </div>
                
                <h4 className="text-xl font-black text-slate-900 mb-2">Security Portal Access</h4>
                <p className="text-slate-500 text-sm mb-8 px-4 font-medium leading-relaxed">
                  Provide this QR or Link to the guard station. They will use this to log all entries.
                </p>

                <div className="w-full space-y-3">
                  <button 
                    onClick={copyGuardLink}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-2xl font-black transition-all hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-100"
                  >
                    <i className="fas fa-copy"></i> COPY TERMINAL LINK
                  </button>
                  <p className="text-[9px] font-mono text-slate-400 break-all px-4">{guardLink}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
