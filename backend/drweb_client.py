import requests
from requests.auth import HTTPBasicAuth
import logging
from datetime import datetime
import urllib3

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
                
                # Расширенные данные для каждого устройства
                devices_list.append({
                    "name": station.get("name", "Unknown"),
                    "status": ui_status,
                    "last_update": station.get("last_seen_time", 0),
                    "os": station.get("os_name", "Unknown OS"),
                    "ip": station.get("ip", "N/A"),
                    "mac": station.get("mac", "N/A"),
                    "antivirus_version": station.get("engine_version", "N/A"),
                    "last_scan": station.get("last_scan_time", 0),
                    "threats_blocked": station.get("threats_count", 0),
                    "user": station.get("user_name", "N/A"),
                    "group": station.get("group_name", "N/A"),
                    "uptime": station.get("uptime", "N/A"),
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
        "devices": devices_list[:50],  # Берём первые 50
        "services": [
            {"name": "Active Directory", "status": "online", "uptime": "99.99%"},
            {"name": "Dr.Web Server", "status": "online", "uptime": "100.00%"},
            {"name": "Backup Server", "status": "degraded", "uptime": "98.50%"},
            {"name": "Mail Gateway", "status": "online", "uptime": "99.90%"}
        ]
    }


def get_empty_data():
    return {
        "timestamp": datetime.now().isoformat(),
        "summary": {"total_devices": 0, "protected": 0, "warnings": 0, "critical": 0, "threats_blocked_today": 0},
        "devices": [],
        "services": []
    }
