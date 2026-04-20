import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ElectionPage from './pages/ElectionPage';
import VotePage from './pages/VotePage';
import ResultsPage from './pages/ResultsPage';
import CreateElectionPage from './pages/CreateElectionPage';
import VerifyInvitationPage from './pages/VerifyInvitationPage';
import DevHelper from './components/DevHelper';
import { ROUTES } from './config';

/**
 * Ana uygulama routing yapısı
 */
export default function App() {
  return (
    <BrowserRouter>
      <DevHelper />

      <Routes>
        {/* Ana Sayfa - Seçim Oluşturma & Davet Koduyla Katılma */}
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path="/create" element={<CreateElectionPage />} />
        
        {/* Doğrulama, Oylama ve Sonuç Rotaları */}
        <Route path="/verify/:inviteCode" element={<VerifyInvitationPage />} />
        <Route path="/vote/:inviteCode" element={<VotePage />} />
        <Route path="/election/:inviteCode" element={<ElectionPage />} />
        <Route path="/election/:inviteCode/results" element={<ResultsPage />} />

        {/* Wildcard - Bulunamayan sayfalar ana sayfaya yönlendir */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
}