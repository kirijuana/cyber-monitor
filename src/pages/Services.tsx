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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-cyber-gray text-xl">Загрузка сервисов...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-cyber-white">Инфраструктура</h1>
        <p className="text-cyber-gray">Статус всех сервисов и компонентов</p>
      </div>

      <div className="bg-cyber-black/50 border border-cyber-red/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-cyber-white">Сервисы ({services.length})</h2>
        <div className="space-y-3">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="p-4 border border-cyber-red/10 rounded-lg flex items-center justify-between hover:bg-cyber-black/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  service.status === 'online' ? 'bg-green-500' :
                  service.status === 'degraded' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <div>
                  <div className="font-semibold text-cyber-white">{service.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  service.status === 'online' ? 'bg-green-500/20 text-green-400' :
                  service.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {service.status === 'online' ? 'Онлайн' :
                   service.status === 'degraded' ? 'Деградация' : 'Оффлайн'}
                </span>
                <span className="text-cyber-gray text-sm">
                  Uptime: {service.uptime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
