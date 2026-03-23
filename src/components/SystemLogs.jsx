import React, { useState, useEffect, useRef } from 'react';

const FAKE_LOGS = [
  "Initializing Proxy...",
  "Bypassing Firewall...",
  "Connecting to secure node...",
  "Establishing encrypted tunnel...",
  "Decrypting handshake...",
  "Injecting reconnaissance payload...",
  "Analyzing packet anomalies...",
  "Scanning target infrastructure...",
  "Extracting metadata stream...",
  "Routing through onion network...",
  "Masking origin IP..."
];

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // 50% chance to add a new log each tick for realism
      if (Math.random() > 0.5) {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
        const log = FAKE_LOGS[Math.floor(Math.random() * FAKE_LOGS.length)];
        setLogs(prev => [...prev.slice(-40), `[${timestamp}] ${log}`]);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-full bg-[#050505] border-l-2 border-[#00ff41] p-4 flex flex-col font-mono text-xs lg:text-sm text-[#00ff41] overflow-hidden opacity-90 shadow-[inset_0_0_10px_0_#00ff41]">
      <div className="flex items-center gap-2 mb-4 border-b border-[#00ff41] pb-2">
        <div className="w-2 h-2 bg-[#00ff41] rounded-full animate-pulse"></div>
        <h2 className="font-bold uppercase tracking-widest text-shadow">Real-Time Ops</h2>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col">
        {logs.map((log, i) => (
          <div key={i} className="mb-1.5 opacity-80 hover:opacity-100 transition-opacity">
            <span className="text-[#00ff41] opacity-70">root@osint:~#</span> {log}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
