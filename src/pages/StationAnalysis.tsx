import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Threat {
  name: string;
  type: string;
  count: number;
}

interface StationDetails {
  id: string;
  name: string;
  ip: string;
  os: string;
  department: string;
  organization: string;
  city: string;
  groups: string[];
  engine_version: string;
  current_user: string;
  last_bases_update: number;
  threats: Threat[];
  running_components: Array<{ name: string; user: string }>;
}

export function StationAnalysis() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<StationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDetails(id);
    }
  }, [id]);

  const fetchDetails = async (stationId: string) => {
    try {
      const response = await fetch(`/api/station/${stationId}`);
      if (response.ok) {
        const data = await response.json();
        setDetails(data);
      }
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThreatIcon = (type: string) => {
    const icons: Record<string, string> = {
      virus: '🦠',
      trojan: '🐴',
      worm: '🪱',
      adware: '📢',
      spyware: '🕵️',
      riskware: '⚠️',
      exploit: '💥',
      dialer: '📞',
      joke: '😄'
    };
    return icons[type] || '🔴';
  };

  const groupThreats = (threats: Threat[]) => {
    const grouped: Record<string, Threat[]> = {};
    threats.forEach(threat => {
      if (!grouped[threat.type]) {
        grouped[threat.type] = [];
      }
      grouped[threat.type].push(threat);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-secondary">Загрузка...</div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-secondary">Станция не найдена</div>
      </div>
    );
  }

  const groupedThreats = groupThreats(details.threats);

  return (
    <div className="p-8 animate-fade-in">
      <button
        onClick={() => navigate('/drweb')}
        className="text-accent hover:text-blue-400 mb-4 transition-colors"
      >
        ← Назад к станциям
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">{details.name}</h1>
        <p className="text-text-secondary mt-1">{details.os} • {details.ip}</p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">Информация</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-muted">Пользователь:</span>
              <span className="text-text-primary font-medium">{details.current_user || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Отдел:</span>
              <span className="text-text-primary font-medium">{details.department || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Организация:</span>
              <span className="text-text-primary font-medium">{details.organization || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Город:</span>
              <span className="text-text-primary font-medium">{details.city || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Версия движка:</span>
              <span className="text-text-primary font-medium">{details.engine_version || '—'}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">Статистика</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-muted">Угроз:</span>
              <span className={`text-2xl font-bold ${details.threats.length > 0 ? 'text-danger' : 'text-success'}`}>
                {details.threats.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Типов угроз:</span>
              <span className="text-text-primary font-medium">{Object.keys(groupedThreats).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Groups */}
      {details.groups.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">Группы</h3>
          <div className="flex flex-wrap gap-2">
            {details.groups.map((group, idx) => (
              <span key={idx} className="px-3 py-1 bg-accent/20 text-accent rounded-lg text-sm">
                {group}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Threats */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">
          {details.threats.length > 0 ? '🚨 Угрозы' : '✅ Угроз не обнаружено'}
        </h2>

        {details.threats.length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedThreats).map(([type, threats]) => (
              <div key={type} className="border border-border rounded-lg overflow-hidden">
                <div className="bg-bg-tertiary px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getThreatIcon(type)}</span>
                    <div>
                      <div className="font-bold text-text-primary capitalize">{type}</div>
                      <div className="text-sm text-text-muted">{threats.length} обнаружений</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {threats.map((threat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                      <div className="font-medium text-text-primary">{threat.name}</div>
                      <div className="text-text-muted text-sm">×{threat.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <div className="text-xl text-success font-medium">Станция защищена</div>
          </div>
        )}
      </div>
    </div>
  );
}
