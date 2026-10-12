import { Header } from './components/Header';
import { StatsGrid } from './components/StatsGrid';
import { DeviceList } from './components/DeviceList';
import { ServiceList } from './components/ServiceList';
import { ConnectionStatus } from './components/ConnectionStatus';
import { useMonitorData } from './hooks/useMonitorData';

function App() {
  const { data, isConnected, lastUpdate, useMock } = useMonitorData();

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-white relative overflow-x-hidden">
      {/* Background effects */}
      <div className="bg-hex-pattern" />
      <div className="scan-line" />

      {/* Header */}
      <Header />

      {/* Stats Grid */}
      <StatsGrid summary={data.summary} />

      {/* Details Grid */}
      <section className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8 px-4 md:px-10 pb-6 md:pb-10">
        <div className="lg:col-span-3">
          <DeviceList devices={data.devices} />
        </div>
        <div className="lg:col-span-2">
          <ServiceList services={data.services} />
        </div>
      </section>

      {/* Footer info */}
      <footer className="relative z-10 px-4 md:px-10 pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs md:text-sm text-cyber-gray/60 border-t border-cyber-red/10 pt-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-cyber-red/50" />
            <span>Кибер Стратегия — Мониторинг инфраструктуры</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Dr.Web Security Space</span>
            <span className="text-cyber-red/40">|</span>
            <span>Обновление: каждые 10 сек</span>
          </div>
        </div>
      </footer>

      {/* Connection Status */}
      <ConnectionStatus
        isConnected={isConnected}
        useMock={useMock}
        lastUpdate={lastUpdate}
      />
    </div>
  );
}

export default App;
