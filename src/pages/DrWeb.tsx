import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Device {
  id: string;
  name: string;
  status: 'protected' | 'warning' | 'critical';
  last_update: number;
  os: string;
  ip: string;
}

interface ServerInfo {
  hostname: string;
  version: string;
  uptime: number;
  os: string;
  platform: string;
  memory: {
    total: number;
    free: number;
    used_by_server: number;
  };
  filesystem: {
    total: number;
    free: number;
  };
}

interface Summary {
  total_devices: number;
  protected: number;
  warnings: number;
  critical: number;
  threats_blocked_today: number;
}

interface HipsEvent {
  id: string;
  station_name: string;
  time: number;
  user: string;
  type: string;
  action: string;
  process?: {
    path: string;
    description?: string;
  };
}

interface QuarantineObject {
  id: string;
  name: string;
  quarantine_time: number;
  restore_path: string;
  owner: string;
}

interface LicenseKey {
  id: string;
  serial: string;
  expires: number;
  clients_count: number;
  status: string;
}

interface RepositoryInfo {
  last_update: number;
  status: string;
  products?: Array<{ name: string; version: string }>;
}

type TabType = 'stations' | 'threats' | 'quarantine' | 'licenses' | 'repository';
type FilterType = 'all' | 'threats' | 'clean' | 'critical';

