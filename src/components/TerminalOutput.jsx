import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function TerminalOutput({ data, error, isLoading }) {
  const terminalRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (data) {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  useEffect(() => {
    // Scroll to top when new data loads to see the beginning of the output
    if (terminalRef.current) {
      terminalRef.current.scrollTop = 0;
    }
  }, [data, error, isLoading]);

  return (
    <div 
      ref={terminalRef}
      className="flex-1 w-full bg-[#050505] border border-[#00ff41] p-4 font-mono text-sm overflow-y-auto custom-scrollbar shadow-[inset_0_0_20px_rgba(0,255,65,0.1)] relative"
    >
      <div className="absolute top-0 right-0 bg-[#00ff41] text-black pl-2 pr-1 py-0.5 text-xs font-bold font-mono z-10 flex items-center gap-4 border-l border-b border-[#00ff41]">
        <span>TERMINAL_OUTPUT</span>
        {data && !isLoading && !error && (
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1 bg-[#050505] text-[#00ff41] px-2 py-0.5 hover:bg-[#00ff41] hover:text-[#050505] border border-[#00ff41] transition-all duration-300 rounded-sm cursor-pointer"
            title="Copy to clipboard"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'COPIED' : 'COPY'}
          </button>
        )}
      </div>

      {!data && !error && !isLoading && (
        <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-4">
          <div className="text-4xl text-[#00ff41] animate-pulse">_</div>
          <p>AWAITING INPUT...</p>
        </div>
      )}

      {isLoading && (
        <div className="text-[#00ff41] animate-pulse whitespace-pre-wrap mt-4 flex items-center space-x-2">
           <span className="inline-block w-4 h-4 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin"></span>
           <span>Decrypting Data...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="text-[#ff0000] font-bold mt-4 animate-pulse uppercase tracking-widest text-shadow-error">
          [ERROR]: {error}
        </div>
      )}

      {data && !isLoading && (
        <div className="text-[#00ff41] whitespace-pre-wrap break-all mt-4 leading-relaxed">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
