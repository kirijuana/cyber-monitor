import requests
from requests.auth import HTTPBasicAuth
import urllib3
from logger import logger

# Отключаем предупреждения о самоподписанных сертификатах
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class DrWebClient:
    """Клиент для работы с Dr.Web Enterprise Security Suite API"""
    
    def __init__(self, base_url: str, username: str, password: str, verify_ssl: bool = False):
        self.base_url = base_url.rstrip('/')
        self.auth = HTTPBasicAuth(username, password)
        self.verify_ssl = verify_ssl
        logger.info(f"Dr.Web клиент инициализирован: {base_url}")
    
    def _request(self, endpoint: str, params: dict = None) -> dict:
        """Базовый метод для запросов к API"""
        url = f"{self.base_url}{endpoint}"
        if params is None:
            params = {}
        params['format'] = 'json'
        
        try:
            response = requests.get(
                url,
                auth=self.auth,
                params=params,
                verify=self.verify_ssl,
                timeout=15
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Ошибка запроса к {endpoint}: {e}")
            return None
    
    # === SERVER ===
    
    def get_server_info(self) -> dict:
        """Получить информацию о сервере"""
        logger.debug("Запрос: server/info.ds")
        return self._request("/api/server/info.ds")
    
    def get_server_statistics(self, from_date: str = None, till_date: str = None) -> dict:
        """Получить статистику сервера по угрозам"""
        params = {"top-viruses": "yes", "virtop": "20"}
        if from_date:
            params["from"] = from_date
        if till_date:
            params["till"] = till_date
        logger.debug("Запрос: server/statistics.ds")
        return self._request("/api/server/statistics.ds", params)
    
    def get_repository_status(self) -> dict:
        """Получить статус репозитория"""
        logger.debug("Запрос: server/repository-status.ds")
        return self._request("/api/server/repository-status.ds")
    
    def get_license_keys(self) -> dict:
        """Получить информацию о лицензионных ключах"""
        logger.debug("Запрос: server/keys.ds")
        return self._request("/api/server/keys.ds")
    
    # === STATIONS ===
    
    def get_stations_by_state(self, state: str) -> dict:
        """Получить список станций по статусу"""
        logger.debug(f"Запрос: stations/list-by-state.ds (state={state})")
        return self._request("/api/stations/list-by-state.ds", {"state": state, "per-page": "100"})
    
    def get_station_info(self, station_id: str) -> dict:
        """Получить детальную информацию о станции"""
        logger.debug(f"Запрос: stations/info.ds (id={station_id})")
        params = {
            "id": station_id,
            "bases": "yes",
            "components": "yes",
            "group-membership": "yes",
            "installed-components": "yes",
            "keys": "yes",
            "modules": "yes",
            "running-components": "yes"
        }
        return self._request("/api/stations/info.ds", params)
    
    def get_station_statistics(self, station_id: str) -> dict:
        """Получить статистику станции по угрозам"""
        logger.debug(f"Запрос: stations/statistics.ds (id={station_id})")
        params = {
            "id": station_id,
            "top-viruses": "yes",
            "virtop": "50"
        }
        return self._request("/api/stations/statistics.ds", params)
    
    def get_infections_chart(self, station_id: str = None, from_date: str = None, till_date: str = None) -> dict:
        """Получить график инфекций"""
        params = {}
        if station_id:
            params["id"] = station_id
        if from_date:
            params["from"] = from_date
        if till_date:
            params["till"] = till_date
        logger.debug("Запрос: stations/infections-chart.ds")
        return self._request("/api/stations/infections-chart.ds", params)
    
    def get_hips_events(self, station_id: str = None, limit: int = 50) -> dict:
        """Получить события HIPS"""
        params = {"limit": str(limit)}
        if station_id:
            params["id"] = station_id
        logger.debug("Запрос: stations/hips-events.ds")
        return self._request("/api/stations/hips-events.ds", params)
    
    def get_quarantine_objects(self, station_id: str = None) -> dict:
        """Получить объекты в карантине"""
        params = {}
        if station_id:
            params["id"] = station_id
        logger.debug("Запрос: stations/quarantine-objects.ds")
        return self._request("/api/stations/quarantine-objects.ds", params)
