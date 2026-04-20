import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ElectionPage from './pages/ElectionPage';
import { ROUTES } from './config';

/**
 * Ana uygulama routing yapısı
 * 
 * ROUTES:
 * - "/" : Ana sayfa (seçim oluştur/katıl)
 * - "/election/:inviteCode" : Seçim sayfası (anonim oylama)
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ana Sayfa - Seçim Oluşturma & Davet Koduyla Katılma */}
        <Route path={ROUTES.HOME} element={<HomePage />} />

        {/* Seçim Sayfası - Davet Koduyla Erişim */}
        <Route 
          path="/election/:inviteCode" 
          element={<ElectionPage />} 
        />

        {/* Wildcard - Bulunamayan sayfalar ana sayfaya yönlendir */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
}