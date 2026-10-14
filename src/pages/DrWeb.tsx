import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ServerInfo {
  hostname: string;
  version: string;
  uptime: number;
  os: string;
  memory: { total: number; free: number };
  filesystem: { total: number; free: number };
}

interface Station {
  id: string;
  name: string;
  status: string;
  last_seen_time: number;
  os_name: string;
  ip: string;
  threats_count?: number;
}

type Tab = 'stations' | 'threats' | 'quarantine' | 'licenses' | 'repository';

export function DrWeb() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('stations');
  const [server, setServer] = useState<ServerInfo | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [threatsMap, setThreatsMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [serverRes, stationsRes] = await Promise.all([
        fetch('/api/server'),
        fetch('/api/stations')
      ]);

      if (serverRes.ok) {
        const data = await serverRes.json();
        setServer(data);
      }

      if (stationsRes.ok) {
        const data = await stationsRes.json();
        setStations(data.stations || []);
        
        // Загружаем угрозы для всех станций
        const threats: Record<string, number> = {};
        await Promise.all(
          (data.stations || []).map(async (station: Station) => {
            try {
              const res = await fetch(`/api/station/${station.id}`);
              if (res.ok) {
                const details = await res.json();
                threats[station.id] = details.threats?.length || 0;
              }
            } catch (e) {
              threats[station.id] = 0;
            }
          })
        );
        setThreatsMap(threats);
      }
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    if (!seconds) return '—';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}д ${hours}ч`;
    return `${hours}ч`;
  };

  const formatBytes = (mb: number) => {
    if (!mb) return '—';
    if (mb > 1024) return `${(mb / 1024).toFixed(1)} ГБ`;
    return `${mb.toFixed(0)} МБ`;
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '—';
    return new Date(timestamp * 1000).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-success';
      case 'with_update_errors': return 'text-warning';
      case 'offline': return 'text-danger';
      default: return 'text-text-muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Онлайн';
      case 'with_update_errors': return 'Ошибки';
      case 'offline': return 'Оффлайн';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-secondary">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Dr.Web</h1>
        <p className="text-text-secondary mt-1">Мониторинг антивирусной защиты</p>
      </div>

      {/* Server Info */}
      {server && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Сервер</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-text-muted text-sm">Имя</div>
              <div className="text-text-primary font-medium">{server.hostname}</div>
            </div>
            <div>
              <div className="text-text-muted text-sm">Версия</div>
              <div className="text-text-primary font-medium">{server.version}</div>
            </div>
            <div>
              <div className="text-text-muted text-sm">Uptime</div>
              <div className="text-text-primary font-medium">{formatUptime(server.uptime)}</div>
            </div>
            <div>
              <div className="text-text-muted text-sm">ОС</div>
              <div className="text-text-primary font-medium">{server.os}</div>
            </div>
            <div>
              <div className="text-text-muted text-sm">Память</div>
              <div className="text-text-primary font-medium">
                {formatBytes(server.memory?.free)} / {formatBytes(server.memory?.total)}
              </div>
            </div>
            <div>
              <div className="text-text-muted text-sm">Диск</div>
              <div className="text-text-primary font-medium">
                {formatBytes(server.filesystem?.free)} / {formatBytes(server.filesystem?.total)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {[
          { id: 'stations', label: 'Станции', icon: '🖥️' },
          { id: 'threats', label: 'Угрозы', icon: '🦠' },
          { id: 'quarantine', label: 'Карантин', icon: '🔒' },
          { id: 'licenses', label: 'Лицензии', icon: '🔑' },
          { id: 'repository', label: 'Репозиторий', icon: '📦' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-4 py-3 font-medium transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'stations' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">
            Станции ({stations.length})
          </h2>
          <div className="space-y-2">
            {stations.map((station) => {
              const threats = threatsMap[station.id] || 0;
              return (
                <div
                  key={station.id}
                  className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg hover:bg-bg-secondary transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`status-dot status-${station.status === 'online' ? 'online' : station.status === 'with_update_errors' ? 'warning' : 'offline'}`}></div>
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">{station.name}</div>
                      <div className="text-sm text-text-muted">
                        {station.os_name} • {station.ip} • {formatTime(station.last_seen_time)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {threats > 0 ? (
                      <span className="px-3 py-1 bg-danger/20 text-danger rounded-lg text-sm font-medium">
                        🦠 {threats}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-success/20 text-success rounded-lg text-sm">
                        ✅
                      </span>
                    )}
                    <span className={`text-sm font-medium ${getStatusColor(station.status)}`}>
                      {getStatusText(station.status)}
                    </span>
                    <button
                      onClick={() => navigate(`/station/${station.id}`)}
                      className="px-4 py-2 bg-accent hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
                    >
                      Анализ →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'threats' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Угрозы и события</h2>
          <div className="text-text-secondary text-center py-12">
            График инфекций и HIPS-события будут здесь
          </div>
        </div>
      )}

      {activeTab === 'quarantine' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Карантин</h2>
          <div className="text-text-secondary text-center py-12">
            Объекты в карантине будут здесь
          </div>
        </div>
      )}

      {activeTab === 'licenses' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Лицензии</h2>
          <div className="text-text-secondary text-center py-12">
            Лицензионные ключи будут здесь
          </div>
        </div>
      )}

      {activeTab === 'repository' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Репозиторий</h2>
          <div className="text-text-secondary text-center py-12">
            Статус репозитория будет здесь
          </div>
        </div>
      )}
    </div>
  );
}
