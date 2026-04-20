import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createElection, getElectionByInviteCode } from '../api';
import { VALIDATION, ERROR_MESSAGES } from '../config';

/**
 * HomePage - Seçim Oluşturma & Davet Koduyla Katılma
 * 
 * İki aksiyon:
 * 1. Yeni seçim oluştur
 * 2. Davet koduyla mevcut seçime katıl
 */
export default function HomePage() {
  const navigate = useNavigate();

  // Seçim Oluşturma
  const [isCreatingElection, setIsCreatingElection] = useState(false);
  const [createError, setCreateError] = useState('');

  // Davet Koduyla Katılma
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Seçim Oluştur
  const handleCreateElection = async () => {
    setCreateError('');
    setIsCreatingElection(true);

    try {
      const result = await createElection({
        title: 'Yeni Seçim',
      });

      if (result.success && result.data) {
        navigate(`/election/${result.data.inviteCode}`);
      } else {
        setCreateError(result.error || ERROR_MESSAGES.SERVER_ERROR);
      }
    } catch (error) {
      setCreateError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setIsCreatingElection(false);
    }
  };

  // Davet Koduyla Katıl
  const handleJoinElection = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');

    if (!inviteCode.trim()) {
      setJoinError('Davet kodunu girin');
      return;
    }

    const cleanedCode = inviteCode.toUpperCase().trim();

    if (!VALIDATION.INVITE_CODE_REGEX.test(cleanedCode)) {
      setJoinError('Geçersiz davet kodu formatı');
      return;
    }

    setIsJoining(true);

    try {
      const result = await getElectionByInviteCode(cleanedCode);

      if (result.success && result.data) {
        navigate(`/election/${cleanedCode}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mb-6">
            <div 
              className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              role="img"
              aria-label="Seçim İkonu"
            >
              <span className="text-white text-3xl font-bold">🗳️</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Anonim Seçim
          </h1>
          <p className="text-gray-600 leading-relaxed text-lg">
            Fikirlerini özgürce ve kimliğin gizli kalarak paylaş.
          </p>
        </div>

        {/* Yeni Seçim Oluştur */}
        <div className="mb-8 pb-8 border-b border-gray-100">
          <button 
            onClick={handleCreateElection}
            disabled={isCreatingElection}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            {isCreatingElection ? (
              <div className="flex items-center justify-center">
                <div 
                  className="animate-spin rounded-full border-b-2 border-white mr-3"
                  style={{ width: '24px', height: '24px' }}
                ></div>
                Seçim Oluşturuluyor...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="text-xl mr-2">✨</span>
                Yeni Seçim Oluştur
              </div>
            )}
          </button>
          <p className="text-xs text-gray-500 text-center mt-3">
            Seçimi oluşturduğunuzda, davet kodu alır ve paylaşabilirsiniz
          </p>

          {createError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-4">
              <p className="text-red-700 text-sm text-center font-medium">{createError}</p>
            </div>
          )}
        </div>

        {/* Davet Koduyla Katıl */}
        <form onSubmit={handleJoinElection} className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider text-center">
            Veya Davet Koduyla Katıl
          </h2>

          <div className="flex gap-3">
            <input 
              type="text" 
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase());
                setJoinError('');
              }}
              placeholder="Davet Kodu (6 Hane)" 
              className="flex-1 border-2 border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center font-mono text-lg tracking-wider"
              maxLength={VALIDATION.INVITE_CODE_LENGTH}
              disabled={isJoining}
            />
            <button 
              type="submit"
              disabled={!inviteCode.trim() || isJoining}
              className="bg-gray-900 text-white font-medium py-4 px-6 rounded-2xl hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isJoining ? '...' : 'Katıl'}
            </button>
          </div>

          {joinError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-700 text-sm text-center font-medium">{joinError}</p>
            </div>
          )}
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Davet kodunu örgütleyiciden veya e-postadan alın
        </p>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <span>🔒</span>
            <span>Tüm oylar anonim ve güvenli</span>
          </div>
        </div>
      </div>
    </div>
  );
}
