import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateElectionPage() {
  const navigate = useNavigate();
  const [voterEmails, setVoterEmails] = useState<string[]>(['']);
  const [candidates, setCandidates] = useState<string[]>(['', '']);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const mockCodes = voterEmails.map(() => `${Math.floor(1000 + Math.random() * 9000)}`);
    const lastCode = mockCodes[mockCodes.length - 1];
    
    console.group('🛠️ DEVELOPMENT MODE: Seçim Doğrulama Kodları');
    voterEmails.forEach((email, index) => {
      console.log(`📧 Alıcı: ${email} | 🔢 Doğrulama Kodu: ${mockCodes[index]} | 🔗 Oda: TEST-INVITE`);
    });
    console.groupEnd();

    localStorage.setItem('last_dev_code', lastCode);

    setTimeout(() => {
      setSuccess(true);
      setIsSubmitting(false);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 transition-colors duration-500">
        <div className="max-w-md w-full text-center">
          <h2 className="text-3xl font-light text-slate-900 mb-4">Seçim Odası Hazır</h2>
          <p className="text-slate-400 font-medium mb-12 leading-relaxed">
            Katılımcıların e-posta adreslerine doğrulama kodları gönderildi.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="text-indigo-600 font-bold hover:tracking-widest transition-all uppercase text-xs tracking-wider"
          >
            Ana Sayfaya Dön →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20 px-8 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        <header className="mb-20">
          <button onClick={() => navigate(-1)} className="text-slate-300 hover:text-slate-900 transition-colors mb-8 flex items-center gap-2 group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="text-xs font-bold uppercase tracking-widest">Geri</span>
          </button>
          <h1 className="text-4xl font-light text-slate-900">Seçim Detayları</h1>
          <p className="text-slate-400 font-medium mt-2">Yeni bir oylama odası kurun.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-24">
          {/* Sol Kolon: Bilgiler */}
          <div className="space-y-12">
            <section>
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 block">Genel Bilgiler</label>
              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="Seçim Başlığı"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-b border-slate-100 bg-transparent py-3 text-xl font-medium focus:border-indigo-500 text-slate-900 outline-none transition-colors placeholder-slate-200"
                  required
                />
                <textarea
                  placeholder="Açıklama (Opsiyonel)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border-b border-slate-100 bg-transparent py-3 text-sm focus:border-indigo-500 text-slate-900 outline-none transition-colors placeholder-slate-200 min-h-[100px] resize-none"
                />
              </div>
            </section>

            <section>
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 block">Adaylar</label>
              <div className="space-y-3">
                {candidates.map((candidate, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={candidate}
                    onChange={(e) => {
                      const newCands = [...candidates];
                      newCands[idx] = e.target.value;
                      setCandidates(newCands);
                    }}
                    placeholder={`Aday ${idx + 1}`}
                    className="w-full border-b border-slate-100 bg-transparent py-2 text-sm focus:border-indigo-500 text-slate-900 outline-none transition-colors placeholder-slate-200"
                    required
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setCandidates([...candidates, ''])}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-600 transition-colors mt-2"
                >
                  + Aday Ekle
                </button>
              </div>
            </section>
          </div>

          {/* Sağ Kolon: Seçmen Listesi */}
          <div className="flex flex-col h-full">
            <section className="flex-1">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 block">Seçmen Listesi</label>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                {voterEmails.map((email, idx) => (
                  <input
                    key={idx}
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newEmails = [...voterEmails];
                      newEmails[idx] = e.target.value;
                      setVoterEmails(newEmails);
                    }}
                    placeholder={`ornek@universite.edu.tr`}
                    className="w-full border-b border-slate-100 bg-transparent py-2 text-sm focus:border-indigo-500 text-slate-900 outline-none transition-colors placeholder-slate-200"
                    required
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setVoterEmails([...voterEmails, ''])}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-600 transition-colors mt-4"
              >
                + Seçmen Ekle
              </button>
            </section>

            <div className="mt-12">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-black transition-all disabled:bg-slate-200 disabled:text-slate-400 text-sm tracking-widest uppercase shadow-xl shadow-slate-200/50"
              >
                {isSubmitting ? 'Oluşturuluyor...' : 'Seçimi Başlat'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
