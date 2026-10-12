export interface Device {
  name: string;
  status: 'protected' | 'warning' | 'critical';
  last_update: number;
  os: string;
}

export interface Service {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  uptime: string;
}

export interface Summary {
  total_devices: number;
  protected: number;
  warnings: number;
  critical: number;
  threats_blocked_today: number;
}

export interface MonitorData {
  timestamp: string;
  summary: Summary;
  devices: Device[];
  services: Service[];
}
