import { Device } from '../types';

interface DeviceListProps {
  devices: Device[];
}

function formatTimestamp(unixTime: number): string {
  if (!unixTime || unixTime === 0) return 'Неизвестно';
  const ms = unixTime < 10000000000 ? unixTime * 1000 : unixTime;
  const date = new Date(ms);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    protected: 'Защищено',
    warning: 'Внимание',
    critical: 'Критично',
  };
  return map[status] || status;
}

function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    protected: 'border-l-cyber-green',
    warning: 'border-l-cyber-yellow',
    critical: 'border-l-cyber-red animate-blink',
  };
  return map[status] || 'border-l-cyber-gray';
}

function getBadgeClass(status: string): string {
  const map: Record<string, string> = {
    protected: 'bg-cyber-green/20 text-cyber-green',
    warning: 'bg-cyber-yellow/20 text-cyber-yellow',
    critical: 'bg-cyber-red/20 text-cyber-red',
  };
  return map[status] || 'bg-cyber-gray/20 text-cyber-gray';
}

export function DeviceList({ devices }: DeviceListProps) {
  return (
    <div className="relative z-10 bg-cyber-card border border-cyber-red/20 rounded-xl p-5 md:p-6 max-h-[400px] lg:max-h-[450px] overflow-y-auto">
      <h2 className="font-[Prosto_One] text-lg md:text-xl lg:text-2xl text-cyber-red mb-4 md:mb-5 pb-3 border-b border-cyber-red/30">
        Устройства ({devices.length})
      </h2>
      <div className="flex flex-col gap-2 md:gap-3">
        {devices.map((device, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-3 md:p-4 bg-cyber-black/50 rounded-lg border-l-3 transition-all duration-300 hover:bg-cyber-black/70 ${getStatusClass(device.status)}`}
          >
            <div className="flex-1 min-w-0 mr-3">
              <span className="font-[Play] text-sm md:text-base text-cyber-white block truncate">
                {device.name}
              </span>
              <div className="text-xs text-cyber-gray mt-1 truncate">
                {formatTimestamp(device.last_update)} • {device.os}
              </div>
            </div>
            <span className={`font-[Montserrat] text-xs px-2 md:px-3 py-1 rounded uppercase tracking-wider whitespace-nowrap ${getBadgeClass(device.status)}`}>
              {getStatusText(device.status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
