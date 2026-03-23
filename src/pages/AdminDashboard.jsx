import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldAlert, Search, Save, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser, profile, loading: authLoading, login } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [users, setUsers] = useState([]);
  const [creditInputs, setCreditInputs] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [databaseError, setDatabaseError] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [successToast, setSuccessToast] = useState('');
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setDatabaseError(false);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('email');

    if (error || !data || data.length === 0) {
      setDatabaseError(true);
      setUsers([]);
      setCreditInputs({});
    } else {
      setUsers(data);
      setDatabaseError(false);
      setCreditInputs(
        data.reduce((acc, user) => {
          acc[user.id] = String(user.credits ?? 0);
          return acc;
        }, {})
      );
    }

    setLoadingUsers(false);
  };

  useEffect(() => {
    if (currentUser && profile?.is_admin) {
      fetchUsers();
    }
  }, [currentUser, profile]);

  useEffect(() => {
    if (!successToast) return undefined;

    const timeoutId = window.setTimeout(() => setSuccessToast(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [successToast]);

  const handleUpdate = async (id, newCreditsStr) => {
    const newCredits = parseInt(newCreditsStr, 10);
    if (isNaN(newCredits)) return;

    setUpdatingId(id);
    const { error } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', id);

    if (!error) {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === id ? { ...user, credits: newCredits } : user
        )
      );
      setCreditInputs((currentInputs) => ({
        ...currentInputs,
        [id]: String(newCredits),
      }));
      setSuccessToast('SUCCESS');
    } else {
      setSuccessToast('[ERROR]: UPDATE_FAILED');
    }

    setUpdatingId(null);
  };

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm, users]
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#00ff41] font-mono crt-flicker flex items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="scanlines"></div>
        <div className="animate-pulse font-bold text-xl text-[#00ff41]">[ VERIFYING_AUTHORIZATION... ]</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#00ff41] font-mono crt-flicker flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="scanlines"></div>
        <div className="w-full max-w-md border border-[#00ff41] bg-black/80 p-8 shadow-[0_0_20px_rgba(0,255,65,0.2)] z-10 relative">
          <h2 className="text-2xl mb-6 font-bold tracking-widest text-center border-b border-[#00ff41]/30 pb-4">ADMIN_AUTHENTICATION</h2>
          {loginError && <div className="mb-4 text-red-500 border border-red-500 bg-red-500/10 p-2 text-sm text-center">{loginError}</div>}
          <form onSubmit={async (e) => {
            e.preventDefault();
            setIsLoggingIn(true);
            setLoginError('');
            try {
              await login(loginEmail, loginPassword);
            } catch (err) {
              setLoginError(err.message || 'AUTHENTICATION_FAILED');
            } finally {
              setIsLoggingIn(false);
            }
          }} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs mb-1 text-[#00ff41]/70">ADMIN_IDENTITY [EMAIL]</label>
              <input 
                type="email" 
                required
                value={loginEmail} 
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full bg-black border border-[#00ff41]/50 p-2 text-[#00ff41] outline-none focus:border-[#00ff41]" 
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-[#00ff41]/70">SECURITY_KEY [PASSWORD]</label>
              <input 
                type="password" 
                required
                value={loginPassword} 
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full bg-black border border-[#00ff41]/50 p-2 text-[#00ff41] outline-none focus:border-[#00ff41]" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="mt-4 border border-[#00ff41] bg-[#00ff41]/10 px-4 py-2 hover:bg-[#00ff41]/30 transition-all font-bold tracking-widest disabled:opacity-50"
            >
              {isLoggingIn ? 'AUTHENTICATING...' : 'INITIALIZE_LINK'}
            </button>
          </form>
          <button 
            onClick={() => navigate('/')} 
            className="mt-6 w-full text-center text-xs text-[#00ff41]/50 hover:text-[#00ff41] transition-colors"
          >
            [ RETURN_TO_GRID ]
          </button>
        </div>
      </div>
    );
  }

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#00ff41] font-mono crt-flicker flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="scanlines"></div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-red-500 animate-pulse">403: ACCESS_DENIED</h1>
        <p className="text-lg mb-8 text-red-400 border border-red-500 bg-red-500/10 p-4">UNAUTHORIZED_ENTITY</p>
        <button onClick={() => navigate('/')} className="border border-[#00ff41] bg-[#00ff41]/10 px-6 py-3 hover:bg-[#00ff41]/30 transition-all font-bold tracking-widest shadow-[0_0_15px_rgba(0,255,65,0.3)] z-10">
          RETURN_TO_GRID
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#00ff41] font-mono crt-flicker relative overflow-hidden flex flex-col p-4 md:p-8">
      <div className="scanlines"></div>
      
      {successToast && (
        <div className="fixed bottom-8 right-8 border border-[#00ff41] bg-black/90 px-6 py-3 text-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.8)] z-50 animate-pulse font-bold tracking-widest text-sm">
          {successToast}
        </div>
      )}

      <header className="mb-8 border-b border-[#00ff41]/30 pb-4 flex items-center justify-between z-10">
         <div>
           <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-[0.2em] text-shadow flex items-center gap-4 text-red-500 flex-wrap">
             <ShieldAlert size={40} className="animate-pulse"/> ELITE_ADMIN_PANEL
             <span className="text-xs md:text-sm tracking-[0.15em] text-[#00ff41] font-bold">
               ADMIN: [{currentUser?.email ?? 'UNKNOWN'}]
             </span>
           </h1>
           <p className="text-[#00ff41]/70 text-sm">
             SYSTEM STATUS: <span className="text-green-500 font-bold">ONLINE</span> // MANAGE USER CREDITS
           </p>
         </div>
         <button onClick={() => navigate('/')} className="border border-[#00ff41] bg-[#00ff41]/10 px-4 py-2 hover:bg-[#00ff41]/30 transition-all">
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
             <RefreshCw size={20} className={loadingUsers && !databaseError ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="border border-[#00ff41] bg-black/50 overflow-x-auto shadow-[0_0_20px_rgba(0,255,65,0.2)]">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-[#00ff41]/50 bg-[#00ff41]/10 uppercase text-sm tracking-wider">
                <th className="p-4">Email Address</th>
                <th className="p-4 w-48">Current Credits</th>
                <th className="p-4 w-48 text-center">Add Credits</th>
              </tr>
            </thead>
            <tbody>
              {databaseError ? (
                <tr>
                   <td colSpan="3" className="p-8 text-center text-red-500 font-bold tracking-widest border-t border-red-500/30">
                     [ERROR]: DATABASE_LINK_OFFLINE
                   </td>
                </tr>
              ) : loadingUsers ? (
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
                    <td className="p-4">{user.credits ?? 0}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <input 
                          type="number" 
                          min="0"
                          value={creditInputs[user.id] ?? ''}
                          onChange={(event) =>
                            setCreditInputs((currentInputs) => ({
                              ...currentInputs,
                              [user.id]: event.target.value,
                            }))
                          }
                          className="w-24 bg-black border border-[#00ff41]/50 p-2 text-[#00ff41] outline-none focus:border-[#00ff41]"
                        />
                        <button 
                          onClick={() => handleUpdate(user.id, creditInputs[user.id])}
                          disabled={updatingId === user.id}
                          className="flex items-center gap-2 border border-green-500 text-green-500 bg-green-500/10 hover:bg-green-500/30 px-3 py-2 transition-all disabled:opacity-50 font-bold tracking-wide"
                        >
                          {updatingId === user.id ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} 
                          [ UPDATE ]
                        </button>
                      </div>
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
