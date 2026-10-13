from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from apscheduler.schedulers.background import BackgroundScheduler
from pathlib import Path
import logging

from drweb_client import DrWebClient, fetch_drweb_data, fetch_station_details, get_empty_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Кибер Стратегия - Мониторинг")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Пути
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

# Монтируем статические файлы (CSS, JS, assets)
assets_dir = FRONTEND_DIR / "assets"
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

# ==============================================================================
# НАСТРОЙКИ DR.WEB (ЗАПОЛНИ СВОИМИ ДАННЫМИ!)
# ==============================================================================
DRWEB_URL = "https://10.4.0.115:9081"  # <-- ТВОЙ IP/ПОРТ
DRWEB_USER = "admin.test"             # <-- ТВОЙ ЛОГИН
DRWEB_PASS = "test123"                # <-- ТВОЙ ПАРОЛЬ
DRWEB_VERIFY_SSL = False

drweb_client = DrWebClient(DRWEB_URL, DRWEB_USER, DRWEB_PASS, DRWEB_VERIFY_SSL)

# ЕДИНЫЙ ИСТОЧНИК ПРАВДЫ ЗДЕСЬ
cached_data = get_empty_data()

def update_cache():
    global cached_data
    new_data = fetch_drweb_data(drweb_client)
    if new_data:
        cached_data = new_data

# Запускаем фоновый опрос каждые 30 секунд
scheduler = BackgroundScheduler()
scheduler.add_job(func=update_cache, trigger="interval", seconds=30)
scheduler.start()
logger.info("🔄 Фоновый опрос Dr.Web запущен (интервал 30 сек)")

# Первичное заполнение при старте
update_cache()

@app.get("/api/status")
async def get_status():
    return cached_data


@app.get("/api/dashboard")
async def get_dashboard():
    """Возвращает сводку по всем сервисам для главной страницы"""
    services = []
    
    # Dr.Web
    if cached_data and cached_data.get("summary"):
        summary = cached_data["summary"]
        drweb_status = "online" if summary.get("critical", 0) == 0 else (
            "degraded" if summary.get("warnings", 0) > 0 else "offline"
        )
        services.append({
            "id": "drweb",
            "name": "Dr.Web",
            "icon": "🛡️",
            "status": drweb_status,
            "description": "Антивирусная защита",
            "stats": [
                {"label": "Защищено", "value": summary.get("protected", 0), "color": "text-green-400"},
                {"label": "Внимание", "value": summary.get("warnings", 0), "color": "text-yellow-400"},
                {"label": "Критично", "value": summary.get("critical", 0), "color": "text-red-400"},
            ]
        })
    
    # Bitrix24 (заглушка)
    services.append({
        "id": "bitrix24",
        "name": "Bitrix24",
        "icon": "💼",
        "status": "online",
        "description": "CRM и бизнес-процессы",
        "stats": [
            {"label": "Активных сделок", "value": "—", "color": "text-cyber-gray"},
            {"label": "Задач в работе", "value": "—", "color": "text-cyber-gray"},
        ]
    })
    
    # Почта (заглушка)
    services.append({
        "id": "mail",
        "name": "Почта",
        "icon": "📧",
        "status": "online",
        "description": "Почтовый сервер",
        "stats": [
            {"label": "Писем сегодня", "value": "—", "color": "text-cyber-gray"},
            {"label": "В очереди", "value": "—", "color": "text-cyber-gray"},
        ]
    })
    
    return {"services": services}


@app.get("/api/station/{station_id}")
async def get_station_detail(station_id: str):
    """Получает детальную информацию о конкретной станции"""
    details = fetch_station_details(drweb_client, station_id)
    if not details:
        raise HTTPException(status_code=404, detail=f"Station {station_id} not found")
    return details


@app.get("/")
async def root():
    """Главная страница"""
    return FileResponse(str(FRONTEND_DIR / "index.html"))


@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    """Отдаём React SPA — все маршруты ведут на index.html"""
    # Если запрашивается файл из assets — отдаём его
    file_path = FRONTEND_DIR / full_path
    if full_path and file_path.exists() and file_path.is_file():
        return FileResponse(str(file_path))
    # Иначе отдаём index.html (SPA routing)
    return FileResponse(str(FRONTEND_DIR / "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
