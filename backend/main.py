from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from apscheduler.schedulers.background import BackgroundScheduler
from pathlib import Path
from datetime import datetime
import re

from logger import logger
from drweb_client import DrWebClient

# === FASTAPI APP ===
app = FastAPI(title="Cyber Monitor", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === PATHS ===
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

assets_dir = FRONTEND_DIR / "assets"
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

# === DR.WEB CONNECTION ===
DRWEB_URL = "https://10.4.0.115:9081"
DRWEB_USER = "admin.test"
DRWEB_PASS = "test123"

drweb = DrWebClient(DRWEB_URL, DRWEB_USER, DRWEB_PASS, verify_ssl=False)

# === CACHE ===
cache = {
    "server_info": None,
    "server_stats": None,
    "stations": [],
    "station_details": {},
    "last_update": None
}


def extract_ip(addr: str) -> str:
    """Извлекает IP из адреса типа ssl://10.15.0.10:29974"""
    if not addr:
        return "N/A"
    match = re.search(r'://([^:]+)', addr)
    return match.group(1) if match else "N/A"


def update_cache():
    """Обновление кэша данных"""
    logger.info("Обновление кэша данных...")
    
    try:
        # Сервер
        server_info = drweb.get_server_info()
        if server_info and server_info.get("head", {}).get("status"):
            cache["server_info"] = server_info.get("data", {})
            logger.info("✓ Сервер: данные получены")
        
        # Статистика сервера
        server_stats = drweb.get_server_statistics()
        if server_stats and server_stats.get("head", {}).get("status"):
            cache["server_stats"] = server_stats.get("data", {})
            logger.info("✓ Статистика сервера: получена")
        
        # Станции
        stations = []
        for state in ["online", "offline", "with_update_errors"]:
            result = drweb.get_stations_by_state(state)
            if result and result.get("head", {}).get("status"):
                station_list = result.get("data", {}).get("stations", [])
                for s in station_list:
                    stations.append({
                        "id": s.get("id", ""),
                        "name": s.get("name", "Unknown"),
                        "status": state,
                        "last_seen_time": s.get("last_seen_time", 0),
                        "last_seen_addr": s.get("last_seen_addr", ""),
                        "os_name": s.get("os_name", "Unknown"),
                        "ip": extract_ip(s.get("last_seen_addr", ""))
                    })
        cache["stations"] = stations
        logger.info(f"✓ Станции: получено {len(stations)}")
        
        cache["last_update"] = datetime.now().isoformat()
        logger.info(f"✓ Кэш обновлён успешно")
        
    except Exception as e:
        logger.error(f"Ошибка обновления кэша: {e}")


# === SCHEDULER ===
scheduler = BackgroundScheduler()
scheduler.add_job(update_cache, 'interval', seconds=30)
scheduler.start()
logger.info("Планировщик запущен (интервал 30 сек)")

# Первичное обновление
update_cache()


# === API ENDPOINTS ===

@app.get("/api/server")
async def api_server():
    """Информация о сервере"""
    if not cache["server_info"]:
        return {"error": "Данные недоступны"}
    
    data = cache["server_info"]
    server = data.get("server", {})
    stations = data.get("stations", {})
    
    return {
        "hostname": server.get("hostname", "Unknown"),
        "version": server.get("version", "Unknown"),
        "uptime": server.get("uptime", 0),
        "os": server.get("os", "Unknown"),
        "platform": server.get("platform", "Unknown"),
        "memory": server.get("memory", {}),
        "filesystem": server.get("filesystem", {}),
        "stations_summary": {
            "total": stations.get("total", 0),
            "online": stations.get("online", 0),
            "offline": stations.get("offline", 0),
            "with_update_errors": stations.get("with_update_errors", 0),
            "unactivated": stations.get("unactivated", 0),
            "new": stations.get("new", 0)
        },
        "last_update": cache["last_update"]
    }


@app.get("/api/stations")
async def api_stations():
    """Список всех станций"""
    return {
        "stations": cache["stations"],
        "count": len(cache["stations"]),
        "last_update": cache["last_update"]
    }


@app.get("/api/station/{station_id}")
async def api_station_detail(station_id: str):
    """Детальная информация о станции"""
    # Проверяем кэш
    if station_id in cache["station_details"]:
        return cache["station_details"][station_id]
    
    # Запрашиваем детали
    info = drweb.get_station_info(station_id)
    stats = drweb.get_station_statistics(station_id)
    
    if not info or not info.get("head", {}).get("status"):
        raise HTTPException(status_code=404, detail="Станция не найдена")
    
    # Парсим данные
    station_data = info.get("data", {})
    station_list = station_data.get("list", [])
    
    if not station_list:
        raise HTTPException(status_code=404, detail="Данные станции недоступны")
    
    station = station_list[0]
    
    # Извлекаем угрозы
    threats = []
    if stats and stats.get("head", {}).get("status"):
        stats_data = stats.get("data", {})
        stations_stats = stats_data.get("stations", {})
        stats_list = stations_stats.get("list", [])
        
        if stats_list:
            station_stats = stats_list[0]
            viruses_info = station_stats.get("viruses_info", {})
            
            for virus_name, virus_data in viruses_info.items():
                if isinstance(virus_data, dict):
                    # Определяем тип
                    name_lower = virus_name.lower()
                    virus_type = "unknown"
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
                    elif "exploit" in name_lower:
                        virus_type = "exploit"
                    
                    threats.append({
                        "name": virus_name,
                        "type": virus_type,
                        "count": virus_data.get("count", 1),
                        "originator": virus_data.get("originator", 0),
                        "treatment": virus_data.get("treatment", 0)
                    })
    
    result = {
        "id": station.get("id", ""),
        "name": station.get("name", "Unknown"),
        "ip": extract_ip(station.get("last_seen_addr", "")),
        "os": station.get("os_name", "Unknown"),
        "last_seen_time": station.get("last_seen_time", 0),
        "department": station.get("department", "N/A"),
        "organization": station.get("organization", "N/A"),
        "city": station.get("city", "N/A"),
        "groups": [g.get("name", "") for g in station.get("group_membership", [])],
        "engine_version": "N/A",
        "current_user": "N/A",
        "last_bases_update": 0,
        "threats": threats,
        "running_components": [
            {"name": rc.get("name", ""), "user": rc.get("user", "")}
            for rc in station.get("running_components", [])
        ]
    }
    
    # Кэшируем
    cache["station_details"][station_id] = result
    
    return result


@app.get("/api/infections-chart")
async def api_infections_chart():
    """График инфекций"""
    data = drweb.get_infections_chart()
    if not data or not data.get("head", {}).get("status"):
        return {"chart": []}
    
    return {"chart": data.get("data", {}).get("chart", [])}


@app.get("/api/hips-events")
async def api_hips_events(limit: int = 50):
    """События HIPS"""
    data = drweb.get_hips_events(limit=limit)
    if not data or not data.get("head", {}).get("status"):
        return {"events": []}
    
    return {"events": data.get("data", {}).get("events", [])}


@app.get("/api/quarantine")
async def api_quarantine():
    """Объекты в карантине"""
    data = drweb.get_quarantine_objects()
    if not data or not data.get("head", {}).get("status"):
        return {"objects": []}
    
    return {"objects": data.get("data", {}).get("objects", [])}


@app.get("/api/licenses")
async def api_licenses():
    """Лицензионные ключи"""
    data = drweb.get_license_keys()
    if not data or not data.get("head", {}).get("status"):
        return {"keys": []}
    
    return {"keys": data.get("data", {}).get("keys", [])}


@app.get("/api/repository")
async def api_repository():
    """Статус репозитория"""
    data = drweb.get_repository_status()
    if not data or not data.get("head", {}).get("status"):
        return {"status": "unknown"}
    
    return data.get("data", {})


@app.get("/api/server-statistics")
async def api_server_statistics():
    """Статистика сервера"""
    if not cache["server_stats"]:
        return {"data": {}}
    
    return {"data": cache["server_stats"]}


# === FRONTEND ===

@app.get("/")
async def root():
    return FileResponse(str(FRONTEND_DIR / "index.html"))


@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    file_path = FRONTEND_DIR / full_path
    if full_path and file_path.exists() and file_path.is_file():
        return FileResponse(str(file_path))
    return FileResponse(str(FRONTEND_DIR / "index.html"))


if __name__ == "__main__":
    import uvicorn
    logger.info("Запуск сервера на http://0.0.0.0:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
