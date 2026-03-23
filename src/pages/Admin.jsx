import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldAlert, Search, Save, RefreshCw } from 'lucide-react';

export default function Admin() {
  const { currentUser, profile, login, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [verifyingTimeout, setVerifyingTimeout] = useState(false);
  const [hasAttemptedAdminLogin, setHasAttemptedAdminLogin] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, credits')
      .order('email');
      
    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile?.is_admin) {
      fetchUsers();
    }
  }, [profile]);

  useEffect(() => {
    let t;
    if (currentUser && profile === null) {
      setVerifyingTimeout(false);
      t = setTimeout(() => {
        setVerifyingTimeout(true);
      }, 2000);
    } else {
      setVerifyingTimeout(false);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [currentUser, profile]);

  useEffect(() => {
    // Forcefully ditch old old non-admin sessions to explicitly show the admin login form.
    if (currentUser && profile && !profile.is_admin && !hasAttemptedAdminLogin) {
      logout().catch(() => {});
    }
  }, [currentUser, profile, hasAttemptedAdminLogin, logout]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    setHasAttemptedAdminLogin(true);
    try {
      await login(adminEmail, adminPassword);
    } catch (err) {
      setLoginError(err.message || 'AUTHORIZATION_FAILED');
    }
    setIsLoggingIn(false);
  };

  if (!currentUser || (currentUser && profile && !profile.is_admin && !hasAttemptedAdminLogin)) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#00ff41] font-mono crt-flicker flex items-center justify-center p-4 relative overflow-hidden">
        <div className="scanlines"></div>
        <div className="w-full max-w-md bg-black/80 border border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.2)] p-8 z-10">
          <div className="flex flex-col items-center justify-center mb-8 border-b border-red-500/30 pb-6">
            <ShieldAlert size={48} className="mb-4 text-red-500 animate-pulse" />
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-[0.1em] text-center text-red-500 text-shadow">
              SYSTEM AUTHENTICATION
            </h1>
            <p className="text-red-500/70 text-sm mt-2 text-center">ADMINISTRATOR LOGIN REQUIRED</p>
          </div>
          {loginError && (
            <div className="bg-red-900/20 border border-red-500 text-red-500 p-3 mb-6 animate-pulse text-sm text-center">
              [CRITICAL]: {loginError}
            </div>
          )}
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="GLOBAL_ADMIN_ID"
              className="w-full bg-black/50 border border-red-500 p-3 text-red-500 placeholder:text-red-500/30 outline-none focus:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all"
              disabled={isLoggingIn}
            />
            <input
              type="password"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="ROOT_PASSPHRASE"
              className="w-full bg-black/50 border border-red-500 p-3 text-red-500 placeholder:text-red-500/30 outline-none focus:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all"
              disabled={isLoggingIn}
            />
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500 p-3 text-red-500 font-bold tracking-widest transition-all hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] disabled:opacity-50"
            >
              {isLoggingIn ? 'AUTHENTICATING...' : 'ESTABLISH LINK'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button 
              onClick={async () => {
                if (currentUser) {
                  try { await logout(); } catch(e) {}
                }
                window.location.replace('/');
              }} 
              className="text-red-500/70 hover:text-red-500 text-sm hover:underline" 
              disabled={isLoggingIn}
            >
              ABORT & RETURN
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser && profile === null && !verifyingTimeout) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#00ff41] font-mono crt-flicker flex items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="scanlines"></div>
        <div className="animate-pulse font-bold text-xl text-[#00ff41]">[ VERIFYING_AUTHORIZATION... ]</div>
      </div>
    );
  }

  if ((profile && !profile.is_admin) || (currentUser && profile === null && verifyingTimeout)) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#00ff41] font-mono crt-flicker flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="scanlines"></div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-red-500 animate-pulse">403: ACCESS_DENIED</h1>
        <p className="text-lg mb-8 text-red-400 border border-red-500 bg-red-500/10 p-4">UNAUTHORIZED_ENTITY</p>
        <button 
          onClick={async () => {
            try { await logout(); } catch(e) {}
            window.location.replace('/');
          }} 
          className="border border-[#00ff41] bg-[#00ff41]/10 px-6 py-3 hover:bg-[#00ff41]/30 transition-all font-bold tracking-widest shadow-[0_0_15px_rgba(0,255,65,0.3)]">
          RETURN_TO_HOME
        </button>
      </div>
    );
  }

  const handleUpdate = async (id, currentCredits, newCreditsStr) => {
    const newCredits = parseInt(newCreditsStr, 10);
    if (isNaN(newCredits)) return;

    setUpdatingId(id);
    const { error } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', id);

    if (!error) {
      setUsers(users.map(u => u.id === id ? { ...u, credits: newCredits } : u));
    }
    setUpdatingId(null);
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-[#00ff41] font-mono crt-flicker relative overflow-hidden flex flex-col p-4 md:p-8">
      <div className="scanlines"></div>
      
      <header className="mb-8 border-b border-[#00ff41]/30 pb-4 flex items-center justify-between z-10">
         <div>
           <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-[0.2em] text-shadow flex items-center gap-4 text-red-500">
             <ShieldAlert size={40} className="animate-pulse"/> ELITE_ADMIN_PANEL
           </h1>
           <p className="text-[#00ff41]/70 text-sm mt-2">
             SYSTEM STATUS: <span className="text-green-500 font-bold">ONLINE</span> // MANAGE USER CREDITS
           </p>
         </div>
         <button onClick={() => window.location.href = '/'} className="border border-[#00ff41] bg-[#00ff41]/10 px-4 py-2 hover:bg-[#00ff41]/30 transition-all">
           RETURN_TO_GRID
         </button>
      </header>

      <main className="flex-1 z-10 w-full max-w-6xl mx-auto flex flex-col gap-6">
        
        <div className="flex items-center bg-black/50 border border-[#00ff41] p-3 rounded-sm shadow-[0_0_15px_rgba(0,255,65,0.2)]">
          <Search className="text-[#00ff41] mr-3" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="FILTER_ACCOUNTS_BY_EMAIL..."
            className="flex-1 bg-transparent border-none outline-none text-[#00ff41] font-mono"
          />
          <button onClick={fetchUsers} className="ml-4 hover:text-white transition-colors" title="Reload Database">
             <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="border border-[#00ff41] bg-black/50 overflow-x-auto shadow-[0_0_20px_rgba(0,255,65,0.2)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#00ff41]/50 bg-[#00ff41]/10 uppercase text-sm tracking-wider">
                <th className="p-4">Email Address</th>
                <th className="p-4 w-48">Current Credits</th>
                <th className="p-4 w-48">Add Credits</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center animate-pulse">EXTRACTING_DATA...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-red-500">NO_RECORDS_FOUND</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[#00ff41]/20 hover:bg-[#00ff41]/5 transition-colors">
                    <td className="p-4 font-bold">{user.email || 'UNKNOWN_NODE'}</td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        min="0"
                        defaultValue={user.credits}
                        id={`credits-${user.id}`}
                        className="w-24 bg-black border border-[#00ff41]/50 p-2 text-[#00ff41] outline-none focus:border-[#00ff41]"
                      />
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => {
                          const val = document.getElementById(`credits-${user.id}`).value;
                          handleUpdate(user.id, user.credits, val);
                        }}
                        disabled={updatingId === user.id}
                        className="flex items-center gap-2 border border-[#00ff41] bg-[#00ff41]/10 hover:bg-[#00ff41]/30 px-3 py-2 transition-all disabled:opacity-50"
                      >
                        {updatingId === user.id ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} 
                        SET
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
