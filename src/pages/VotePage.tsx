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
          // Zaten oy vermiş mi kontrolü
          const hasVoted = localStorage.getItem(`voted_${result.data.id}`);
          if (hasVoted) {
            setVoteSuccess(true);
          }
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
        localStorage.setItem(`voted_${election.id}`, 'true');
        setVoteSuccess(true);
      } else {
        if (result.statusCode === 403) {
          localStorage.setItem(`voted_${election.id}`, 'true');
          setVoteSuccess(true); // Zaten verdi diyorsa başarı ekranına atabiliriz
        } else {
          setVoteError(result.error || 'Bir hata oluştu.');
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
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Oda Hazırlanıyor</p>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 text-center transition-colors duration-500">
        <div className="max-w-xs">
          <h2 className="text-2xl font-light text-slate-900 mb-4">Erişim Hatası</h2>
          <p className="text-slate-400 text-sm mb-12">{error}</p>
          <button onClick={() => navigate('/')} className="text-indigo-600 font-bold uppercase text-[10px] tracking-widest">
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  if (voteSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 text-center transition-colors duration-500">
        <div className="max-w-xs">
          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 transition-colors border border-slate-100">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-light text-slate-900 mb-4">Teşekkürler</h2>
          <p className="text-slate-400 text-sm mb-12 leading-relaxed">
            Katılımınız için teşekkürler. Oyunuz anonim olarak kaydedildi.
          </p>
          <div className="flex flex-col gap-6">
            <button 
              onClick={() => navigate(`/election/${inviteCode}/results`)} 
              className="text-indigo-600 font-bold hover:tracking-widest transition-all uppercase text-[10px] tracking-widest"
            >
              Sonuçları Görüntüle →
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="text-slate-300 font-bold uppercase text-[10px] tracking-widest hover:text-slate-900 transition-colors"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20 px-8 transition-colors duration-500">
      <div className="max-w-2xl mx-auto">
        <header className="mb-20 text-center">
          <h1 className="text-3xl font-light text-slate-900 mb-2 tracking-tight">{election.title}</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Anonim Seçim Odası</p>
        </header>

        {voteError && (
          <div className="mb-12 text-center p-4 bg-red-50 text-red-500 text-xs font-bold uppercase tracking-widest animate-shake rounded-2xl">
            {voteError}
          </div>
        )}

        <div className="space-y-4">
          {election.candidates.map((candidate: Candidate) => (
            <button
              key={candidate.id}
              onClick={() => {
                setSelectedCandidateId(candidate.id);
                setVoteError(null);
              }}
              className={`
                w-full p-8 border text-left transition-all duration-300 group rounded-[2rem]
                ${selectedCandidateId === candidate.id 
                  ? 'border-indigo-600 bg-white' 
                  : 'border-slate-50 hover:border-slate-200 bg-transparent'}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-medium transition-colors ${selectedCandidateId === candidate.id ? 'text-indigo-600' : 'text-slate-900'}`}>
                    {candidate.name}
                  </h3>
                </div>
                {selectedCandidateId === candidate.id && (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-16">
          <button
            onClick={handleVoteSubmit}
            disabled={!selectedCandidateId || isVoting}
            className={`
              w-full py-6 font-bold text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all
              ${selectedCandidateId && !isVoting
                ? 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-100' 
                : 'bg-slate-50 text-slate-200 cursor-not-allowed'}
            `}
          >
            {isVoting ? 'Gönderiliyor' : 'Oyumu Onayla'}
          </button>
        </div>

        <footer className="mt-24 text-center">
          <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            Sistem uçtan uca şifrelenmiştir ve oylar hiçbir hesapla eşleştirilemez.
          </p>
        </footer>
      </div>
    </div>
  );
}
