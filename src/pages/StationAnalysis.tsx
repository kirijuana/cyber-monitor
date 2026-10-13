import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Threat {
  name: string;
  date: number;
  type: string;
  count: number;
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

export function StationAnalysis() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<DeviceDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchStationDetails(id);
    }
  }, [id]);

  const fetchStationDetails = async (stationId: string) => {
    try {
      const response = await fetch(`/api/station/${stationId}`);
      if (response.ok) {
        const data = await response.json();
        setDetails(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки деталей:', error);
    } finally {
      setLoading(false);
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

  const getThreatIcon = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('virus') || typeLower.includes('malware')) return '🦠';
    if (typeLower.includes('trojan')) return '🐴';
    if (typeLower.includes('worm')) return '🪱';
    if (typeLower.includes('adware')) return '📢';
    if (typeLower.includes('spyware')) return '🕵️';
    if (typeLower.includes('riskware')) return '⚠️';
    if (typeLower.includes('phishing')) return '🎣';
    if (typeLower.includes('exploit')) return '💥';
    return '🔴';
  };

  const getThreatSeverity = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('trojan') || typeLower.includes('exploit') || typeLower.includes('ransomware')) {
      return { level: 'critical', color: 'red', text: 'Критическая' };
    }
    if (typeLower.includes('virus') || typeLower.includes('worm') || typeLower.includes('spyware')) {
      return { level: 'high', color: 'orange', text: 'Высокая' };
    }
    if (typeLower.includes('adware') || typeLower.includes('riskware')) {
      return { level: 'medium', color: 'yellow', text: 'Средняя' };
    }
    return { level: 'low', color: 'blue', text: 'Низкая' };
  };

  // Группируем угрозы по типу
  const groupedThreats = details?.threats?.reduce((acc, threat) => {
    if (!acc[threat.type]) {
      acc[threat.type] = [];
    }
    acc[threat.type].push(threat);
    return acc;
  }, {} as Record<string, Threat[]>) || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400 text-xl">Загрузка анализа...</div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400 text-xl">Станция не найдена</div>
      </div>
    );
  }

  const threats = details.threats || [];

  return (
    <div className="p-8 animate-fade-in">
      {/* Хедер */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/drweb')}
          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-4 transition-colors"
        >
          ← Назад к списку станций
        </button>
        <h1 className="text-4xl font-bold mb-2 text-white">{details.name}</h1>
        <p className="text-slate-400">{details.os} • {details.ip}</p>
      </div>

      {/* Основная информация */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Информация о станции</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Пользователь:</span>
              <span className="text-white font-medium">{details.current_user || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Отдел:</span>
              <span className="text-white font-medium">{details.department || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Организация:</span>
              <span className="text-white font-medium">{details.organization || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Город:</span>
              <span className="text-white font-medium">{details.city || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Версия движка:</span>
              <span className="text-white font-medium">{details.engine_version || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Обновление баз:</span>
              <span className="text-white font-medium">{formatTimestamp(details.last_bases_update)}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Статистика</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Всего угроз:</span>
              <span className={`text-2xl font-bold ${threats.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {threats.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Типов угроз:</span>
              <span className="text-white font-medium">{Object.keys(groupedThreats).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Вирусных баз:</span>
              <span className="text-white font-medium">{details.bases_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Записей вирусов:</span>
              <span className="text-white font-medium">{details.bases_total_viruses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Последнее подключение:</span>
              <span className="text-white font-medium">{formatTimestamp(details.last_seen_time)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Группы */}
      {details.groups && details.groups.length > 0 && (
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Группы</h3>
          <div className="flex flex-wrap gap-2">
            {details.groups.map((group, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm">
                {group}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Угрозы */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          {threats.length > 0 ? (
            <span className="flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              Обнаруженные угрозы ({threats.length})
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              Угроз не обнаружено
            </span>
          )}
        </h2>

        {threats.length > 0 ? (
          <div className="space-y-6">
            {/* Группировка по типу */}
            {Object.entries(groupedThreats).map(([type, typeThreats]) => {
              const severity = getThreatSeverity(type);
              return (
                <div key={type} className="border border-slate-700/50 rounded-xl overflow-hidden">
                  <div className={`bg-${severity.color}-500/10 border-b border-${severity.color}-500/20 px-4 py-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getThreatIcon(type)}</span>
                        <div>
                          <div className="font-bold text-white">{type}</div>
                          <div className="text-sm text-slate-400">
                            {typeThreats.length} {typeThreats.length === 1 ? 'обнаружение' : 'обнаружений'}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 bg-${severity.color}-500/20 text-${severity.color}-400 border border-${severity.color}-500/30 rounded-lg text-sm font-medium`}>
                        {severity.text}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {typeThreats.map((threat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-white">{threat.name}</div>
                          <div className="text-sm text-slate-400 mt-1">
                            Количество: {threat.count}
                          </div>
                        </div>
                        <div className="text-sm text-slate-400">
                          {formatTimestamp(threat.date)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <div className="text-xl text-emerald-400 font-medium mb-2">Станция защищена</div>
            <div className="text-slate-400">Угроз не обнаружено</div>
          </div>
        )}
      </div>

      {/* Компоненты */}
      {details.running_components && details.running_components.length > 0 && (
        <div className="card p-6 mt-8">
          <h3 className="text-lg font-bold text-white mb-4">Запущенные компоненты</h3>
          <div className="space-y-2">
            {details.running_components.map((comp, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-white">{comp.name}</span>
                </div>
                {comp.user && (
                  <span className="text-slate-400 text-sm">{comp.user}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
