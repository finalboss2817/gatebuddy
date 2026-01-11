
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [societyName, setSocietyName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) {
        alert(authError.message);
      } else if (authData.user) {
        // Create the society record for this new user
        await supabase.from('societies').insert([{
          name: societyName,
          city: 'Default City',
          owner_id: authData.user.id
        }]);
        alert('Account created! Please check your email for verification.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 text-white text-4xl mb-6">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">GateBuddy</h1>
          <p className="text-slate-500 font-medium mt-2 italic">A venture by Meena technologies</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Building / Society Name</label>
                <input
                  required
                  className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-bold transition-all"
                  placeholder="e.g. Skyline Towers"
                  value={societyName}
                  onChange={(e) => setSocietyName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
              <input
                required
                type="email"
                className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-bold transition-all"
                placeholder="secretary@building.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Password</label>
              <input
                required
                type="password"
                className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-bold transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading ? <i className="fas fa-circle-notch animate-spin"></i> : (isSignUp ? 'CREATE ACCOUNT' : 'SECURE LOGIN')}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-400 font-bold hover:text-blue-600 transition-colors"
            >
              {isSignUp ? 'Already have a building? Login' : 'Register a new building? Sign Up'}
            </button>
          </div>
        </div>

        <div className="mt-10 text-center text-slate-400 text-xs font-black uppercase tracking-widest">
          Trusted by 300+ Residential Complexes
        </div>
      </div>
    </div>
  );
};

export default Login;
