
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Staff } from '../types';

interface Props {
  societyId: string;
}

const StaffManagement: React.FC<Props> = ({ societyId }) => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: '', phone: '', flats: '' });

  useEffect(() => {
    if (societyId) fetchStaff();
  }, [societyId]);

  const fetchStaff = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('society_id', societyId)
      .order('name', { ascending: true });
    
    if (data) setStaffList(data);
    setLoading(false);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const flatsArray = newStaff.flats.split(',').map(f => f.trim()).filter(f => f !== '');
    
    await supabase.from('staff').insert([{
      society_id: societyId,
      name: newStaff.name,
      role: newStaff.role,
      phone: newStaff.phone,
      flats: flatsArray,
      status: 'Out'
    }]);

    setNewStaff({ name: '', role: '', phone: '', flats: '' });
    setShowAddForm(false);
    fetchStaff();
  };

  const toggleStatus = async (staff: Staff) => {
    const newStatus = staff.status === 'In' ? 'Out' : 'In';
    const lastCheckIn = newStatus === 'In' ? new Date().toISOString() : staff.last_check_in;
    
    await supabase.from('staff')
      .update({ status: newStatus, last_check_in: lastCheckIn })
      .eq('id', staff.id);
    
    fetchStaff();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Regular Staff Register</h2>
          <p className="text-slate-500">Daily helpers, maids, and maintenance</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-6 py-3 rounded-xl font-black text-sm shadow-lg transition-all active:scale-95 ${
            showAddForm ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
          }`}
        >
          {showAddForm ? 'CANCEL' : 'ADD NEW STAFF'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-8 rounded-[2rem] border-2 border-blue-50 shadow-xl shadow-blue-50/50 animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
              <input required className="w-full p-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 outline-none font-bold" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Role</label>
              <input required className="w-full p-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 outline-none font-bold" placeholder="Maid, Driver..." value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone</label>
              <input required className="w-full p-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 outline-none font-bold" value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assigned Flats</label>
              <input className="w-full p-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-500 outline-none font-bold" placeholder="101, 202..." value={newStaff.flats} onChange={e => setNewStaff({...newStaff, flats: e.target.value})} />
            </div>
            <button type="submit" className="bg-emerald-600 text-white p-3 rounded-xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">
              SAVE STAFF
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coverage</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gate Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {staffList.map((staff) => (
              <tr key={staff.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                       <i className="fas fa-user"></i>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{staff.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{staff.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="p-5 font-bold text-slate-600">{staff.role}</td>
                <td className="p-5">
                  <div className="flex gap-1 flex-wrap">
                    {staff.flats?.map(f => (
                      <span key={f} className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-md font-black tracking-tight">{f}</span>
                    ))}
                  </div>
                </td>
                <td className="p-5">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    staff.status === 'In' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {staff.status}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => toggleStatus(staff)}
                    className={`font-black text-xs px-6 py-2.5 rounded-xl border-2 transition-all active:scale-95 ${
                      staff.status === 'In' ? 'text-red-600 border-red-50 hover:bg-red-50' : 'text-emerald-600 border-emerald-50 hover:bg-emerald-50'
                    }`}
                  >
                    {staff.status === 'In' ? 'CHECK OUT' : 'CHECK IN'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staffList.length === 0 && !loading && (
          <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-sm">Staff register is empty.</div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
