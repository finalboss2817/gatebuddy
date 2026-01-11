
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface Props {
  societyId: string;
}

const EmergencyPanel: React.FC<Props> = ({ societyId }) => {
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (societyId) fetchEmergencyHistory();
  }, [societyId]);

  const fetchEmergencyHistory = async () => {
    const { data } = await supabase
      .from('emergencies')
      .select('*')
      .eq('society_id', societyId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setHistory(data);
  };

  const handleTrigger = async (type: string, description: string) => {
    setActiveAlert(type);
    
    await supabase.from('emergencies').insert([{
      society_id: societyId,
      type,
      description
    }]);

    fetchEmergencyHistory();
  };

  const emergencies = [
    { type: 'FIRE', icon: 'fa-fire', color: 'bg-red-600', description: 'Fire detected in building' },
    { type: 'MEDICAL', icon: 'fa-heartbeat', color: 'bg-blue-600', description: 'Medical emergency - Ambulance needed' },
    { type: 'THEFT', icon: 'fa-user-secret', color: 'bg-black', description: 'Intruder or theft reported' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
          <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
          Emergency Command Center
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">ACTIVATE SOCIETY ALERT</h2>
        <p className="text-slate-500 font-medium mt-3 max-w-lg mx-auto">Clicking a button will instantly trigger a broadcast to all residents and security personnel via WhatsApp and Phone App.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {emergencies.map((e) => (
          <button
            key={e.type}
            onClick={() => handleTrigger(e.type, e.description)}
            className={`${e.color} hover:scale-[1.02] transition-all p-12 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center gap-6 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-10 transition-opacity"></div>
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl text-white group-active:scale-90 transition-transform">
              <i className={`fas ${e.icon}`}></i>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black text-white uppercase tracking-wider">{e.type}</h3>
              <p className="text-white/70 text-xs font-bold mt-2 uppercase tracking-widest">{e.description}</p>
            </div>
          </button>
        ))}
      </div>

      {activeAlert && (
        <div className="fixed inset-0 bg-red-600/98 z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
          <i className="fas fa-radiation text-9xl text-white mb-10 animate-spin"></i>
          <h1 className="text-7xl font-black text-white mb-6 uppercase tracking-tighter">!! {activeAlert} ALERT !!</h1>
          <p className="text-2xl text-white/90 font-bold mb-16 max-w-2xl leading-relaxed">
            CRITICAL SYSTEM BROADCAST ACTIVE. <br />
            Notifications sent to residents, watchmen, and committee.
          </p>
          <button
            onClick={() => setActiveAlert(null)}
            className="bg-white text-red-600 px-16 py-6 rounded-3xl text-2xl font-black shadow-2xl active:scale-95 transition-all hover:bg-slate-50"
          >
            DISMISS & RESET
          </button>
        </div>
      )}

      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <h3 className="font-black text-xl mb-6 flex items-center gap-2 text-slate-800">
           <i className="fas fa-history text-slate-400"></i> Society Incident Log
        </h3>
        <div className="space-y-4">
          {history.length > 0 ? history.map((h) => (
            <div key={h.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${h.type === 'FIRE' ? 'bg-red-500' : h.type === 'MEDICAL' ? 'bg-blue-500' : 'bg-black'}`}>
                  <i className={`fas ${h.type === 'FIRE' ? 'fa-fire' : h.type === 'MEDICAL' ? 'fa-heartbeat' : 'fa-user-secret'}`}></i>
                </div>
                <div>
                  <p className="font-black text-slate-800 text-lg uppercase tracking-tight">{h.type}</p>
                  <p className="text-sm text-slate-500 font-medium">{h.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {new Date(h.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs font-bold text-slate-300">
                  {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 opacity-30">
               <p className="font-black uppercase tracking-widest text-sm italic">No emergency incidents reported.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyPanel;
