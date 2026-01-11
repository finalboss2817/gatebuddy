
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { simulateResidentResponse } from '../services/geminiService';
import { VisitorType, Staff } from '../types';

const VisitorEntryForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');

  const [societyName, setSocietyName] = useState('GateBuddy Terminal');
  const [mode, setMode] = useState<'SELECT' | 'FORM' | 'STAFF' | 'LOADING' | 'RESULT' | 'ERROR'>('SELECT');
  const [visitorType, setVisitorType] = useState<VisitorType>('Guest');
  const [formData, setFormData] = useState({ name: '', flat: '', purpose: '' });
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchStaff, setSearchStaff] = useState('');
  const [result, setResult] = useState<{ approved: boolean, message: string } | null>(null);

  useEffect(() => {
    if (!sid) {
      setMode('ERROR');
      return;
    }
    fetchSocietyInfo();
  }, [sid]);

  const fetchSocietyInfo = async () => {
    const { data } = await supabase.from('societies').select('name').eq('id', sid).single();
    if (data) setSocietyName(data.name);
  };

  useEffect(() => {
    if (mode === 'STAFF') fetchStaff();
  }, [mode]);

  const fetchStaff = async () => {
    const { data } = await supabase.from('staff').select('*').eq('society_id', sid).order('name');
    if (data) setStaffList(data);
  };

  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMode('LOADING');

    const { data: entry, error } = await supabase
      .from('visitor_entries')
      .insert([{
        society_id: sid,
        flat_number: formData.flat,
        visitor_name: formData.name,
        purpose: formData.purpose,
        visitor_type: visitorType,
        status: 'PENDING'
      }]).select().single();

    if (error) {
      alert('Error connecting to system.');
      setMode('FORM');
      return;
    }

    const aiRes = await simulateResidentResponse(formData.name, formData.purpose, formData.flat);
    
    await supabase.from('visitor_entries')
      .update({ status: aiRes.approved ? 'APPROVED' : 'REJECTED' })
      .eq('id', entry.id);

    setResult(aiRes);
    setMode('RESULT');
  };

  const handleStaffToggle = async (staff: Staff) => {
    const newStatus = staff.status === 'In' ? 'Out' : 'In';
    await supabase.from('staff').update({ status: newStatus }).eq('id', staff.id);
    reset();
  };

  const reset = () => {
    setMode('SELECT');
    setFormData({ name: '', flat: '', purpose: '' });
    setResult(null);
    setSearchStaff('');
  };

  if (mode === 'ERROR') {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-4xl mb-6">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h1 className="text-white text-3xl font-black mb-4">INVALID ACCESS</h1>
        <p className="text-slate-400 font-bold max-w-sm">This gate terminal is not linked to any building. Please contact your society secretary for the correct link.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-auto max-h-[850px] border-8 border-slate-800 shadow-blue-900/40">
        
        <div className="bg-blue-600 p-8 text-white flex justify-between items-center shrink-0 border-b-4 border-blue-700">
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase leading-tight">{societyName}</h1>
            <p className="text-[10px] text-blue-100 font-black opacity-80 uppercase tracking-widest mt-1">SECURITY GATE TERMINAL</p>
          </div>
          {mode !== 'SELECT' && (
            <button onClick={reset} className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          )}
        </div>

        <div className="p-8 md:p-12 overflow-y-auto flex-1 flex flex-col bg-slate-50/30">
          
          {mode === 'SELECT' && (
            <div className="flex-1 flex flex-col justify-center gap-6">
              <h2 className="text-3xl font-black text-center text-slate-800 mb-6 tracking-tight">Who is arriving?</h2>
              
              <button 
                onClick={() => { setVisitorType('Guest'); setMode('FORM'); }}
                className="flex items-center gap-6 bg-white hover:bg-blue-600 hover:text-white p-10 rounded-[2.5rem] border-2 border-slate-100 transition-all text-left group shadow-sm active:scale-95"
              >
                <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white text-4xl group-hover:bg-white group-hover:text-blue-600 transition-colors">
                  <i className="fas fa-user-friends"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">GUEST</h3>
                  <p className="font-bold opacity-60">Friend, Family, Visit</p>
                </div>
              </button>

              <button 
                onClick={() => { setVisitorType('Delivery'); setMode('FORM'); }}
                className="flex items-center gap-6 bg-white hover:bg-orange-500 hover:text-white p-10 rounded-[2.5rem] border-2 border-slate-100 transition-all text-left group shadow-sm active:scale-95"
              >
                <div className="w-20 h-20 bg-orange-500 rounded-[1.5rem] flex items-center justify-center text-white text-4xl group-hover:bg-white group-hover:text-orange-500 transition-colors">
                  <i className="fas fa-truck"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">DELIVERY</h3>
                  <p className="font-bold opacity-60">Amazon, Swiggy, Courier</p>
                </div>
              </button>

              <button 
                onClick={() => setMode('STAFF')}
                className="flex items-center gap-6 bg-white hover:bg-emerald-600 hover:text-white p-10 rounded-[2.5rem] border-2 border-slate-100 transition-all text-left group shadow-sm active:scale-95"
              >
                <div className="w-20 h-20 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center text-white text-4xl group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                  <i className="fas fa-hard-hat"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">STAFF</h3>
                  <p className="font-bold opacity-60">Daily Help, Maid, Cook</p>
                </div>
              </button>
            </div>
          )}

          {mode === 'FORM' && (
            <form onSubmit={handleVisitorSubmit} className="space-y-8">
              <div className="flex items-center gap-6 mb-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg ${visitorType === 'Delivery' ? 'bg-orange-500 shadow-orange-100' : 'bg-blue-600 shadow-blue-100'}`}>
                   <i className={`fas ${visitorType === 'Delivery' ? 'fa-truck' : 'fa-user'}`}></i>
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Entry Details</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Flat Number</label>
                  <input required placeholder="Flat No." className="w-full text-4xl p-8 bg-white border-4 border-slate-100 rounded-3xl focus:border-blue-600 outline-none font-black text-slate-800 shadow-inner" value={formData.flat} onChange={e => setFormData({...formData, flat: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Visitor Name</label>
                  <input required placeholder="Guest Name" className="w-full text-3xl p-8 bg-white border-4 border-slate-100 rounded-3xl focus:border-blue-600 outline-none font-black text-slate-800 shadow-inner" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>

              <button type="submit" className="w-full py-8 rounded-[2.5rem] bg-blue-600 text-white text-3xl font-black shadow-2xl shadow-blue-200 mt-6 active:scale-95 transition-all uppercase tracking-tight">
                CHECK PERMISSION
              </button>
            </form>
          )}

          {mode === 'STAFF' && (
            <div className="space-y-8 flex flex-col h-full">
              <div className="shrink-0">
                <h2 className="text-3xl font-black text-slate-800 mb-6 tracking-tight">Staff Attendance</h2>
                <div className="relative">
                  <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 text-2xl"></i>
                  <input 
                    placeholder="Search by Name..." 
                    className="w-full p-8 pl-16 bg-white border-4 border-slate-100 rounded-[2rem] font-black text-2xl outline-none shadow-sm" 
                    value={searchStaff}
                    onChange={e => setSearchStaff(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {staffList.filter(s => s.name.toLowerCase().includes(searchStaff.toLowerCase()) || s.role.toLowerCase().includes(searchStaff.toLowerCase())).map(staff => (
                  <div key={staff.id} className="flex items-center justify-between p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-sm">
                    <div>
                      <p className="font-black text-2xl text-slate-800">{staff.name}</p>
                      <p className="text-sm font-black text-blue-600 uppercase tracking-widest mt-1">{staff.role} • {staff.flats?.join(', ')}</p>
                    </div>
                    <button 
                      onClick={() => handleStaffToggle(staff)}
                      className={`px-10 py-5 rounded-2xl font-black text-lg tracking-tight transition-all shadow-lg active:scale-90 ${
                        staff.status === 'In' ? 'bg-red-500 text-white shadow-red-100' : 'bg-emerald-500 text-white shadow-emerald-100'
                      }`}
                    >
                      {staff.status === 'In' ? 'EXIT' : 'ENTER'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'LOADING' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10">
              <div className="w-32 h-32 border-[12px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase">Waiting for Resident</h2>
                <p className="text-slate-400 font-bold text-xl mt-4 px-10">Resident at Flat {formData.flat} is being notified now...</p>
              </div>
            </div>
          )}

          {mode === 'RESULT' && result && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 animate-in zoom-in duration-500">
              <div className={`w-52 h-52 rounded-full flex items-center justify-center text-white text-8xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] ${
                result.approved ? 'bg-emerald-500 shadow-emerald-200' : 'bg-red-500 shadow-red-200'
              }`}>
                <i className={`fas ${result.approved ? 'fa-check' : 'fa-times'}`}></i>
              </div>
              <div>
                <h2 className={`text-7xl font-black tracking-tighter ${result.approved ? 'text-emerald-600' : 'text-red-600'}`}>
                  {result.approved ? 'ALLOW' : 'DENY'}
                </h2>
                <div className="mt-8 p-10 bg-white rounded-[3rem] border-4 border-slate-100 font-black text-2xl text-slate-600 italic leading-snug">
                  "{result.message}"
                </div>
              </div>
              <button onClick={reset} className="w-full py-8 rounded-[2.5rem] bg-slate-900 text-white text-3xl font-black shadow-2xl mt-8 active:scale-95 transition-all">
                NEXT VISITOR
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-12 flex items-center gap-4 text-slate-500 font-black text-sm uppercase tracking-[0.4em] opacity-30">
        <i className="fas fa-signal"></i> SECURE CLOUD ACTIVE
      </div>
    </div>
  );
};

export default VisitorEntryForm;
