import { useState, useEffect } from 'react';

export default function DevHelper() {
  const [lastCode, setLastCode] = useState<string | null>(null);

  useEffect(() => {
    const updateCode = () => {
      const code = localStorage.getItem('last_dev_code');
      setLastCode(code);
    };

    updateCode();
    const interval = setInterval(updateCode, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
      <div className="pointer-events-auto bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl p-4 flex items-center gap-4 transition-all">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Son Doğrulama Kodu</span>
          <span className="text-lg font-black font-mono text-indigo-400">
            {lastCode || 'Henüz kod yok'}
          </span>
        </div>
        
        {lastCode && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                Object.keys(localStorage).forEach(key => {
                  if (key.startsWith('voted_')) localStorage.removeItem(key);
                });
                window.location.reload();
              }}
              className="p-3 bg-red-900/20 text-red-400 rounded-2xl hover:bg-red-900/40 transition-all"
              title="Oyları Sıfırla (Reset)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(lastCode)}
              className="p-3 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition-all"
              title="Kopyala"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
