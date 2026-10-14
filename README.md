# Cyber Monitor v3.0.0

Система мониторинга безопасности с нуля. Чистая архитектура, новый дизайн.

## 🚀 Возможности

### ✅ Реализовано

- **Главный дашборд** — сводка по системам, топ угроз
- **Dr.Web мониторинг** — 5 вкладок:
  - Станции — список с фильтрами и счётчиком угроз
  - Угрозы — график инфекций, HIPS-события
  - Карантин — изолированные объекты
  - Лицензии — контроль сроков
  - Репозиторий — статус обновлений
- **Детальный анализ станции** — угрозы, компоненты, группы
- **Логирование** — все события в `logs/`
- **Автообновление** — каждые 30 сек
- **Новый дизайн** — чистый enterprise dashboard

## 📁 Структура

```
cyber-monitor/
├── backend/
│   ├── main.py              # FastAPI сервер
│   ├── drweb_client.py      # Клиент Dr.Web API
│   ├── logger.py            # Логирование
│   └── requirements.txt
├── src/                     # React исходники
│   ├── App.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── DrWeb.tsx
│   │   └── StationAnalysis.tsx
│   └── components/
│       └── Sidebar.tsx
├── frontend/                # Собранный фронтенд
└── logs/                    # Логи (создаётся автоматически)
```

## 🚀 Быстрый старт

### 1. Установка

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ..
npm install
```

### 2. Настройка Dr.Web

Откройте `backend/main.py`:

```python
DRWEB_URL = "https://10.4.0.115:9081"
DRWEB_USER = "admin.test"
DRWEB_PASS = "test123"
```

### 3. Сборка и запуск

```bash
# Сборка фронтенда
npm run build

# Запуск backend
cd backend
python main.py
```

Откройте: **http://localhost:8001**

## 📊 API Endpoints

| Endpoint | Описание |
|----------|----------|
| `GET /api/server` | Информация о сервере |
| `GET /api/stations` | Список станций |
| `GET /api/station/{id}` | Детали станции |
| `GET /api/infections-chart` | График угроз |
| `GET /api/hips-events` | HIPS-события |
| `GET /api/quarantine` | Карантин |
| `GET /api/licenses` | Лицензии |
| `GET /api/repository` | Репозиторий |
| `GET /api/server-statistics` | Статистика сервера |

## 📝 Логи

Логи сохраняются в `logs/cyber_monitor_YYYYMMDD.log`:

```
2026-10-13 15:30:00 | INFO     | cyber_monitor | Cyber Monitor запущен
2026-10-13 15:30:01 | INFO     | cyber_monitor | Обновление кэша данных...
2026-10-13 15:30:02 | INFO     | cyber_monitor | ✓ Сервер: данные получены
2026-10-13 15:30:03 | INFO     | cyber_monitor | ✓ Станции: получено 22
```

## 🎨 Дизайн

Чистый enterprise dashboard:
- Тёмная тема (#0a0b0e)
- Синий акцент (#3b82f6)
- Минимализм, чистые линии
- Без градиентов и glassmorphism

## 🔒 Безопасность

⚠️ **Важно:**
- Не коммитьте пароли в Git
- Используйте переменные окружения
- Настройте HTTPS в продакшене

---

**Версия:** 3.0.0  
**Статус:** Активная разработка
