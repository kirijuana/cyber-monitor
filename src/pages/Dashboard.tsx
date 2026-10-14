import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ServerInfo {
  hostname: string;
  version: string;
  uptime: number;
  stations_summary: {
    total: number;
    online: number;
    offline: number;
    with_update_errors: number;
  };
  last_update: string;
}

interface ServerStats {
  data?: {
    viruses?: Record<string, number>;
  };
}

export function Dashboard() {
  const navigate = useNavigate();
  const [server, setServer] = useState<ServerInfo | null>(null);
  const [stats, setStats] = useState<ServerStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [serverRes, statsRes] = await Promise.all([
        fetch('/api/server'),
        fetch('/api/server-statistics')
      ]);

      if (serverRes.ok) {
        const data = await serverRes.json();
        setServer(data);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
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

  const topViruses = stats.data?.viruses ? Object.entries(stats.data.viruses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) : [];

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
        <h1 className="text-3xl font-bold text-text-primary">Главный дашборд</h1>
        <p className="text-text-secondary mt-1">Обзор всех систем мониторинга</p>
      </div>

      {/* Dr.Web Card */}
      {server && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛡️</span>
              <div>
                <h2 className="text-xl font-bold text-text-primary">Dr.Web Security Space</h2>
                <p className="text-sm text-text-muted">{server.hostname} • v{server.version}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/drweb')}
              className="px-4 py-2 bg-accent hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
            >
              Подробнее →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-bg-tertiary rounded-lg p-4">
              <div className="text-text-muted text-sm mb-1">Всего станций</div>
              <div className="text-2xl font-bold text-text-primary">{server.stations_summary.total}</div>
            </div>
            <div className="bg-bg-tertiary rounded-lg p-4">
              <div className="text-text-muted text-sm mb-1">Онлайн</div>
              <div className="text-2xl font-bold text-success">{server.stations_summary.online}</div>
            </div>
            <div className="bg-bg-tertiary rounded-lg p-4">
              <div className="text-text-muted text-sm mb-1">Оффлайн</div>
              <div className="text-2xl font-bold text-danger">{server.stations_summary.offline}</div>
            </div>
            <div className="bg-bg-tertiary rounded-lg p-4">
              <div className="text-text-muted text-sm mb-1">Uptime сервера</div>
              <div className="text-2xl font-bold text-text-primary">{formatUptime(server.uptime)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Viruses */}
      {topViruses.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">Топ угроз</h2>
          <div className="space-y-2">
            {topViruses.map(([name, count], idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-danger font-bold">#{idx + 1}</span>
                  <span className="text-text-primary">{name}</span>
                </div>
                <span className="text-danger font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
