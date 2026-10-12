import { useState, useEffect, useCallback } from 'react';
import { MonitorData } from '../types';
import { mockData } from '../mockData';

const API_URL = '/api/status';
const POLL_INTERVAL = 10000; // 10 секунд

export function useMonitorData() {
  const [data, setData] = useState<MonitorData>(mockData);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [useMock, setUseMock] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      setData(json);
      setIsConnected(true);
      setLastUpdate(new Date());
      setUseMock(false);
    } catch (error) {
      console.warn('⚠️ API недоступен, используем демо-данные:', error);
      setIsConnected(false);
      setUseMock(true);
      // Обновляем timestamp в mock данных для реалистичности
      setData({
        ...mockData,
        timestamp: new Date().toISOString(),
      });
      setLastUpdate(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isConnected, lastUpdate, useMock };
}
