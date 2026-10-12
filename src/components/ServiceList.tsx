import { Service } from '../types';

interface ServiceListProps {
  services: Service[];
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    online: 'Онлайн',
    degraded: 'Сбои',
    offline: 'Оффлайн',
  };
  return map[status] || status;
}

function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    online: 'border-l-cyber-green',
    degraded: 'border-l-cyber-yellow',
    offline: 'border-l-cyber-red animate-blink',
  };
  return map[status] || 'border-l-cyber-gray';
}

function getBadgeClass(status: string): string {
  const map: Record<string, string> = {
    online: 'bg-cyber-green/20 text-cyber-green',
    degraded: 'bg-cyber-yellow/20 text-cyber-yellow',
    offline: 'bg-cyber-red/20 text-cyber-red',
  };
  return map[status] || 'bg-cyber-gray/20 text-cyber-gray';
}

export function ServiceList({ services }: ServiceListProps) {
  return (
    <div className="relative z-10 bg-cyber-card border border-cyber-red/20 rounded-xl p-5 md:p-6 max-h-[400px] lg:max-h-[450px] overflow-y-auto">
      <h2 className="font-[Prosto_One] text-lg md:text-xl lg:text-2xl text-cyber-red mb-4 md:mb-5 pb-3 border-b border-cyber-red/30">
        Сервисы ({services.length})
      </h2>
      <div className="flex flex-col gap-2 md:gap-3">
        {services.map((service, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-3 md:p-4 bg-cyber-black/50 rounded-lg border-l-3 transition-all duration-300 hover:bg-cyber-black/70 ${getStatusClass(service.status)}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                service.status === 'online' ? 'bg-cyber-green' :
                service.status === 'degraded' ? 'bg-cyber-yellow' : 'bg-cyber-red'
              }`} />
              <span className="font-[Play] text-sm md:text-base text-cyber-white">
                {service.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-[Montserrat] text-xs px-2 md:px-3 py-1 rounded uppercase tracking-wider ${getBadgeClass(service.status)}`}>
                {getStatusText(service.status)}
              </span>
              <span className="font-[Montserrat] text-xs text-cyber-white/60 hidden sm:inline">
                {service.uptime}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
