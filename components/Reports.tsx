
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { supabase } from '../services/supabaseClient';

interface Props {
  societyId: string;
}

const Reports: React.FC<Props> = ({ societyId }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (societyId) fetchAggregates();
  }, [societyId]);

  const fetchAggregates = async () => {
    const { data: entries } = await supabase
      .from('visitor_entries')
      .select('visitor_type, created_at')
      .eq('society_id', societyId);
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const aggregated = days.map(day => {
      const dayEntries = entries?.filter(e => {
        const d = new Date(e.created_at);
        return days[d.getDay()] === day;
      }) || [];

      return {
        name: day,
        visitors: dayEntries.filter(e => e.visitor_type !== 'Delivery').length,
        deliveries: dayEntries.filter(e => e.visitor_type === 'Delivery').length,
      };
    });

    setData(aggregated);
    setLoading(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Building Activity Intelligence</h2>
        <p className="text-slate-500 font-medium">Data-driven insights for your society security.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest">Entry Volume (Weekly)</h3>
            <i className="fas fa-chart-bar text-blue-500"></i>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                  cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="visitors" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Guests" />
                <Bar dataKey="deliveries" fill="#f97316" radius={[6, 6, 0, 0]} name="Deliveries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest">Traffic Density Peak</h3>
            <i className="fas fa-wave-square text-orange-500"></i>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVis)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-3xl">
              <i className="fas fa-file-download"></i>
           </div>
           <div>
              <h4 className="text-xl font-black tracking-tight">Download Monthly Summary</h4>
              <p className="text-slate-400 text-sm font-bold">Generate a full PDF report for the committee meeting.</p>
           </div>
        </div>
        <button className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-xl">
           EXPORT PDF
        </button>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default Reports;
