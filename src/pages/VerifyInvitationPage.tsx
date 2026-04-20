import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function VerifyInvitationPage() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [securityCode, setSecurityCode] = useState('');
  const [error, setError] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Gelişmiş doğrulama simülasyonu
    if (securityCode.length >= 6) {
      navigate(`/vote/${inviteCode}`);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-200 mb-8 rotate-3">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Erişim Doğrulaması</h1>
          <p className="text-slate-500 text-lg font-medium">E-posta adresinize gönderilen 6 haneli kodu girin.</p>
        </div>

        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleVerify} className="space-y-10">
            <div className="relative">
              <label className="block text-center text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">
                Doğrulama Kodu
              </label>
              
              <input 
                type="text" 
                maxLength={8}
                value={securityCode}
                onChange={(e) => {
                  setSecurityCode(e.target.value.toUpperCase());
                  setError(false);
                }}
                placeholder="GDG-XXXX" 
                className="w-full text-center text-5xl font-black py-8 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-3xl transition-all tracking-[0.3em] uppercase text-indigo-600 placeholder:text-slate-200 outline-none shadow-inner"
              />
              
              {error && (
                <div className="absolute -bottom-12 left-0 right-0 text-center">
                  <p className="text-red-500 font-bold flex items-center justify-center gap-2 animate-shake">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    Geçersiz veya eksik kod!
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 text-xl active:scale-[0.98]"
              >
                Oylamaya Katıl
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-slate-400 font-medium text-sm">
            Kod ulaşmadı mı? <button type="button" className="text-indigo-600 font-bold hover:underline">Tekrar Gönder</button>
          </p>
        </div>
      </div>
    </div>
  );
}
