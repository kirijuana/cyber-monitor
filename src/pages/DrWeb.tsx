import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Device {
  id: string;
  name: string;
  status: 'protected' | 'warning' | 'critical';
  last_update: number;
  os: string;
  ip: string;
}

interface Summary {
  total_devices: number;
  protected: number;
  warnings: number;
  critical: number;
  threats_blocked_today: number;
}

type FilterType = 'all' | 'threats' | 'clean' | 'critical';

export function DrWeb() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [threatsMap, setThreatsMap] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [loadingThreats, setLoadingThreats] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (devices.length > 0) {
      fetchAllThreats();
    }
  }, [devices]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        setDevices(data.devices);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllThreats = async () => {
    setLoadingThreats(true);
    const newThreatsMap: Record<string, number> = {};
    
    // Загружаем угрозы для всех устройств параллельно
    const promises = devices.map(async (device) => {
      try {
        const response = await fetch(`/api/station/${device.id}`);
        if (response.ok) {
          const details = await response.json();
          newThreatsMap[device.id] = details.threats?.length || 0;
        }
      } catch (error) {
        newThreatsMap[device.id] = 0;
      }
    });

    await Promise.all(promises);
    setThreatsMap(newThreatsMap);
    setLoadingThreats(false);
  };

  const filteredDevices = devices.filter((device) => {
    const threats = threatsMap[device.id] || 0;
    switch (filter) {
      case 'threats': return threats > 0;
      case 'clean': return threats === 0;
      case 'critical': return device.status === 'critical';
      default: return true;
    }
  });

  const devicesWithThreats = Object.values(threatsMap).filter(t => t > 0).length;
  const devicesClean = Object.values(threatsMap).filter(t => t === 0).length;

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'protected': return { bg: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/20 border-emerald-500/30' };
      case 'warning': return { bg: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/20 border-amber-500/30' };
      case 'critical': return { bg: 'bg-red-500', text: 'text-red-400', badge: 'bg-red-500/20 border-red-500/30' };
      default: return { bg: 'bg-slate-500', text: 'text-slate-400', badge: 'bg-slate-500/20 border-slate-500/30' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'protected': return 'Защищено';
      case 'warning': return 'Внимание';
      case 'critical': return 'Критично';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400 text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Dr.Web</h1>
        <p className="text-slate-400">Мониторинг антивирусной защиты</p>
      </div>

      {/* Статистика */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-400 text-sm font-medium">Защищено</span>
              <span className="text-2xl">🛡️</span>
            </div>
            <div className="text-3xl font-bold text-emerald-400">{summary.protected}</div>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 text-sm font-medium">Внимание</span>
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="text-3xl font-bold text-amber-400">{summary.warnings}</div>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400 text-sm font-medium">Критично</span>
              <span className="text-2xl">🚨</span>
            </div>
            <div className="text-3xl font-bold text-red-400">{summary.critical}</div>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400 text-sm font-medium">С угрозами</span>
              <span className="text-2xl">🦠</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">
              {loadingThreats ? '...' : devicesWithThreats}
            </div>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Все ({devices.length})
          </button>
          <button
            onClick={() => setFilter('threats')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'threats'
                ? 'bg-red-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🔴 С угрозами ({loadingThreats ? '...' : devicesWithThreats})
          </button>
          <button
            onClick={() => setFilter('clean')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'clean'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            ✅ Без угроз ({loadingThreats ? '...' : devicesClean})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'critical'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            ⚠️ Критические ({devices.filter(d => d.status === 'critical').length})
          </button>
        </div>
      </div>

      {/* Список станций */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Станции ({filteredDevices.length})
          </h2>
          {loadingThreats && (
            <span className="text-slate-400 text-sm">Загрузка данных об угрозах...</span>
          )}
        </div>

        <div className="space-y-3">
          {filteredDevices.map((device) => {
            const threats = threatsMap[device.id] || 0;
            const colors = getStatusColor(device.status);

            return (
              <div
                key={device.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${colors.bg}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">{device.name}</div>
                      <div className="text-sm text-slate-400 mt-0.5">
                        {device.os} • {device.ip} • {formatTimestamp(device.last_update)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    {/* Счётчик угроз */}
                    {threats > 0 ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <span className="text-red-400 font-bold text-sm">
                          🦠 {threats} {threats === 1 ? 'угроза' : 'угроз'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <span className="text-emerald-400 text-sm">✅ Чисто</span>
                      </div>
                    )}

                    {/* Статус */}
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${colors.badge} ${colors.text}`}>
                      {getStatusText(device.status)}
                    </span>

                    {/* Кнопка анализа */}
                    <button
                      onClick={() => navigate(`/station/${device.id}`)}
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/30"
                    >
                      Анализ →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
