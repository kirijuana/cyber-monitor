import { useState, useEffect } from 'react';

interface Service {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  uptime: string;
}

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки сервисов:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'emerald';
      case 'degraded': return 'amber';
      case 'offline': return 'red';
      default: return 'slate';
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
        <div className="text-slate-400 text-xl">Загрузка сервисов...</div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Инфраструктура</h1>
        <p className="text-slate-400">Статус всех сервисов и компонентов</p>
      </div>

      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">Сервисы ({services.length})</h2>
        <div className="space-y-3">
          {services.map((service, idx) => {
            const color = getStatusColor(service.status);
            return (
              <div
                key={idx}
                className={`glass rounded-xl p-4 flex items-center justify-between hover:bg-slate-800/50 transition-all`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full bg-${color}-500 animate-pulse`}></div>
                  <div>
                    <div className="font-semibold text-white text-lg">{service.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`badge badge-${color === 'emerald' ? 'success' : color === 'amber' ? 'warning' : 'danger'}`}>
                    {getStatusText(service.status)}
                  </span>
                  <span className="text-slate-400 text-sm">
                    Uptime: <span className="text-white font-semibold">{service.uptime}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
