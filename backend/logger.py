import logging
from pathlib import Path
from datetime import datetime

# Создаём папку logs если её нет
LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Настраиваем логирование в файл
log_file = LOG_DIR / f"cyber_monitor_{datetime.now().strftime('%Y%m%d')}.log"

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.FileHandler(log_file, encoding='utf-8'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('cyber_monitor')

# Логируем запуск
logger.info("=" * 80)
logger.info("Cyber Monitor запущен")
logger.info(f"Лог-файл: {log_file}")
logger.info("=" * 80)
