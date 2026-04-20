import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CONFIG = {
  MIN_CANDIDATES: 2,
  MAX_CANDIDATES: 10,
  MAX_VOTERS: 50,
};

export default function CreateElectionPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [candidates, setCandidates] = useState(['', '']);
  const [voterEmails, setVoterEmails] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddEmail = () => {
    if (voterEmails.length < CONFIG.MAX_VOTERS) setVoterEmails([...voterEmails, '']);
  };

  const handleCandidateChange = (index: number, value: string) => {
    const newCandidates = [...candidates];
    newCandidates[index] = value;
    setCandidates(newCandidates);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...voterEmails];
    newEmails[index] = value;
    setVoterEmails(newEmails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock API simülasyonu
    setTimeout(() => {
      setSuccess(true);
      setIsSubmitting(false);
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-12 text-center border border-slate-100">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl">
            ✨
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Seçim Başlatıldı!</h2>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">
            Seçmen listesindeki <b>{voterEmails.length}</b> kişiye özel erişim kodları e-posta ile gönderildi. 
            Sistem artık oyları kabul etmeye hazır.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
          >
            Ana Panele Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-3">Yeni Seçim Oluştur</h1>
          <p className="text-slate-500 text-lg font-medium">Güvenli, anonim ve tamamen kapalı devre oylama sistemi.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Ana Bilgiler Kartı */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-10 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center">
              <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mr-3 text-sm">1</span>
              Genel Bilgiler
            </h2>
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Seçim Başlığı</label>
                <input 
                  type="text" required placeholder="Örn: GDG on Campus Temsilci Seçimi" 
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all text-lg font-semibold text-slate-900 outline-none"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Açıklama ve Kurallar</label>
                <textarea 
                  required
                  placeholder="Seçmenlerin bilmesi gereken detayları buraya yazın..." 
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all min-h-[120px] text-slate-700 outline-none"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Adaylar ve Seçmenler Yan Yana */}
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Aday Listesi */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-10 border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center">
                <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mr-3 text-sm">2</span>
                Adaylar
              </h2>
              <div className="space-y-4">
                {candidates.map((c, i) => (
                  <div key={i} className="relative group">
                    <input 
                      required 
                      placeholder={`Aday ${i+1}`} 
                      value={c}
                      onChange={(e) => handleCandidateChange(i, e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl transition-all font-medium text-slate-900 outline-none" 
                    />
                  </div>
                ))}
                
                {candidates.length < CONFIG.MAX_CANDIDATES && (
                  <button 
                    type="button" 
                    onClick={() => setCandidates([...candidates, ''])} 
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                  >
                    <span>+</span> Aday Ekle
                  </button>
                )}
              </div>
            </div>

            {/* Seçmen Listesi */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-10 border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center">
                <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mr-3 text-sm">3</span>
                Seçmen Listesi
              </h2>
              <div className="space-y-4">
                {voterEmails.map((email, i) => (
                  <input 
                    key={i} type="email" required placeholder="seçmen@email.com" 
                    value={email}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl transition-all font-medium text-slate-900 outline-none"
                    onChange={(e) => handleEmailChange(i, e.target.value)}
                  />
                ))}
                
                {voterEmails.length < CONFIG.MAX_VOTERS && (
                  <button 
                    type="button" 
                    onClick={handleAddEmail} 
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                  >
                    <span>+</span> Seçmen Ekle
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Aksiyonları */}
          <div className="flex flex-col items-center pt-6">
            <button 
              type="submit" disabled={isSubmitting}
              className="w-full max-w-md bg-indigo-600 text-white font-black py-6 rounded-3xl hover:bg-indigo-700 disabled:bg-slate-200 transition-all shadow-2xl shadow-indigo-200/50 text-xl active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Yükleniyor...
                </span>
              ) : 'Seçimi Başlat ve E-postaları Gönder'}
            </button>
            <p className="mt-6 text-slate-400 font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              Tüm veriler uçtan uca şifrelenir ve anonim kalır.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
