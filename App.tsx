import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
// İleride odaların detay sayfası için RoomPage bileşeni oluşturacağız
// import RoomPage from './pages/RoomPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ana sayfa açıldığında HomePage bileşeni çalışacak */}
        <Route path="/" element={<HomePage />} />
        
        {/* İleride odaya katılma linki için şöyle bir yol ekleyeceğiz: */}
        {/* <Route path="/room/:roomId" element={<RoomPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}