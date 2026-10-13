import { useState, useEffect } from 'react';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-cyber-gray text-xl">Загрузка данных Dr.Web...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-cyber-white">Dr.Web Security Space</h1>
        <p className="text-cyber-gray">Мониторинг антивирусной защиты</p>
      </div>

      {/* Статистика */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-cyber-black/50 border border-green-500/30 rounded-xl p-6">
            <div className="text-green-400 text-sm font-semibold mb-2">Защищено</div>
            <div className="text-4xl font-bold text-green-400">{summary.protected}</div>
          </div>
          <div className="bg-cyber-black/50 border border-yellow-500/30 rounded-xl p-6">
            <div className="text-yellow-400 text-sm font-semibold mb-2">Требуют внимания</div>
            <div className="text-4xl font-bold text-yellow-400">{summary.warnings}</div>
          </div>
          <div className="bg-cyber-black/50 border border-red-500/30 rounded-xl p-6">
            <div className="text-red-400 text-sm font-semibold mb-2">Критические</div>
            <div className="text-4xl font-bold text-red-400">{summary.critical}</div>
          </div>
          <div className="bg-cyber-black/50 border border-purple-500/30 rounded-xl p-6">
            <div className="text-purple-400 text-sm font-semibold mb-2">Угроз заблокировано</div>
            <div className="text-4xl font-bold text-purple-400">{summary.threats_blocked_today}</div>
          </div>
        </div>
      )}

      {/* Список устройств */}
      <div className="bg-cyber-black/50 border border-cyber-red/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-cyber-white">Устройства ({devices.length})</h2>
        <div className="space-y-3">
          {devices.map((device) => (
            <div key={device.id} className="border border-cyber-red/10 rounded-lg overflow-hidden">
              <div
                onClick={() => handleDeviceClick(device)}
                className="p-4 cursor-pointer hover:bg-cyber-black/30 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    device.status === 'protected' ? 'bg-green-500' :
                    device.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-semibold text-cyber-white">{device.name}</div>
                    <div className="text-sm text-cyber-gray">
                      {device.os} • {device.ip}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    device.status === 'protected' ? 'bg-green-500/20 text-green-400' :
                    device.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {device.status === 'protected' ? 'Защищено' :
                     device.status === 'warning' ? 'Внимание' : 'Критично'}
                  </span>
                  <span className="text-cyber-gray text-sm">
                    {formatTimestamp(device.last_update)}
                  </span>
                </div>
              </div>

              {expandedDevice === device.id && deviceDetails[device.id] && (
                <div className="p-6 bg-cyber-black/50 border-t border-cyber-red/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-cyber-gray text-sm mb-1">Пользователь</div>
                      <div className="text-cyber-white font-semibold">
                        {deviceDetails[device.id].current_user || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-cyber-gray text-sm mb-1">Обновление баз</div>
                      <div className="text-cyber-white font-semibold">
                        {formatTimestamp(deviceDetails[device.id].last_bases_update)}
                      </div>
                    </div>
                    <div>
                      <div className="text-cyber-gray text-sm mb-1">Версия движка</div>
                      <div className="text-cyber-white">
                        {deviceDetails[device.id].engine_version || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-cyber-gray text-sm mb-1">Отдел</div>
                      <div className="text-cyber-white">
                        {deviceDetails[device.id].department || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-cyber-gray text-sm mb-1">Организация</div>
                      <div className="text-cyber-white">
                        {deviceDetails[device.id].organization || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-cyber-gray text-sm mb-1">Город</div>
                      <div className="text-cyber-white">
                        {deviceDetails[device.id].city || '—'}
                      </div>
                    </div>
                  </div>

                  {deviceDetails[device.id].groups && deviceDetails[device.id].groups.length > 0 && (
                    <div className="mt-4">
                      <div className="text-cyber-gray text-sm mb-2">Группы</div>
                      <div className="flex flex-wrap gap-2">
                        {deviceDetails[device.id].groups.map((group, idx) => (
                          <span key={idx} className="px-3 py-1 bg-cyber-red/10 text-cyber-red text-sm rounded">
                            {group}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {deviceDetails[device.id].running_components && deviceDetails[device.id].running_components.length > 0 && (
                    <div className="mt-4">
                      <div className="text-cyber-gray text-sm mb-2">Запущенные компоненты</div>
                      <div className="space-y-1">
                        {deviceDetails[device.id].running_components.slice(0, 5).map((comp, idx) => (
                          <div key={idx} className="text-sm text-cyber-white">
                            • {comp.name} {comp.user && `(${comp.user})`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-cyber-red/10">
                    <div>
                      <div className="text-cyber-gray text-sm">Вирусных баз</div>
                      <div className="text-cyber-white font-bold">{deviceDetails[device.id].bases_count}</div>
                    </div>
                    <div>
                      <div className="text-cyber-gray text-sm">Записей вирусов</div>
                      <div className="text-cyber-white font-bold">
                        {deviceDetails[device.id].bases_total_viruses.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-cyber-gray text-sm">Создана</div>
                      <div className="text-cyber-white font-bold">
                        {formatTimestamp(deviceDetails[device.id].created_time)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
