import React, { useState } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import TerminalOutput from '../components/TerminalOutput';
import SystemLogs from '../components/SystemLogs';
import Settings from '../components/Settings';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { profile, updateCredits } = useAuth();

  const handleSearch = async (mobileNumber) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    // Credit Check Logic
    if (!profile || profile.credits < 10) {
      setError('INSUFFICIENT_FUNDS');
      setIsLoading(false);
      return;
    }

    // Deduct 10 credits before execution
    const currentCredits = profile.credits;
    const deductionSuccess = await updateCredits(currentCredits - 10);
    
    if (!deductionSuccess) {
      setError('SYS_ERROR: UNABLE TO DEDUCT CREDITS');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`https://nv2.ek4nsh.in/api?key=3012&mobile=${mobileNumber}`);
      
      // If the API returns a success response with actual data
      if (response.data) {
        const modifiedData = { ...response.data };
        if ('developer' in modifiedData || modifiedData) {
           modifiedData.developer = '@__ur_priyanshu';
        }
        setData(modifiedData);
      } else {
        throw new Error('NO_DATA_RETURNED');
      }
    } catch (err) {
      console.error(err);
      setError('CONNECTION_REFUSED');
      
      // Refund credits if the API call entirely failed
      await updateCredits(currentCredits);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#00ff41] font-mono crt-flicker relative overflow-hidden flex flex-col lg:flex-row">
      <div className="scanlines"></div>
      
      <Settings />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 md:p-8 h-screen z-10 w-full lg:w-3/4">
        <header className="mb-6 border-b border-[#00ff41]/30 pb-4 pr-12">
           <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-[0.2em] text-shadow">
             DarkOSINT<span className="animate-pulse">_</span>
           </h1>
           <p className="text-[#00ff41]/70 text-sm mt-2">
             TG : {profile?.is_admin ? <span className="text-red-500 font-bold">ELITE_ADMIN</span> : '@Blackhat09090'} // CONNECTION: SECURE // {data && (data.Name || data.name) ? `TARGET: ${String(data.Name || data.name).toUpperCase()}` : 'TARGET: UNKNOWN'}
           </p>
        </header>

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        
        <TerminalOutput data={data} error={error} isLoading={isLoading} />
      </main>

      {/* Sidebar Area */}
      <aside className="w-full lg:w-1/4 h-64 lg:h-screen z-10 border-t-2 lg:border-t-0 lg:border-l-2 border-[#00ff41]/50">
        <SystemLogs />
      </aside>
    </div>
  );
}
