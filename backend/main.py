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
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

# ==============================================================================
# НАСТРОЙКИ DR.WEB (ЗАПОЛНИ СВОИМИ ДАННЫМИ!)
# ==============================================================================
DRWEB_URL = "https://10.4.0.1:9081"  # <-- ТВОЙ IP/ПОРТ
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

@app.get("/")
async def root():
    return FileResponse(str(FRONTEND_DIR / "index.html"))

@app.get("/api/status")
async def get_status():
    return cached_data


@app.get("/api/station/{station_id}")
async def get_station_detail(station_id: str):
    """Получает детальную информацию о конкретной станции"""
    details = fetch_station_details(drweb_client, station_id)
    if not details:
        raise HTTPException(status_code=404, detail=f"Station {station_id} not found")
    return details


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
