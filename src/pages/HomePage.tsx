import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getElectionByInviteCode } from '../api';
import { VALIDATION, ERROR_MESSAGES } from '../config';

/**
 * HomePage - Premium GDG on Campus Ana Sayfası
 * 
 * Modern, Apple/Stripe estetikli tasarım
 * İki premium widget ile iki aksiyon:
 * 1. Yeni seçim oluştur
 * 2. Davet koduyla mevcut seçime katıl
 */
export default function HomePage() {
  const navigate = useNavigate();

  const [isCreatingElection, setIsCreatingElection] = useState(false);
  const [createError, setCreateError] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

const handleCreateElection = async () => {
    setCreateError('');
    setIsCreatingElection(true);

    // Navigate to create election form page
    setTimeout(() => {
      navigate('/create');
      setIsCreatingElection(false);
    }, 1000); // Brief loading delay for UX
  };

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
    // Ultra-minimal, pristine background
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      
      {/* Content Container */}
      <div className="w-full max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-slate-950 mb-4">
            GDG on Campus
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Kampüs topluluğunuzda fikirlerinizi anonim olarak paylaşın
          </p>
        </div>

        {/* Premium Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Card 1: Create Election - Premium Widget */}
          <div className="group relative bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300/50">
            
            {/* Icon Area */}
            <div className="w-full h-32 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 group-hover:border-slate-200 transition-colors">
              <div className="text-5xl">✨</div>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-semibold text-slate-950 mb-2">
              Seçim Oluştur
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Yeni bir seçim başlatın ve katılımcıları davet edin
            </p>

            {/* Button */}
            <button
              onClick={handleCreateElection}
              disabled={isCreatingElection}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-600/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isCreatingElection ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Oluşturuluyor...</span>
                </>
              ) : (
                <span>Seçim Oluştur</span>
              )}
            </button>

            {/* Error Message */}
            {createError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{createError}</p>
              </div>
            )}
          </div>

          {/* Card 2: Join Election - Premium Widget */}
          <div className="group relative bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300/50">
            
            {/* Icon Area */}
            <div className="w-full h-32 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 group-hover:border-slate-200 transition-colors">
              <div className="text-5xl">🔑</div>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-semibold text-slate-950 mb-2">
              Seçime Katıl
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Davet kodu ile mevcut seçime katılın
            </p>

            {/* Form */}
            <form onSubmit={handleJoinElection} className="space-y-3">
              {/* Input */}
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase());
                  setJoinError('');
                }}
                placeholder="Davet Kodu"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 font-mono text-center tracking-widest transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-400"
                maxLength={VALIDATION.INVITE_CODE_LENGTH}
                disabled={isJoining}
              />

              {/* Button */}
              <button
                type="submit"
                disabled={!inviteCode.trim() || isJoining}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                {isJoining ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Katılınıyor...</span>
                  </>
                ) : (
                  <span>Katıl</span>
                )}
              </button>
            </form>

            {/* Error Message */}
            {joinError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{joinError}</p>
              </div>
            )}
          </div>

        </div>

        {/* Footer Trust Signal */}
        <div className="text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
            <span>🔒</span>
            <span>Tüm veriler end-to-end şifreli ve tamamen anonim</span>
          </p>
        </div>

      </div>
    </div>
  );
}
