import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Zone1 from './zones/Zone1.jsx';
import Zone2 from './zones/Zone2.jsx';

const TITLES = {
  '/': 'DOPE – Interactieve prototypes',
  '/zone-1': 'Welke behoefte zie jij? · DOPE',
  '/zone-2': 'Volg het middel · DOPE prototype',
};

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = TITLES[pathname] || TITLES['/'];
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/zone-1" element={<Zone1 />} />
      <Route path="/zone-2" element={<Zone2 />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
