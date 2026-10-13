import { useState, useEffect } from 'react';

interface Threat {
  name: string;
  date: number;
  type: string;
  count: number;
}

interface Device {
  id: string;
  name: string;
  status: 'protected' | 'warning' | 'critical';
  last_update: number;
  os: string;
  ip: string;
}

interface DeviceDetails {
  id: string;
  name: string;
  ip: string;
  os: string;
  last_seen_time: number;
  engine_version: string;
  current_user: string;
  last_bases_update: number;
  department: string;
  organization: string;
  city: string;
  parent_name: string;
  groups: string[];
  running_components: Array<{ name: string; user: string }>;
  bases_count: number;
  bases_total_viruses: number;
  created_time: number;
  description: string;
  threats: Threat[];
}

interface Summary {
  total_devices: number;
  protected: number;
  warnings: number;
  critical: number;
  threats_blocked_today: number;
}

export function DrWeb() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);
  const [deviceDetails, setDeviceDetails] = useState<Record<string, DeviceDetails>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        setDevices(data.devices);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных Dr.Web:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceClick = async (device: Device) => {
    if (expandedDevice === device.id) {
      setExpandedDevice(null);
      return;
    }

    setExpandedDevice(device.id);

    if (!deviceDetails[device.id]) {
      try {
        const response = await fetch(`/api/station/${device.id}`);
        if (response.ok) {
          const details = await response.json();
          setDeviceDetails(prev => ({ ...prev, [device.id]: details }));
        }
      } catch (error) {
        console.error('Ошибка загрузки деталей:', error);
      }
    }
  };

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'protected': return 'emerald';
      case 'warning': return 'amber';
      case 'critical': return 'red';
      default: return 'slate';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'protected': return 'Защищено';
      case 'warning': return 'Внимание';
      case 'critical': return 'Критично';
      default: return 'Неизвестно';
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'virus': return '🦠';
      case 'trojan': return '🐴';
      case 'worm': return '🪱';
      case 'adware': return '📢';
      case 'spyware': return '🕵️';
      case 'riskware': return '⚠️';
      default: return '🔴';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400 text-xl">Загрузка данных Dr.Web...</div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Dr.Web Security Space</h1>
        <p className="text-slate-400">Мониторинг антивирусной защиты и угроз</p>
      </div>

      {/* Статистика */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-400 text-sm font-semibold">Защищено</span>
              <span className="text-3xl">🛡️</span>
            </div>
            <div className="text-4xl font-bold text-emerald-400">{summary.protected}</div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 text-sm font-semibold">Требуют внимания</span>
              <span className="text-3xl">⚠️</span>
            </div>
            <div className="text-4xl font-bold text-amber-400">{summary.warnings}</div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400 text-sm font-semibold">Критические</span>
              <span className="text-3xl">🚨</span>
            </div>
            <div className="text-4xl font-bold text-red-400">{summary.critical}</div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400 text-sm font-semibold">Угроз заблокировано</span>
              <span className="text-3xl">⚡</span>
            </div>
            <div className="text-4xl font-bold text-purple-400">{summary.threats_blocked_today}</div>
          </div>
        </div>
      )}

      {/* Список устройств */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">Устройства ({devices.length})</h2>
        <div className="space-y-3">
          {devices.map((device) => {
            const details = deviceDetails[device.id];
            const threats = details?.threats || [];
            const color = getStatusColor(device.status);
            
            return (
              <div key={device.id} className="glass rounded-xl overflow-hidden">
                <div
                  onClick={() => handleDeviceClick(device)}
                  className="p-4 cursor-pointer hover:bg-slate-800/50 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full bg-${color}-500 animate-pulse`}></div>
                    <div>
                      <div className="font-semibold text-white text-lg">{device.name}</div>
                      <div className="text-sm text-slate-400">
                        {device.os} • {device.ip}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {threats.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                        <span className="text-red-400 text-sm font-semibold">
                          🔴 {threats.length} угроз
                        </span>
                      </div>
                    )}
                    <span className={`badge badge-${color === 'emerald' ? 'success' : color === 'amber' ? 'warning' : 'danger'}`}>
                      {getStatusText(device.status)}
                    </span>
                    <span className="text-slate-400 text-sm">
                      {formatTimestamp(device.last_update)}
                    </span>
                  </div>
                </div>

                {expandedDevice === device.id && details && (
                  <div className="p-6 bg-slate-900/50 border-t border-slate-700/50 animate-slide-down">
                    {/* Угрозы - самое важное */}
                    {threats.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                          <span>🚨</span> Обнаруженные угрозы ({threats.length})
                        </h3>
                        <div className="space-y-2">
                          {threats.map((threat, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{getThreatIcon(threat.type)}</span>
                                <div>
                                  <div className="font-semibold text-white">{threat.name}</div>
                                  <div className="text-sm text-slate-400">
                                    Тип: {threat.type} • Количество: {threat.count}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-slate-400">
                                {formatTimestamp(threat.date)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {threats.length === 0 && (
                      <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">✅</span>
                          <div>
                            <div className="font-semibold text-emerald-400">Угроз не обнаружено</div>
                            <div className="text-sm text-slate-400">Станция защищена</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Информация о станции */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="text-slate-400 text-sm mb-1">Пользователь</div>
                        <div className="text-white font-semibold">
                          {details.current_user || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm mb-1">Обновление баз</div>
                        <div className="text-white font-semibold">
                          {formatTimestamp(details.last_bases_update)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm mb-1">Версия движка</div>
                        <div className="text-white">
                          {details.engine_version || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm mb-1">Отдел</div>
                        <div className="text-white">
                          {details.department || '—'}
                        </div>
                      </div>
                    </div>

                    {/* Группы */}
                    {details.groups && details.groups.length > 0 && (
                      <div className="mb-6">
                        <div className="text-slate-400 text-sm mb-2">Группы</div>
                        <div className="flex flex-wrap gap-2">
                          {details.groups.map((group, idx) => (
                            <span key={idx} className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-sm rounded-lg border border-indigo-500/30">
                              {group}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Компоненты */}
                    {details.running_components && details.running_components.length > 0 && (
                      <div>
                        <div className="text-slate-400 text-sm mb-2">Запущенные компоненты</div>
                        <div className="space-y-1">
                          {details.running_components.slice(0, 5).map((comp, idx) => (
                            <div key={idx} className="text-sm text-white flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              {comp.name}
                              {comp.user && <span className="text-slate-400">({comp.user})</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
