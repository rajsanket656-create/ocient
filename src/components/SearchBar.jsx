import React, { useState } from 'react';
import { Search, Terminal } from 'lucide-react';

export default function SearchBar({ onSearch, isLoading }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSearch(input.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mb-8">
      <div className="flex items-center bg-black/50 border border-[#00ff41] p-3 md:p-4 rounded-sm shadow-[0_0_15px_rgba(0,255,65,0.2)] focus-within:shadow-[0_0_25px_rgba(0,255,65,0.4)] transition-shadow">
        <Terminal className="text-[#00ff41] mr-3" size={20} />
        <span className="text-[#00ff41] mr-2 text-sm md:text-base hidden sm:inline">
          root@osint:~#
        </span>
        <span className="text-[#00ff41] mr-2 text-sm md:text-base sm:hidden">
          ~#
        </span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Enter mobile number"
          className="flex-1 bg-transparent border-none outline-none text-[#00ff41] font-mono text-base md:text-lg placeholder:text-[#00ff41]/30"
          autoFocus
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="ml-4 bg-[#00ff41]/10 hover:bg-[#00ff41]/20 border border-[#00ff41] px-4 py-2 text-[#00ff41] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Search size={18} />
          <span className="hidden md:inline">Execute</span>
        </button>
      </div>
    </form>
  );
}
