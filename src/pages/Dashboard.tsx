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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-cyber-gray text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 text-cyber-white">Панель мониторинга</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => handleServiceClick(service.id)}
            className="bg-cyber-black/50 border border-cyber-red/20 rounded-xl p-6 cursor-pointer transition-all hover:border-cyber-red hover:shadow-lg hover:shadow-cyber-red/20"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl">{service.icon}</div>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                service.status === 'online' ? 'bg-green-500/20 text-green-400' :
                service.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {service.status === 'online' ? 'Онлайн' :
                 service.status === 'degraded' ? 'Деградация' : 'Оффлайн'}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2 text-cyber-white">{service.name}</h2>
            <p className="text-cyber-gray mb-4">{service.description}</p>

            <div className="space-y-2">
              {service.stats.map((stat, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-cyber-gray text-sm">{stat.label}</span>
                  <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
