
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { generateSocietyNotice } from '../services/geminiService';
import { Notice } from '../types';

interface Props {
  societyId: string;
}

const NoticeBoard: React.FC<Props> = ({ societyId }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (societyId) fetchNotices();
  }, [societyId]);

  const fetchNotices = async () => {
    const { data } = await supabase
      .from('notices')
      .select('*')
      .eq('society_id', societyId)
      .order('created_at', { ascending: false });
    if (data) setNotices(data);
  };

  const handleDraft = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const result = await generateSocietyNotice(topic);
    setDraft(result || '');
    setIsGenerating(false);
  };

  const postNotice = async () => {
    if (!draft) return;
    await supabase.from('notices').insert([{
      society_id: societyId,
      title: topic || 'Important Update',
      content: draft,
      author: 'Society Secretary'
    }]);
    setDraft('');
    setTopic('');
    fetchNotices();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Society Notice Board</h2>
          <p className="text-slate-500 font-medium">Post updates and broadcast to all residents via WhatsApp.</p>
        </div>
      </div>
      
      <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100/50">
        <h3 className="font-black text-xl mb-6 flex items-center gap-2 uppercase tracking-tight">
          <i className="fas fa-magic text-yellow-400"></i> AI Notice Assistant
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            className="flex-1 p-4 rounded-2xl text-slate-900 outline-none font-bold placeholder:text-slate-400"
            placeholder="Topic? (e.g. Water shortage on Sunday, Lift maintenance)"
            value={topic}
            onChange={e => setTopic(e.target.value)}
          />
          <button 
            onClick={handleDraft}
            disabled={isGenerating}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-feather-alt mr-2"></i>}
            DRAFT WITH AI
          </button>
        </div>
        {draft && (
          <div className="mt-8 p-8 bg-white/10 rounded-3xl border-2 border-white/10 animate-in zoom-in duration-300">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-100 mb-4 opacity-70">AI Generated Draft Preview</h4>
            <p className="whitespace-pre-wrap text-lg mb-8 font-medium leading-relaxed">{draft}</p>
            <button 
              onClick={postNotice} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
            >
              <i className="fas fa-paper-plane mr-2"></i> POST & BROADCAST
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {notices.map(n => (
          <div key={n.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-[0.2em]">
                {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <div className="text-slate-300"><i className="fas fa-quote-right text-2xl"></i></div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight leading-tight">{n.title}</h3>
            <div className="text-slate-600 text-lg leading-relaxed font-medium mb-8">
              {n.content}
            </div>
            <div className="pt-6 border-t border-slate-50 flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-xs">
                <i className="fas fa-user-tie"></i>
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Signed: {n.author}</p>
            </div>
          </div>
        ))}
        {notices.length === 0 && (
          <div className="col-span-full py-32 text-center opacity-20">
             <i className="fas fa-scroll text-6xl mb-4"></i>
             <p className="font-black uppercase tracking-[0.3em] text-sm">No notices posted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;
