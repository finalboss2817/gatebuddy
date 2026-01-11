
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Resident } from '../types';

interface Props {
  societyId: string;
}

const ResidentManager: React.FC<Props> = ({ societyId }) => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', flat_number: '', whatsapp_number: '' });

  useEffect(() => {
    if (societyId) fetchResidents();
  }, [societyId]);

  const fetchResidents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('residents')
      .select('*')
      .eq('society_id', societyId)
      .order('flat_number', { ascending: true });
    
    if (data) setResidents(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await supabase.from('residents').update(formData).eq('id', editingId);
    } else {
      await supabase.from('residents').insert([{ ...formData, society_id: societyId }]);
    }
    setFormData({ name: '', flat_number: '', whatsapp_number: '' });
    setEditingId(null);
    fetchResidents();
  };

  const handleEdit = (resident: Resident) => {
    setEditingId(resident.id);
    setFormData({ 
      name: resident.name, 
      flat_number: resident.flat_number, 
      whatsapp_number: resident.whatsapp_number 
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-user-plus text-sm"></i>
          </div>
          {editingId ? 'Edit Resident Details' : 'Onboard New Resident'}
        </h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Flat No.</label>
            <input
              required
              className="w-full p-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 focus:bg-white outline-none font-bold transition-all"
              placeholder="e.g. 101"
              value={formData.flat_number}
              onChange={(e) => setFormData({ ...formData, flat_number: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Resident Name</label>
            <input
              required
              className="w-full p-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 focus:bg-white outline-none font-bold transition-all"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp</label>
            <input
              required
              className="w-full p-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 focus:bg-white outline-none font-bold transition-all"
              placeholder="+91..."
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
              {editingId ? 'UPDATE' : 'SAVE RESIDENT'}
            </button>
            {editingId && (
              <button onClick={() => { setEditingId(null); setFormData({name:'', flat_number:'', whatsapp_number:''}); }} className="bg-slate-100 text-slate-500 p-3 rounded-xl font-bold">✕</button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Flat</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {residents.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5 font-black text-blue-600 text-lg">{r.flat_number}</td>
                <td className="p-5 font-bold text-slate-700">{r.name}</td>
                <td className="p-5 text-slate-500 font-medium">{r.whatsapp_number}</td>
                <td className="p-5 text-right">
                  <button onClick={() => handleEdit(r)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-black text-xs hover:bg-blue-100 transition-colors">
                    EDIT
                  </button>
                </td>
              </tr>
            ))}
            {residents.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="p-20 text-center">
                  <div className="flex flex-col items-center opacity-30">
                    <i className="fas fa-users text-5xl mb-4"></i>
                    <p className="font-bold">No residents added yet.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResidentManager;
