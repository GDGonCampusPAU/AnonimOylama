import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getElectionByInviteCode, voteForCandidate, getElectionResults } from '../api';
import type { Election, Candidate } from '../types';
import { ERROR_MESSAGES } from '../config';

/**
 * ElectionPage - Premium Seçim Sayfası
 * 
 * Apple/Stripe estetikli modern tasarım
 */
export default function ElectionPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();

  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState('');
  const [results, setResults] = useState<{ candidateId: string; votes: number }[]>([]);

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

  const handleVote = async (candidateId: string) => {
    if (!election) return;

    setVoting(true);
    setVoteError('');

    try {
      const result = await voteForCandidate(election.id, candidateId);
      if (result.success) {
        setHasVoted(true);
        // Sonuçları yükle
        const resultsResult = await getElectionResults(election.id);
        if (resultsResult.success && resultsResult.data) {
          const mappedResults = resultsResult.data.candidates.map(c => ({
            candidateId: c.id,
            votes: c.voteCount
          }));
          setResults(mappedResults);
        }
      } else {
        setVoteError(result.error || ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } catch (err) {
      setVoteError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold text-slate-950 mb-4">Hata</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-xl transition-all duration-200"
          >
            Ana Sayfa
          </button>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-2xl font-semibold text-slate-950 mb-4">Seçim Bulunamadı</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-xl transition-all duration-200"
          >
            Ana Sayfa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 mb-8">
          <h1 className="text-3xl font-semibold text-slate-950 text-center mb-2">
            {election.title}
          </h1>
          <p className="text-slate-600 text-center">
            GDG on Campus - Anonim Oylama
          </p>
        </div>

        {/* Voting Section */}
        {!hasVoted && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-950 text-center mb-6">
              Oy Verin
            </h2>
            <div className="space-y-3">
              {election.candidates.map((candidate: Candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => handleVote(candidate.id)}
                  disabled={voting}
                  className="w-full text-left bg-white border border-slate-200 rounded-2xl p-4 transition-all duration-200 hover:border-indigo-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="font-medium text-slate-950 group-hover:text-indigo-600 transition-colors">
                    {candidate.name}
                  </div>
                </button>
              ))}
            </div>
            {voteError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium text-center">{voteError}</p>
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {hasVoted && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
            <h2 className="text-xl font-semibold text-slate-950 text-center mb-6">
              Sonuçlar
            </h2>
            <div className="space-y-3">
              {results.map((result) => {
                const candidate = election.candidates.find(c => c.id === result.candidateId);
                return (
                  <div key={result.candidateId} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="font-medium text-slate-950">
                      {candidate?.name || 'Bilinmeyen'}
                    </div>
                    <div className="bg-indigo-600 text-white font-semibold px-3 py-1 rounded-full text-sm">
                      {result.votes} oy
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors duration-200"
          >
            ← Ana Sayfa
          </button>
        </div>

      </div>
    </div>
  );
}