export function DrWeb() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [server, setServer] = useState<ServerInfo | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [threatsMap, setThreatsMap] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<FilterType>('all');
  const [activeTab, setActiveTab] = useState<TabType>('stations');
  const [loading, setLoading] = useState(true);
  const [loadingThreats, setLoadingThreats] = useState(true);
  
  // Новые данные для секций
  const [hipsEvents, setHipsEvents] = useState<HipsEvent[]>([]);
  const [quarantineObjects, setQuarantineObjects] = useState<QuarantineObject[]>([]);
  const [licenses, setLicenses] = useState<LicenseKey[]>([]);
  const [repository, setRepository] = useState<RepositoryInfo | null>(null);
  const [infectionsChart, setInfectionsChart] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (devices.length > 0) {
      fetchAllThreats();
    }
  }, [devices]);

  useEffect(() => {
    if (activeTab === 'threats') {
      fetchHipsEvents();
      fetchInfectionsChart();
    } else if (activeTab === 'quarantine') {
      fetchQuarantine();
    } else if (activeTab === 'licenses') {
      fetchLicenses();
    } else if (activeTab === 'repository') {
      fetchRepository();
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        setDevices(data.devices);
        if (data.server) {
          setServer(data.server);
        }
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

  const fetchHipsEvents = async () => {
    try {
      const response = await fetch('/api/hips-events?limit=50');
      if (response.ok) {
        const data = await response.json();
        setHipsEvents(data.data?.events || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки HIPS:', error);
    }
  };

  const fetchInfectionsChart = async () => {
    try {
      const response = await fetch('/api/infections-chart');
      if (response.ok) {
        const data = await response.json();
        setInfectionsChart(data.data?.chart || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки графика:', error);
    }
  };

  const fetchQuarantine = async () => {
    try {
      const response = await fetch('/api/quarantine');
      if (response.ok) {
        const data = await response.json();
        setQuarantineObjects(data.data?.objects || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки карантина:', error);
    }
  };

  const fetchLicenses = async () => {
    try {
      const response = await fetch('/api/licenses');
      if (response.ok) {
        const data = await response.json();
        setLicenses(data.data?.keys || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки лицензий:', error);
    }
  };

  const fetchRepository = async () => {
    try {
      const response = await fetch('/api/repository');
      if (response.ok) {
        const data = await response.json();
        setRepository(data.data || null);
      }
    } catch (error) {
      console.error('Ошибка загрузки репозитория:', error);
    }
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

  const formatUptime = (seconds: number) => {
    if (!seconds) return '—';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}д ${hours}ч`;
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  };

  const formatBytes = (mb: number) => {
    if (!mb) return '—';
    if (mb > 1024) return `${(mb / 1024).toFixed(1)} ГБ`;
    return `${mb.toFixed(0)} МБ`;
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

  const getLicenseWarning = (expires: number) => {
    const now = Math.floor(Date.now() / 1000);
    const daysLeft = Math.floor((expires - now) / 86400);
    
    if (daysLeft < 0) return { text: 'Истекла', color: 'text-red-400', bg: 'bg-red-500/20' };
    if (daysLeft <= 7) return { text: `${daysLeft}д`, color: 'text-red-400', bg: 'bg-red-500/20' };
    if (daysLeft <= 14) return { text: `${daysLeft}д`, color: 'text-amber-400', bg: 'bg-amber-500/20' };
    if (daysLeft <= 30) return { text: `${daysLeft}д`, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { text: `${daysLeft}д`, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
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

      {/* Информация о сервере */}
      {server && (
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Сервер Dr.Web</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-slate-400 text-sm mb-1">Имя хоста</div>
              <div className="text-white font-medium">{server.hostname}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">Версия</div>
              <div className="text-white font-medium">{server.version}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">Uptime</div>
              <div className="text-white font-medium">{formatUptime(server.uptime)}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">ОС</div>
              <div className="text-white font-medium">{server.os}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">Память (всего)</div>
              <div className="text-white font-medium">{formatBytes(server.memory?.total)}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">Память (свободно)</div>
              <div className="text-white font-medium">{formatBytes(server.memory?.free)}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">Диск (всего)</div>
              <div className="text-white font-medium">{formatBytes(server.filesystem?.total)}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">Диск (свободно)</div>
              <div className="text-white font-medium">{formatBytes(server.filesystem?.free)}</div>
            </div>
          </div>
        </div>
      )}

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

      {/* Вкладки */}
      <div className="card p-2 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('stations')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'stations'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🖥️ Станции
          </button>
          <button
            onClick={() => setActiveTab('threats')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'threats'
                ? 'bg-red-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🦠 Угрозы
          </button>
          <button
            onClick={() => setActiveTab('quarantine')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'quarantine'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🔒 Карантин
          </button>
          <button
            onClick={() => setActiveTab('licenses')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'licenses'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🔑 Лицензии
          </button>
          <button
            onClick={() => setActiveTab('repository')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'repository'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            📦 Репозиторий
          </button>
        </div>
      </div>

      {/* Контент вкладок */}
      {activeTab === 'stations' && (
        <div className="card p-6">
          {/* Фильтры */}
          <div className="flex flex-wrap gap-2 mb-6">
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

                      <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${colors.badge} ${colors.text}`}>
                        {getStatusText(device.status)}
                      </span>

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
      )}

      {activeTab === 'threats' && (
        <div className="space-y-6">
          {/* График угроз */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Динамика угроз</h2>
            {infectionsChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={infectionsChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-400">
                Нет данных для отображения
              </div>
            )}
          </div>

          {/* HIPS события */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-4">События Превентивной защиты (HIPS)</h2>
            {hipsEvents.length > 0 ? (
              <div className="space-y-3">
                {hipsEvents.map((event, idx) => (
                  <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-amber-400 text-xl">⚠️</span>
                        <div>
                          <div className="font-semibold text-white">{event.station_name}</div>
                          <div className="text-sm text-slate-400">{event.type} • {event.action}</div>
                        </div>
                      </div>
                      <div className="text-sm text-slate-400">{formatTimestamp(event.time)}</div>
                    </div>
                    {event.process && (
                      <div className="mt-2 p-3 bg-slate-900/50 rounded-lg">
                        <div className="text-sm text-slate-400 mb-1">Процесс:</div>
                        <div className="text-sm text-white font-mono">{event.process.path}</div>
                        {event.process.description && (
                          <div className="text-sm text-slate-400 mt-1">{event.process.description}</div>
                        )}
                      </div>
                    )}
                    <div className="mt-2 text-sm text-slate-400">
                      Пользователь: <span className="text-white">{event.user}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                Нет событий HIPS
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'quarantine' && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Объекты в карантине ({quarantineObjects.length})</h2>
          {quarantineObjects.length > 0 ? (
            <div className="space-y-3">
              {quarantineObjects.map((obj, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-purple-400 text-xl">🔒</span>
                      <div>
                        <div className="font-semibold text-white">{obj.name}</div>
                        <div className="text-sm text-slate-400">Владелец: {obj.owner}</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400">{formatTimestamp(obj.quarantine_time)}</div>
                  </div>
                  <div className="mt-2 p-3 bg-slate-900/50 rounded-lg">
                    <div className="text-sm text-slate-400 mb-1">Путь восстановления:</div>
                    <div className="text-sm text-white font-mono">{obj.restore_path}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Карантин пуст
            </div>
          )}
        </div>
      )}

      {activeTab === 'licenses' && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Лицензионные ключи ({licenses.length})</h2>
          {licenses.length > 0 ? (
            <div className="space-y-3">
              {licenses.map((license, idx) => {
                const warning = getLicenseWarning(license.expires);
                return (
                  <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-blue-400 text-xl">🔑</span>
                        <div>
                          <div className="font-semibold text-white font-mono">{license.serial}</div>
                          <div className="text-sm text-slate-400">Станций: {license.clients_count}</div>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg ${warning.bg} ${warning.color} font-bold`}>
                        {warning.text}
                      </div>
                    </div>
                    <div className="text-sm text-slate-400">
                      Истекает: <span className="text-white">{formatTimestamp(license.expires)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Нет лицензий
            </div>
          )}
        </div>
      )}

      {activeTab === 'repository' && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Репозиторий</h2>
          {repository ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">Последнее обновление</div>
                  <div className="text-white font-medium">{formatTimestamp(repository.last_update)}</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-1">Статус</div>
                  <div className={`font-medium ${
                    repository.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {repository.status === 'ok' ? '✅ Актуально' : '⚠️ Требуется обновление'}
                  </div>
                </div>
              </div>

              {repository.products && repository.products.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Продукты в репозитории</h3>
                  <div className="space-y-2">
                    {repository.products.map((product, idx) => (
                      <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 text-xl">📦</span>
                          <span className="text-white font-medium">{product.name}</span>
                        </div>
                        <span className="text-slate-400">{product.version}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Нет данных о репозитории
            </div>
          )}
        </div>
      )}
    </div>
  );
}
