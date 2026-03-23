import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-[#00ff41] font-mono crt-flicker flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="scanlines"></div>
          <h1 className="text-3xl font-bold mb-4 text-red-500 animate-pulse">CRITICAL_SYSTEM_FAILURE</h1>
          <p className="text-lg mb-4 text-red-400">The application encountered a fatal JavaScript rendering error.</p>
          <div className="bg-black/50 border border-red-500 p-4 text-left font-mono text-xs md:text-sm max-w-4xl w-full overflow-auto text-red-500 shadow-[0_0_15px_rgba(255,0,0,0.3)]">
            {this.state.error && this.state.error.toString()}
          </div>
          <button 
            className="mt-8 border border-[#00ff41] text-[#00ff41] bg-[#00ff41]/10 px-6 py-3 hover:bg-[#00ff41]/30 transition-all font-bold tracking-widest shadow-[0_0_15px_rgba(0,255,65,0.3)]"
            onClick={() => window.location.reload()}
          >
            REBOOT SYSTEM
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
