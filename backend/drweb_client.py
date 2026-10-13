import requests
from requests.auth import HTTPBasicAuth
import logging
from datetime import datetime
import urllib3
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Отключаем ворнинги о самоподписанных сертификатах
urllib3.disable_warnings()


class DrWebClient:
    def __init__(self, base_url: str, username: str, password: str, verify_ssl: bool = False):
        self.base_url = base_url.rstrip('/')
        self.auth = HTTPBasicAuth(username, password)
        self.verify_ssl = verify_ssl

    def get_server_info(self):
        url = f"{self.base_url}/api/server/info.ds"
        try:
            response = requests.get(url, auth=self.auth, params={"format": "json"}, verify=self.verify_ssl, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Ошибка Dr.Web (info): {e}")
            return None

    def get_stations_detail(self, states: list):
        states_query = "&".join([f"state={s}" for s in states])
        url = f"{self.base_url}/api/stations/list-by-state.ds?{states_query}&per-page=100&format=json"
        try:
            response = requests.get(url, auth=self.auth, verify=self.verify_ssl, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Ошибка Dr.Web (stations): {e}")
            return None

    def get_station_info(self, station_id: str):
        """Получает детальную информацию о конкретной станции"""
        url = f"{self.base_url}/api/stations/info.ds"
        params = {
            "id": station_id,
            "format": "json",
            "bases": "yes",
            "components": "yes",
            "group-membership": "yes",
            "installed-components": "yes",
            "keys": "yes",
            "modules": "yes",
            "running-components": "yes",
        }
        try:
            response = requests.get(url, auth=self.auth, params=params, verify=self.verify_ssl, timeout=15)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Ошибка Dr.Web (station info {station_id}): {e}")
            return None


def extract_ip_from_addr(addr: str) -> str:
    """Извлекает IP из строки типа 'ssl://10.15.0.10:29974' или 'tcp://192.168.1.1:1921'"""
    if not addr:
        return "N/A"
    match = re.search(r'://([^:]+)', addr)
    if match:
        return match.group(1)
    return "N/A"


def fetch_drweb_data(client: DrWebClient):
    """Возвращает свежие данные с Dr.Web"""
    logger.info("Опрос сервера Dr.Web...")
    server_info = client.get_server_info()

    if not server_info or "data" not in server_info:
        logger.warning("Не удалось получить данные, возвращаем заглушку")
        return get_empty_data()

    stations_data = server_info["data"].get("stations", {})
    online_count = stations_data.get("online", 0)
    warning_count = stations_data.get("with_update_errors", 0)
    critical_count = stations_data.get("offline", 0) + stations_data.get("unactivated", 0) + stations_data.get("new", 0)
    total_count = stations_data.get("total", 0)

    details = client.get_stations_detail(["online", "with_update_errors", "offline", "unactivated", "new"])
    devices_list = []

    if details and "data" in details and "stations" in details["data"]:
        for state, stations in details["data"]["stations"].items():
            for station in stations:
                ui_status = "protected" if state == "online" else (
                    "warning" if state == "with_update_errors" else "critical")
                
                # Извлекаем IP из last_seen_addr
                ip = extract_ip_from_addr(station.get("last_seen_addr", ""))
                
                devices_list.append({
                    "id": station.get("id", ""),
                    "name": station.get("name", "Unknown"),
                    "status": ui_status,
                    "last_update": station.get("last_seen_time", 0),
                    "os": station.get("os_name", "Unknown OS"),
                    "ip": ip,
                    "last_seen_addr": station.get("last_seen_addr", ""),
                    "state": station.get("state", 0),
                })

    logger.info(f"✅ Данные обновлены: {online_count} в сети, {warning_count} с ошибками, {critical_count} критических")

    return {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total_devices": total_count,
            "protected": online_count,
            "warnings": warning_count,
            "critical": critical_count,
            "threats_blocked_today": 0
        },
        "devices": devices_list[:50],
        "services": [
            {"name": "Active Directory", "status": "online", "uptime": "99.99%"},
            {"name": "Dr.Web Server", "status": "online", "uptime": "100.00%"},
            {"name": "Backup Server", "status": "degraded", "uptime": "98.50%"},
            {"name": "Mail Gateway", "status": "online", "uptime": "99.90%"}
        ]
    }


def get_station_statistics(client: DrWebClient, station_id: str):
    """Получает статистику угроз для конкретной станции"""
    url = f"{client.base_url}/api/stations/statistics.ds"
    params = {
        "id": station_id,
        "format": "json",
        "top-viruses": "yes",
        "virtop": "50",  # Получаем до 50 вирусов
    }
    try:
        response = requests.get(url, auth=client.auth, params=params, verify=client.verify_ssl, timeout=15)
        response.raise_for_status()
        data = response.json()
        logger.info(f"📊 Статистика станции {station_id}: получено")
        return data
    except Exception as e:
        logger.error(f"Ошибка Dr.Web (statistics {station_id}): {e}")
        return None


def fetch_station_details(client: DrWebClient, station_id: str):
    """Получает детальную информацию о станции и форматирует её"""
    info = client.get_station_info(station_id)
    
    if not info or "data" not in info:
        return None
    
    # API возвращает данные в data.list[0]
    station_list = info.get("data", {}).get("list", [])
    if not station_list:
        return None
    
    station = station_list[0]
    
    # Получаем статистику угроз
    stats = get_station_statistics(client, station_id)
    threats = []
    
    if stats and "data" in stats:
        # API возвращает данные в data.stations.list[0]
        stations_list = stats["data"].get("stations", {}).get("list", [])
        
        if stations_list:
            station_stats = stations_list[0]
            
            # Получаем информацию о вирусах
            viruses_info = station_stats.get("viruses_info", {})
            
            logger.info(f"🔍 Найдено угроз для станции {station_id}: {len(viruses_info)}")
            
            # Парсим вирусы из viruses_info
            for virus_name, virus_data in viruses_info.items():
                if isinstance(virus_data, dict):
                    # Определяем тип вируса по названию
                    virus_type = "unknown"
                    name_lower = virus_name.lower()
                    if "trojan" in name_lower:
                        virus_type = "trojan"
                    elif "virus" in name_lower or "win32" in name_lower:
                        virus_type = "virus"
                    elif "worm" in name_lower:
                        virus_type = "worm"
                    elif "adware" in name_lower:
                        virus_type = "adware"
                    elif "spyware" in name_lower:
                        virus_type = "spyware"
                    elif "riskware" in name_lower:
                        virus_type = "riskware"
                    elif "dialer" in name_lower:
                        virus_type = "dialer"
                    elif "joke" in name_lower:
                        virus_type = "joke"
                    elif "exploit" in name_lower:
                        virus_type = "exploit"
                    
                    threats.append({
                        "name": virus_name,
                        "date": 0,  # В API нет даты для каждого вируса
                        "type": virus_type,
                        "count": virus_data.get("count", 1),
                        "originator": virus_data.get("originator", 0),
                        "treatment": virus_data.get("treatment", 0),
                    })
    
    # Извлекаем IP
    ip = extract_ip_from_addr(station.get("last_seen_addr", ""))
    
    # Получаем версию антивируса из installed_components
    av_version = "N/A"
    installed = station.get("installed_components", [])
    for comp in installed:
        if "engine" in comp.get("name", "").lower() or "agent" in comp.get("name", "").lower():
            av_version = comp.get("name", "N/A")
            break
    if av_version == "N/A" and installed:
        av_version = installed[0].get("name", "N/A")
    
    # Получаем информацию о модулях (версия движка)
    engine_version = "N/A"
    modules = station.get("modules", [])
    for mod in modules:
        if "drweb" in mod.get("file_name", "").lower() and mod.get("version"):
            engine_version = mod.get("version", "N/A")
            break
    
    # Получаем группы
    groups = []
    group_membership = station.get("group_membership", [])
    for g in group_membership:
        groups.append(g.get("name", ""))
    
    # Получаем запущенные компоненты и текущего пользователя
    running = []
    current_user = "N/A"
    running_components = station.get("running_components", [])
    for rc in running_components:
        running.append({
            "name": rc.get("name", ""),
            "user": rc.get("user", ""),
            "started": rc.get("started_time", 0),
        })
        # Берём первого пользователя как текущего
        if current_user == "N/A" and rc.get("user"):
            current_user = rc.get("user", "N/A")
    
    # Получаем вирусные базы и время последнего обновления
    bases_count = 0
    bases_total_viruses = 0
    last_bases_update = 0
    bases = station.get("bases", [])
    bases_count = len(bases)
    for b in bases:
        bases_total_viruses += b.get("viruses", 0)
        # Находим самое свежее время обновления базы
        base_time = b.get("created_time", 0)
        if base_time > last_bases_update:
            last_bases_update = base_time
    
    # Лицензионные ключи
    keys_data = station.get("keys", {})
    keys_list = keys_data.get("list", [])
    
    result = {
        "id": station.get("id", ""),
        "name": station.get("name", "Unknown"),
        "ip": ip,
        "os": station.get("os_name", "Unknown OS"),
        "last_seen_time": station.get("last_seen_time", 0),
        "last_seen_addr": station.get("last_seen_addr", ""),
        "department": station.get("department", "N/A"),
        "description": station.get("description", "N/A"),
        "city": station.get("city", "N/A"),
        "country": station.get("country", "N/A"),
        "organization": station.get("organization", "N/A"),
        "parent_name": station.get("parent_name", "N/A"),
        "engine_version": engine_version,
        "installed_components": [c.get("name", "") for c in installed],
        "running_components": running,
        "groups": groups,
        "bases_count": bases_count,
        "bases_total_viruses": bases_total_viruses,
        "last_bases_update": last_bases_update,
        "current_user": current_user,
        "keys": keys_list,
        "state": station.get("state", 0),
        "created_time": station.get("created_time", 0),
        "first_login": station.get("firstlogin", 0),
        "threats": threats,
    }
    
    return result


def get_empty_data():
    return {
        "timestamp": datetime.now().isoformat(),
        "summary": {"total_devices": 0, "protected": 0, "warnings": 0, "critical": 0, "threats_blocked_today": 0},
        "devices": [],
        "services": []
    }
