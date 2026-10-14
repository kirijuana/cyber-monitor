import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ServiceCard {
  id: string;
  name: string;
  icon: string;
  status: 'online' | 'degraded' | 'offline';
  description: string;
  stats: {
    label: string;
    value: number | string;
    color: string;
  }[];
}

interface DrWebSummary {
  total_devices: number;
  protected: number;
  warnings: number;
  critical: number;
}

interface ServerStats {
  data?: {
    infections?: {
      total?: number;
      viruses?: Array<{ name: string; count: number }>;
    };
  };
}

interface QuarantineData {
  data?: {
    objects?: Array<any>;
  };
}

export function Dashboard() {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [drwebSummary, setDrWebSummary] = useState<DrWebSummary | null>(null);
  const [serverStats, setServerStats] = useState<ServerStats>({});
  const [quarantineData, setQuarantineData] = useState<QuarantineData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, statusRes, statsRes, quarantineRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/status'),
        fetch('/api/server/statistics'),
        fetch('/api/quarantine'),
      ]);

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        setServices(dashboardData.services);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setDrWebSummary(statusData.summary);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setServerStats(statsData);
      }

      if (quarantineRes.ok) {
        const quarantineDataRes = await quarantineRes.json();
        setQuarantineData(quarantineDataRes);
      }
    } catch (error) {
      console.error('Ошибка загрузки dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/${serviceId}`);
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'online': return 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30';
      case 'degraded': return 'from-amber-500/20 to-amber-600/20 border-amber-500/30';
      case 'offline': return 'from-red-500/20 to-red-600/20 border-red-500/30';
      default: return 'from-slate-500/20 to-slate-600/20 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return 'badge-success';
      case 'degraded': return 'badge-warning';
      case 'offline': return 'badge-danger';
      default: return 'badge';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Онлайн';
      case 'degraded': return 'Деградация';
      case 'offline': return 'Оффлайн';
      default: return 'Неизвестно';
    }
  };

  const totalInfections = serverStats.data?.infections?.total || 0;
  const quarantineCount = quarantineData.data?.objects?.length || 0;
  const topViruses = serverStats.data?.infections?.viruses?.slice(0, 5) || [];

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
        <h1 className="text-4xl font-bold mb-2 text-white">Панель мониторинга</h1>
        <p className="text-slate-400">Обзор всех сервисов инфраструктуры</p>
      </div>

      {/* Dr.Web сводка */}
      {drwebSummary && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Dr.Web Security Space</h2>
            <button
              onClick={() => navigate('/drweb')}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-all"
            >
              Подробнее →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">Всего станций</div>
              <div className="text-2xl font-bold text-white">{drwebSummary.total_devices}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">Защищено</div>
              <div className="text-2xl font-bold text-emerald-400">{drwebSummary.protected}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">Внимание</div>
              <div className="text-2xl font-bold text-amber-400">{drwebSummary.warnings}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">Критично</div>
              <div className="text-2xl font-bold text-red-400">{drwebSummary.critical}</div>
            </div>
          </div>

          {/* Дополнительные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">Угрозы за 24ч</div>
              <div className="text-2xl font-bold text-orange-400">{totalInfections}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">В карантине</div>
              <div className="text-2xl font-bold text-purple-400">{quarantineCount}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">Общий статус</div>
              <div className={`text-2xl font-bold ${
                drwebSummary.critical > 0 ? 'text-red-400' :
                drwebSummary.warnings > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {drwebSummary.critical > 0 ? '🚨 Критично' :
                 drwebSummary.warnings > 0 ? '⚠️ Внимание' : '✅ Норма'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Топ угроз */}
      {topViruses.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Топ угроз за период</h2>
          <div className="space-y-3">
            {topViruses.map((virus, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-red-400 font-bold">#{idx + 1}</span>
                  <span className="text-white">{virus.name}</span>
                </div>
                <span className="text-red-400 font-bold">{virus.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => handleServiceClick(service.id)}
            className={`card p-6 cursor-pointer bg-gradient-to-br ${getStatusGradient(service.status)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl">{service.icon}</div>
              <div className={`badge ${getStatusBadge(service.status)}`}>
                {getStatusText(service.status)}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2 text-white">{service.name}</h2>
            <p className="text-slate-400 mb-6">{service.description}</p>

            <div className="space-y-3">
              {service.stats.map((stat, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">{stat.label}</span>
                  <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
