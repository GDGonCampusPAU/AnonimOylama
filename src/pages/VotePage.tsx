import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getElectionByInviteCode, voteForCandidate } from '../api';
import type { Election, Candidate } from '../types';
import { ERROR_MESSAGES } from '../config';

export default function VotePage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();

  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  useEffect(() => {
    const loadElection = async () => {
      if (!inviteCode) return;
      try {
        const result = await getElectionByInviteCode(inviteCode);
        if (result.success && result.data) {
          setElection(result.data);
        } else {
          setError(result.error || ERROR_MESSAGES.ELECTION_NOT_FOUND);
        }
      } catch (err) {
        setError(ERROR_MESSAGES.NETWORK_ERROR);
      } finally {
        setLoading(false);
      }
    };
    loadElection();
  }, [inviteCode]);

  const handleVoteSubmit = async () => {
    if (!election || !selectedCandidateId) return;

    setIsVoting(true);
    setVoteError(null);

    try {
      const result = await voteForCandidate(election.id, selectedCandidateId);
      
      if (result.success) {
        setVoteSuccess(true);
      } else {
        // HTTP 403 (Duplicate Vote) durumunu yakala
        if (result.statusCode === 403) {
          setVoteError('Zaten Oy Kullandınız: Bu seçimde yalnızca bir kez oy kullanma hakkınız bulunmaktadır. Güvenliğiniz için tüm oylar anonimdir.');
        } else {
          setVoteError(result.error || 'Oylama sırasında bir hata oluştu.');
        }
      }
    } catch (err) {
      setVoteError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold animate-pulse">Sandıklar Hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100">
          <div className="text-5xl mb-6">🚫</div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">Seçim Bulunamadı</h2>
          <p className="text-slate-500 mb-8 font-medium">{error || 'Geçersiz davet kodu veya süresi dolmuş seçim.'}</p>
          <button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all">
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  if (voteSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-slate-100">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Oyunuz Kaydedildi</h2>
          <p className="text-slate-500 mb-10 font-medium">
            Katılımınız için teşekkürler. Oyunuz uçtan uca şifrelenmiş ve anonim olarak sisteme işlenmiştir.
          </p>
          <button onClick={() => navigate('/')} className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Tamam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Seçim Başlığı ve Geri Butonu */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-900 leading-tight">{election.title}</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Anonim Oylama</p>
          </div>
          <div className="w-12"></div> {/* Dengeleme için */}
        </div>

        {/* Hata Bildirimi (403 vb.) */}
        {voteError && (
          <div className="mb-8 bg-red-50 border border-red-100 p-6 rounded-[2rem] flex items-start gap-4 animate-shake">
            <div className="bg-red-500 text-white p-2 rounded-xl shrink-0 mt-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-red-900">Erişim Engellendi</h3>
              <p className="text-red-700/80 font-medium text-sm mt-1">{voteError}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 p-10 border border-slate-100">
          <p className="text-slate-500 mb-10 text-center font-medium leading-relaxed italic">
            "Lütfen desteklediğiniz adayı seçin. Seçiminiz onaylandıktan sonra değiştirilemez."
          </p>

          <div className="grid gap-4">
            {election.candidates.map((candidate: Candidate) => (
              <button
                key={candidate.id}
                onClick={() => {
                  setSelectedCandidateId(candidate.id);
                  setVoteError(null);
                }}
                className={`
                  relative w-full p-6 rounded-[2rem] border-2 transition-all duration-300 text-left flex items-center justify-between group
                  ${selectedCandidateId === candidate.id 
                    ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100/50 scale-[1.02]' 
                    : 'border-slate-50 bg-slate-50 hover:border-slate-200 hover:bg-white'}
                `}
              >
                <div className="flex items-center gap-5">
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                    ${selectedCandidateId === candidate.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 group-hover:bg-slate-100'}
                  `}>
                    <span className="font-black text-lg">{candidate.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg transition-colors ${selectedCandidateId === candidate.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {candidate.name}
                    </h3>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Altıncı Aday</p>
                  </div>
                </div>
                
                {selectedCandidateId === candidate.id && (
                  <div className="bg-indigo-600 rounded-full p-1 text-white shadow-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-12">
            <button
              onClick={handleVoteSubmit}
              disabled={!selectedCandidateId || isVoting}
              className={`
                w-full py-6 rounded-2xl font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-3
                ${selectedCandidateId && !isVoting
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 active:scale-[0.98]' 
                  : 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed'}
              `}
            >
              {isVoting ? (
                <>
                  <div className="w-6 h-6 border-3 border-indigo-200 border-t-white rounded-full animate-spin"></div>
                  Oyunuz İletiliyor...
                </>
              ) : (
                'Oyunu Onayla'
              )}
            </button>
          </div>
        </div>

        <p className="text-center mt-10 text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 4.925-3.467 9.043-8 9.944-4.533-.9-8-5.019-8-9.944 0-.681.056-1.35.166-2.001zm8 1.455a1 1 0 00-1 1v4a1 1 0 102 0v-4a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          Sistem uçtan uca şifrelenmiştir ve oylar hiçbir hesapla eşleştirilemez.
        </p>
      </div>
    </div>
  );
}
