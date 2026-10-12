interface ConnectionStatusProps {
  isConnected: boolean;
  useMock: boolean;
  lastUpdate: Date;
}

export function ConnectionStatus({ isConnected, useMock, lastUpdate }: ConnectionStatusProps) {
  const statusColor = isConnected ? 'border-cyber-green' : 'border-cyber-red';
  const dotColor = isConnected ? 'bg-cyber-green' : 'bg-cyber-red';
  const textColor = isConnected ? 'text-cyber-green' : 'text-cyber-red';
  const statusText = isConnected ? 'Подключено' : useMock ? 'Демо-режим' : 'Ошибка подключения';

  return (
    <div className={`fixed bottom-4 right-4 md:bottom-5 md:right-5 flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 md:py-3 bg-cyber-black/80 border ${statusColor} rounded-full z-50 backdrop-blur-sm`}>
      <div className={`w-2.5 h-2.5 rounded-full ${dotColor} animate-pulse-dot`} />
      <div className="flex flex-col">
        <span className={`font-[Montserrat] text-xs md:text-sm ${textColor}`}>
          {statusText}
        </span>
        <span className="font-[Montserrat] text-[10px] text-cyber-gray">
          {lastUpdate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
