import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

export function Dashboard() {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
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
