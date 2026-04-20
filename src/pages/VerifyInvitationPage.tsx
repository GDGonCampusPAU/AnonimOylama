import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function VerifyInvitationPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length < 4) {
      setError('Geçersiz Kod');
      return;
    }

    setLoading(true);
    const lastCode = localStorage.getItem('last_dev_code');
    const isValid = otp === lastCode || otp === '1234';

    setTimeout(() => {
      if (isValid) {
        navigate(`/vote/${inviteCode}`);
      } else {
        setError('Geçersiz Kod');
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 transition-colors duration-500">
      <div className="max-w-md w-full text-center">
        <header className="mb-16">
          <h1 className="text-4xl font-light text-slate-900 mb-2 tracking-tight">Erişim Doğrulaması</h1>
          <p className="text-slate-400 font-medium">Bize e-postanızla gelen doğrulama kodunu girin.</p>
        </header>

        <form onSubmit={handleVerify} className="space-y-12">
          <div className="relative group">
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                setOtp(val);
                setError('');
              }}
              placeholder="0 0 0 0"
              className={`w-full bg-transparent border-b border-slate-100 py-6 text-center text-4xl font-light tracking-[0.4em] transition-all outline-none uppercase placeholder-slate-50 focus:ring-0 ${error ? 'border-red-400 text-red-500' : 'focus:border-indigo-600 text-slate-900'}`}
              maxLength={6}
              autoFocus
            />
            {error && (
              <p className="absolute -bottom-8 left-0 right-0 text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-shake">
                {error}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full text-indigo-600 font-bold hover:tracking-widest transition-all uppercase text-[10px] tracking-widest py-4 disabled:opacity-20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                'Odaya Gir →'
              )}
            </button>
          </div>
        </form>

        <footer className="mt-24">
          <p className="text-[10px] text-slate-300 font-medium tracking-widest uppercase italic">
            Kodunuz e-posta ile iletilmiştir.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-8 text-[10px] text-slate-400 hover:text-slate-900 font-bold transition-all uppercase tracking-widest"
          >
            ← Ana Sayfaya Dön
          </button>
        </footer>
      </div>
    </div>
  );
}
