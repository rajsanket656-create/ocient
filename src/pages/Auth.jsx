import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Fingerprint, Lock, Mail, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { user } = await login(email, password);
        const { data: profileData } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        
        if (profileData?.is_admin || user.email === 'tatinihar@gmail.com') {
           navigate('/admin');
        } else {
           navigate(returnTo && returnTo !== '/admin' ? returnTo : '/');
        }
      } else {
        if (!showOtp) {
          await register(email, password);
          setShowOtp(true);
          setLoading(false);
          return;
        }

        if (otp.length !== 6) {
          setError('INVALID_OTP_LENGTH');
          setLoading(false);
          return;
        }

        const { user } = await verifyOtp(email, otp);
        const { data: profileData } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (profileData?.is_admin || user.email === 'tatinihar@gmail.com') {
           navigate('/admin');
        } else {
           navigate(returnTo && returnTo !== '/admin' ? returnTo : '/');
        }
      }
    } catch (err) {
      setError(err.message || 'AUTHENTICATION_FAILED');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#00ff41] font-mono crt-flicker flex items-center justify-center p-4 relative overflow-hidden">
      <div className="scanlines"></div>
      
      <div className="w-full max-w-md bg-[#050505] border border-[#00ff41] shadow-[0_0_30px_rgba(0,255,65,0.2)] p-8 z-10 relative">
        <div className="absolute top-0 right-0 bg-[#00ff41] text-black px-3 py-1 text-xs font-bold font-mono">
          SECURE_NODE
        </div>

        <div className="flex flex-col items-center justify-center mb-8 border-b border-[#00ff41]/30 pb-6">
          <Fingerprint size={48} className="mb-4 text-[#00ff41] animate-pulse" />
          <h1 className="text-xl md:text-2xl font-bold uppercase tracking-[0.1em] text-center text-shadow">
            Access Denied
          </h1>
          <p className="text-[#00ff41]/70 text-sm mt-2 text-center">PLEASE AUTHENTICATE</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-500 p-3 mb-6 animate-pulse text-sm text-center">
            [ERROR]: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ff41]/50" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="TARGET_EMAIL"
                className="w-full bg-black/50 border border-[#00ff41] p-3 pl-10 text-[#00ff41] placeholder:text-[#00ff41]/30 outline-none focus:shadow-[0_0_15px_rgba(0,255,65,0.4)] transition-all"
                disabled={showOtp || loading}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ff41]/50" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ENCRYPTION_KEY"
                className="w-full bg-black/50 border border-[#00ff41] p-3 pl-10 text-[#00ff41] placeholder:text-[#00ff41]/30 outline-none focus:shadow-[0_0_15px_rgba(0,255,65,0.4)] transition-all"
                disabled={showOtp || loading}
              />
            </div>

            {showOtp && !isLogin && (
              <div className="relative animate-pulse">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ff41]/50" size={18} />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-DIGIT_OTP"
                  className="w-full bg-black/50 border border-[#00ff41] p-3 pl-10 text-[#00ff41] placeholder:text-[#00ff41]/30 outline-none focus:shadow-[0_0_15px_rgba(0,255,65,0.4)] transition-all text-center tracking-[0.5em]"
                  disabled={loading}
                  autoFocus
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00ff41]/10 hover:bg-[#00ff41]/20 border border-[#00ff41] p-3 text-[#00ff41] font-bold tracking-widest transition-all hover:shadow-[0_0_20px_rgba(0,255,65,0.4)] disabled:opacity-50"
          >
            {loading ? 'PROCESSING...' : (showOtp && !isLogin ? 'VERIFY OTP' : 'GRANT ACCESS')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setShowOtp(false);
              setError('');
            }}
            className="text-[#00ff41]/70 hover:text-[#00ff41] hover:underline"
            disabled={loading}
          >
            {isLogin ? 'INITIATE REGISTRATION SEQUENCE' : 'RETURN TO LOGIN'}
          </button>
        </div>
      </div>
    </div>
  );
}
