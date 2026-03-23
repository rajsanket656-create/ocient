import React, { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, LogOut, Shield, Coins, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, profile, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async (e) => {
    if (e) e.preventDefault();
    console.log("Initiating TERMINATE_SESSION sequence...");
    setIsOpen(false);
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out via Supabase:', error);
    }
    window.location.replace('/login');
  };

  return (
    <div className="absolute top-4 right-4 z-50 text-[#00ff41] font-mono" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-[#050505] border border-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:shadow-[0_0_20px_rgba(0,255,65,0.6)] hover:bg-[#00ff41]/10 transition-all rounded-sm"
      >
        <SettingsIcon size={20} className={isOpen ? "animate-spin-slow" : ""} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[#050505] border border-[#00ff41] shadow-[0_0_30px_rgba(0,255,65,0.4)] p-4 rounded-sm flex flex-col gap-4 crt-flicker">
          <div className="flex flex-col gap-1 border-b border-[#00ff41]/30 pb-3">
             <span className="text-xs opacity-70 flex items-center gap-1"><Shield size={12}/> IDENTITY MODULE</span>
             <span className="text-sm font-bold truncate" title={currentUser?.email}>ID: {currentUser?.email || 'UNKNOWN'}</span>
             <span className="text-xs text-yellow-500 animate-pulse mt-1">STATUS: AUTHENTICATED</span>
          </div>

          <div className="flex flex-col gap-3 border-b border-[#00ff41]/30 pb-4">
             <div className="flex items-center justify-between">
                <span className="text-sm font-bold flex items-center gap-1"><Coins size={14}/> CREDITS:</span>
                <span className="text-lg font-bold text-shadow">{profile?.credits !== undefined ? profile.credits : '...'}</span>
             </div>
             
             {profile?.is_admin && (
               <button 
                 onClick={() => navigate('/admin')}
                 className="flex items-center justify-center gap-2 w-full mt-2 border border-[#00ff41] text-black bg-[#00ff41] hover:bg-[#00ff41]/80 px-3 py-2 text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,255,65,0.5)] rounded-sm"
               >
                 <Shield size={12} /> [ ADMIN_PANEL ]
               </button>
             )}

             <a 
               href="https://wa.me/7377504157?text=Hi%20Admin,%20I%20want%20to%20buy%20more%20credits%20for%20DARKOSINT" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 w-full border border-[#00ff41] text-[#00ff41] bg-[#00ff41]/10 hover:bg-[#00ff41]/20 px-3 py-2 text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,255,65,0.3)] rounded-sm"
             >
               [ RECHARGE_CREDITS ] <ExternalLink size={12} />
             </a>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full border border-red-500 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white px-4 py-2 text-sm font-bold transition-all shadow-[0_0_10px_rgba(255,0,0,0.3)] rounded-sm mt-1"
          >
            <LogOut size={16} />
            TERMINATE SESSION
          </button>
        </div>
      )}
    </div>
  );
}
