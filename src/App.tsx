import { HashRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DrWeb } from './pages/DrWeb';
import { Bitrix24 } from './pages/Bitrix24';
import { Mail } from './pages/Mail';
import { Services } from './pages/Services';

function App() {
  return (
    <HashRouter>
      <div className="flex h-screen bg-cyber-black">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/drweb" element={<DrWeb />} />
            <Route path="/bitrix24" element={<Bitrix24 />} />
            <Route path="/mail" element={<Mail />} />
            <Route path="/services" element={<Services />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
