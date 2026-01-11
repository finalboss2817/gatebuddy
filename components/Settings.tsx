
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface Props {
  societyId: string;
  societyName: string;
}

const Settings: React.FC<Props> = ({ societyId, societyName }) => {
  const [loading, setLoading] = useState(false);

  const clearLogs = async () => {
    if (!window.confirm("Are you sure? This will delete all visitor history, delivery logs, notices, and emergency alerts.")) return;
    setLoading(true);
    
    try {
      await Promise.all([
        supabase.from('visitor_entries').delete().eq('society_id', societyId),
        supabase.from('notices').delete().eq('society_id', societyId),
        supabase.from('emergencies').delete().eq('society_id', societyId)
      ]);
      alert("Logs cleared successfully.");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to clear logs.");
    } finally {
      setLoading(false);
    }
  };

  const resetAllData = async () => {
    if (!window.confirm("CRITICAL: This will delete ALL data (Residents, Staff, and Logs). You will start from scratch. Proceed?")) return;
    setLoading(true);
    
    try {
      await Promise.all([
        supabase.from('visitor_entries').delete().eq('society_id', societyId),
        supabase.from('notices').delete().eq('society_id', societyId),
        supabase.from('emergencies').delete().eq('society_id', societyId),
        supabase.from('residents').delete().eq('society_id', societyId),
        supabase.from('staff').delete().eq('society_id', societyId)
      ]);
      alert("Society data reset to factory settings.");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to reset data.");
    } finally {
      setLoading(false);
    }
  };

  const deleteSociety = async () => {
    if (!window.confirm("PERMANENT ACTION: This will delete the building profile and all associated data. You will be logged out. Continue?")) return;
    setLoading(true);
    
    try {
      // Cleanup everything first
      await Promise.all([
        supabase.from('visitor_entries').delete().eq('society_id', societyId),
        supabase.from('notices').delete().eq('society_id', societyId),
        supabase.from('emergencies').delete().eq('society_id', societyId),
        supabase.from('residents').delete().eq('society_id', societyId),
        supabase.from('staff').delete().eq('society_id', societyId)
      ]);

      // Finally delete the society itself
      await supabase.from('societies').delete().eq('id', societyId);
      await supabase.auth.signOut();
    } catch (error) {
      console.error(error);
      alert("Failed to delete society.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-slate-500 font-medium mt-1">Manage your building profile and data privacy.</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        <div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Building Profile</h3>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Building Name</p>
              <p className="text-xl font-bold text-slate-800">{societyName}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-building"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 p-8 rounded-[2.5rem] border-2 border-red-100 space-y-8">
        <div className="flex items-center gap-3 text-red-600">
          <i className="fas fa-exclamation-triangle text-2xl"></i>
          <h3 className="text-xl font-black uppercase tracking-tight">Danger Zone</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-red-100 flex flex-col justify-between gap-6">
            <div>
              <h4 className="font-black text-slate-800">Clear Activity Logs</h4>
              <p className="text-sm text-slate-500 mt-1">Deletes all visitor entries, deliveries, and notices. Useful for clearing test data while keeping residents.</p>
            </div>
            <button 
              disabled={loading}
              onClick={clearLogs}
              className="w-full py-4 bg-orange-100 text-orange-700 rounded-2xl font-black text-xs hover:bg-orange-200 transition-all active:scale-95"
            >
              CLEAR LOGS
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-red-100 flex flex-col justify-between gap-6">
            <div>
              <h4 className="font-black text-slate-800">Reset All Data</h4>
              <p className="text-sm text-slate-500 mt-1">Wipes Residents, Staff, and all Logs. Factory reset your building profile.</p>
            </div>
            <button 
              disabled={loading}
              onClick={resetAllData}
              className="w-full py-4 bg-red-100 text-red-700 rounded-2xl font-black text-xs hover:bg-red-200 transition-all active:scale-95"
            >
              RESET EVERYTHING
            </button>
          </div>

          <div className="bg-red-600 p-6 rounded-3xl flex flex-col justify-between gap-6 md:col-span-2">
            <div>
              <h4 className="font-black text-white">Delete Entire Building</h4>
              <p className="text-sm text-white/70 mt-1">Permanently remove this society and all data from GateBuddy. This action cannot be undone.</p>
            </div>
            <button 
              disabled={loading}
              onClick={deleteSociety}
              className="w-full py-4 bg-white text-red-600 rounded-2xl font-black text-xs hover:bg-slate-50 transition-all active:scale-95 shadow-xl"
            >
              DELETE PROFILE PERMANENTLY
            </button>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default Settings;
