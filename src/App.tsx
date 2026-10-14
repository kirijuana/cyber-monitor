import { HashRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DrWeb } from './pages/DrWeb';
import { StationAnalysis } from './pages/StationAnalysis';

function App() {
  return (
    <HashRouter>
      <div className="flex h-screen bg-bg-primary">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/drweb" element={<DrWeb />} />
            <Route path="/station/:id" element={<StationAnalysis />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
