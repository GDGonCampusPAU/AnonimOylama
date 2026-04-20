import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getElectionByInviteCode,
  getCandidates,
  voteForCandidate,
  getElectionResults,
} from '../api';
import type {
  ElectionResponse,
  Candidate,
} from '../types';
import { ElectionStatus } from '../types';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  UI,
} from '../config';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * ElectionPage - Seçim Sayfası
 * 
 * AKIŞ:
 * 1. Davet koduyla seçimi yükle
 * 2. Adayları göster
 * 3. Kullanıcı bir adaya oy ver
 * 4. HTTP 403: Zaten oy vermiş hatası handle et
 * 5. Oylama kapalıysa sonuçları göster
 * 
 * STRICT ANONYMITY: 
 * - userId hiç kaydedilmez
 * - Adayın voteCount'ı artar
 * - Duplicate vote: 403 Forbidden
 */
export default function ElectionPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();

  // ========================================
  // STATE
  // ========================================
  const [election, setElection] = useState<ElectionResponse | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [alreadyVotedError, setAlreadyVotedError] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);

  // ========================================
  // LOAD ELECTION & CANDIDATES
  // ========================================
  useEffect(() => {
    const loadElection = async () => {
      if (!inviteCode) {
        setError(ERROR_MESSAGES.INVALID_INVITE_CODE);
        setLoading(false);
        return;
      }

      try {
        // Seçimi davet koduyla yükle
        const electionResult = await getElectionByInviteCode(inviteCode);

        if (!electionResult.success || !electionResult.data) {
          setError(electionResult.error || ERROR_MESSAGES.ELECTION_NOT_FOUND);
          setLoading(false);
          return;
        }

        const loadedElection = electionResult.data;

        // Seçim durumunu kontrol et
        if (loadedElection.status === ElectionStatus.DRAFT) {
          setError('Bu seçim henüz başlamadı.');
          setLoading(false);
          return;
        }

        if (loadedElection.status === ElectionStatus.COMPLETED) {
          setError(ERROR_MESSAGES.ELECTION_EXPIRED);
          setLoading(false);
          return;
        }

        setElection(loadedElection);

        // Adayları yükle
        const candidatesResult = await getCandidates(loadedElection.id);

        if (candidatesResult.success && candidatesResult.data) {
          setCandidates(candidatesResult.data);
        } else {
          console.warn('Adaylar yüklenemedi:', candidatesResult.error);
        }
      } catch (err) {
        setError(ERROR_MESSAGES.NETWORK_ERROR);
      } finally {
        setLoading(false);
      }
    };

    loadElection();
  }, [inviteCode]);

  // ========================================
  // HANDLER: OY VER
  // ========================================
  const handleVote = async (candidateId: string) => {
    if (!election) return;

    setIsVoting(true);
    setSelectedCandidateId(candidateId);
    setAlreadyVotedError(false);

    try {
      const result = await voteForCandidate(election.id, candidateId);

      if (result.success) {
        // Oy başarıyla kaydedildi
        setHasVoted(true);
        setVoteSuccess(true);

        // Sonuçları yükle
        const resultsResult = await getElectionResults(election.id);
        if (resultsResult.success && resultsResult.data) {
          setElection(resultsResult.data.election);
          setCandidates(resultsResult.data.candidates);
        }

        // Success toast gösterimi için 3 saniye sonra kapan
        setTimeout(() => setVoteSuccess(false), 3000);
      } else if (result.statusCode === HTTP_STATUS.FORBIDDEN) {
        // HTTP 403: Zaten oy vermiş
        setAlreadyVotedError(true);
        setHasVoted(true);
      } else {
        setError(result.error || ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } catch (err) {
      setError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setIsVoting(false);
      setSelectedCandidateId(null);
    }
  };

  // ========================================
  // RENDER: LOADING STATE
  // ========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full border-b-2 border-black mx-auto mb-4"
            style={{ width: '48px', height: '48px' }}
          ></div>
          <p className="text-gray-600">Seçim yükleniyor...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER: ERROR STATE
  // ========================================
  if (error || !election) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Hata</h1>
          <p className="text-gray-600 mb-6">{error || ERROR_MESSAGES.ELECTION_NOT_FOUND}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-all"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  const isElectionActive = election.status === ElectionStatus.ACTIVE;
  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

  // ========================================
  // RENDER: MAIN PAGE
  // ========================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========================================
          HEADER
          ======================================== */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">🗳️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{election.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">Davet Kodu:</span>
                <span
                  className="font-mono text-lg font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg"
                  title={`Davet kodunu paylaş: ${inviteCode}`}
                >
                  {inviteCode}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-xl hover:bg-gray-200 transition-all"
          >
            <span>←</span>
            Geri
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ========================================
            ELECTION INFO
            ======================================== */}
        {election.description && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <p className="text-gray-700 text-sm">{election.description}</p>
          </div>
        )}

        {/* ========================================
            VOTE SUCCESS MESSAGE
            ======================================== */}
        {voteSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 animate-pulse">
            <p className="text-green-700 text-center font-medium">
              ✓ {SUCCESS_MESSAGES.VOTE_SUBMITTED}
            </p>
          </div>
        )}

        {/* ========================================
            ALREADY VOTED ERROR
            ======================================== */}
        {alreadyVotedError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <p className="text-red-700 text-center font-medium">
              ⚠️ {ERROR_MESSAGES.ALREADY_VOTED}
            </p>
          </div>
        )}

        {/* ========================================
            CANDIDATES GRID (VOTING MODE)
            ======================================== */}
        {isElectionActive && !hasVoted && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Adaylara Oy Ver
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {candidates.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => handleVote(candidate.id)}
                  disabled={isVoting || alreadyVotedError}
                  className="text-left p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-900">
                        {candidate.name}
                      </h3>
                      {candidate.userId && (
                        <p className="text-xs text-gray-500 mt-1">
                          Kullanıcı adayı
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all ${
                        selectedCandidateId === candidate.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 group-hover:border-blue-400'
                      }`}
                    ></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================
            RESULTS (AFTER VOTING OR COMPLETED)
            ======================================== */}
        {(!isElectionActive || hasVoted) && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Seçim Sonuçları
            </h2>

            {/* Sonuç Tablosu */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Aday
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Oy Sayısı
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Yüzde
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ilerleme
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {candidates.map((candidate) => {
                    const percentage =
                      totalVotes > 0
                        ? ((candidate.voteCount / totalVotes) * 100).toFixed(1)
                        : '0';

                    return (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {candidate.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {candidate.voteCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {percentage}%
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage === '0' ? 0 : percentage}%`,
                              }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-4 text-center text-sm text-gray-600">
                <strong>Toplam Oy:</strong> {totalVotes}
              </div>
            </div>

            {/* Grafikler */}
            {totalVotes > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Çubuk Grafik */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    Çubuk Grafik
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={candidates.map((c) => ({
                        name:
                          c.name.length > 20
                            ? c.name.substring(0, 20) + '...'
                            : c.name,
                        votes: c.voteCount,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="votes" fill={UI.DEFAULT_COLORS.PRIMARY} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pasta Grafik */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    Dağılım
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={candidates.map((c) => ({
                          name:
                            c.name.length > 15
                              ? c.name.substring(0, 15) + '...'
                              : c.name,
                          value: c.voteCount,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => {
                          const total = candidates.reduce((s, c) => s + c.voteCount, 0);
                          const percent = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
                          return `${entry.name}: ${percent}%`;
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {candidates.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              UI.CHART_COLORS[index % UI.CHART_COLORS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => `${value} oy`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {totalVotes === 0 && (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <p className="text-gray-500 text-lg">Henüz oy verilmedi</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================
            STATUS BANNER
            ======================================== */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
            <span>
              {isElectionActive
                ? '🟢 Seçim Aktif'
                : '🔴 Seçim Kapalı'}
            </span>
            <span>•</span>
            <span>🔒 Tüm oylar anonim ve güvenli</span>
          </div>
        </div>
      </div>
    </div>
  );
}
