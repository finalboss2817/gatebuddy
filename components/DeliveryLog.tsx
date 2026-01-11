
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { VisitorEntry } from '../types';

interface Props {
  societyId: string;
}

const DeliveryLog: React.FC<Props> = ({ societyId }) => {
  const [deliveries, setDeliveries] = useState<VisitorEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'delivered'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (societyId) fetchDeliveries();
  }, [societyId]);

  const fetchDeliveries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('visitor_entries')
      .select('*')
      .eq('society_id', societyId)
      .eq('visitor_type', 'Delivery')
      .order('created_at', { ascending: false });
    
    if (data) setDeliveries(data);
    setLoading(false);
  };

  const markDelivered = async (id: string) => {
    await supabase
      .from('visitor_entries')
      .update({ status: 'CHECKED_IN' })
      .eq('id', id);
    fetchDeliveries();
  };

  const pending = deliveries.filter(d => d.status === 'PENDING' || d.status === 'APPROVED');
  const completed = deliveries.filter(d => d.status === 'CHECKED_IN' || d.status === 'CHECKED_OUT');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Delivery Command</h2>
          <p className="text-slate-500 font-medium">Tracking all Amazon, Swiggy, and courier arrivals.</p>
        </div>
      </div>

      <div className="flex gap-8 border-b border-slate-100">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-4 px-2 text-sm font-black tracking-widest uppercase transition-all relative ${
            activeTab === 'pending' ? 'text-orange-600' : 'text-slate-400'
          }`}
        >
          Active Packages ({pending.length})
          {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-t-full"></div>}
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          className={`pb-4 px-2 text-sm font-black tracking-widest uppercase transition-all relative ${
            activeTab === 'delivered' ? 'text-orange-600' : 'text-slate-400'
          }`}
        >
          Historical Log ({completed.length})
          {activeTab === 'delivered' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-t-full"></div>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(activeTab === 'pending' ? pending : completed).map((item) => (
          <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform">
                <i className="fas fa-box-open"></i>
              </div>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                item.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {item.status}
              </span>
            </div>
            <h3 className="font-black text-2xl text-slate-800 tracking-tight">{item.visitor_name}</h3>
            <p className="text-slate-500 font-bold text-lg mt-1">Flat {item.flat_number}</p>
            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                <i className="far fa-clock mr-1 text-slate-300"></i> {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {item.status !== 'CHECKED_IN' && (
                <button 
                  onClick={() => markDelivered(item.id)}
                  className="bg-orange-600 text-white px-5 py-2 rounded-xl font-black text-xs hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100 active:scale-95"
                >
                  RECEIVED
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {deliveries.length === 0 && !loading && (
        <div className="py-32 text-center opacity-20">
           <i className="fas fa-truck-loading text-6xl mb-4"></i>
           <p className="font-black uppercase tracking-[0.3em] text-sm">No delivery activity found.</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryLog;
