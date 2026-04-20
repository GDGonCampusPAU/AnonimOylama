import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getElectionByInviteCode } from '../api';
import { VALIDATION, ERROR_MESSAGES } from '../config';

export default function HomePage() {
  const navigate = useNavigate();

  const [isCreatingElection, setIsCreatingElection] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const handleCreateElection = async () => {
    setIsCreatingElection(true);
    setTimeout(() => {
      navigate('/create');
      setIsCreatingElection(false);
    }, 800);
  };

  const handleJoinElection = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');

    if (!inviteCode.trim()) {
      setJoinError('Oda kodunu girin');
      return;
    }

    const cleanedCode = inviteCode.toUpperCase().trim();
    if (!VALIDATION.INVITE_CODE_REGEX.test(cleanedCode)) {
      setJoinError('Geçersiz oda kodu');
      return;
    }

    setIsJoining(true);
    try {
      const result = await getElectionByInviteCode(cleanedCode);
      if (result.success && result.data) {
        navigate(`/verify/${cleanedCode}`);
      } else {
        setJoinError(result.error || ERROR_MESSAGES.ELECTION_NOT_FOUND);
      }
    } catch (error) {
      setJoinError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 transition-colors duration-500">
      <div className="w-full max-w-4xl">
        {/* Minimal Header */}
        <header className="mb-20 text-center">
          <h1 className="text-4xl font-light tracking-tight text-slate-900 mb-3">
            GDG on Campus <span className="font-semibold text-indigo-600">Voting</span>
          </h1>
          <p className="text-slate-400 font-medium">Birlikte, özgürce ve anonim olarak karar verin.</p>
        </header>

        {/* Minimal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          
          {/* Action 1: Create */}
          <section className="flex flex-col">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Yönetim</h2>
            <div className="flex-1 border-l border-slate-100 pl-8 py-2 transition-colors">
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">Seçim Başlat</h3>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed max-w-xs">
                Yeni bir oylama odası oluşturun ve ekibinizi davet edin. Tüm süreç uçtan uca şifrelidir.
              </p>
              <button
                onClick={handleCreateElection}
                disabled={isCreatingElection}
                className="group flex items-center gap-3 text-indigo-600 font-bold hover:gap-5 transition-all text-sm"
              >
                <span>{isCreatingElection ? 'Hazırlanıyor...' : 'Yeni Seçim Oluştur'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>
          </section>

          {/* Action 2: Join */}
          <section className="flex flex-col">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Katılım</h2>
            <div className="flex-1 border-l border-slate-100 pl-8 py-2 transition-colors">
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">Odaya Katıl</h3>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed max-w-xs">
                Size gönderilen oda kodunu kullanarak aktif bir seçime katılın ve oyunuzu kullanın.
              </p>
              
              <form onSubmit={handleJoinElection} className="relative max-w-xs">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase());
                    setJoinError('');
                  }}
                  placeholder="ODA KODU"
                  className="w-full bg-slate-50 border-none px-4 py-3 rounded-xl text-sm font-bold tracking-widest text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                  maxLength={VALIDATION.INVITE_CODE_LENGTH}
                  disabled={isJoining}
                />
                <button
                  type="submit"
                  disabled={!inviteCode.trim() || isJoining}
                  className="absolute right-2 top-2 p-1.5 text-indigo-600 hover:scale-110 transition-all disabled:opacity-30 disabled:scale-100"
                >
                  {isJoining ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                  )}
                </button>
              </form>
              
              {joinError && <p className="mt-4 text-red-500 text-xs font-bold">{joinError}</p>}
            </div>
          </section>

        </div>

        {/* Footer */}
        <footer className="mt-32 pt-8 border-t border-slate-50 flex items-center justify-between">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">© 2026 GDG on Campus</p>
          <div className="flex gap-6">
            <span className="text-[10px] text-slate-400 font-medium">Uçtan Uca Şifreleme Etkin</span>
            <span className="text-[10px] text-slate-400 font-medium">Gizlilik Odaklı</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
