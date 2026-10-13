# 🛡️ Кибер Стратегия — Мониторинг безопасности

Система мониторинга инфраструктуры с интеграцией Dr.Web Security Space.

## 📁 Структура проекта

```
cyber-monitor/
├── backend/
│   ├── main.py              # FastAPI сервер
│   ├── drweb_client.py      # Клиент для Dr.Web API
│   └── requirements.txt     # Python зависимости
├── frontend/
│   └── index.html           # React приложение (CDN)
└── README.md
```

## 🚀 Быстрый старт

### 1. Клонирование из GitHub

```bash
git clone https://github.com/kirijuana/cyber-monitor.git
cd cyber-monitor
```

### 2. Установка Python зависимостей

```bash
cd backend
pip install -r requirements.txt
```

### 3. Настройка Dr.Web

Открой `backend/main.py` и заполни свои данные:

```python
DRWEB_URL = "https://10.4.0.1:9081"  # IP/порт Dr.Web сервера
DRWEB_USER = "admin"                   # Логин
DRWEB_PASS = "password"                # Пароль
DRWEB_VERIFY_SSL = False               # Проверка SSL (False для самоподписанных)
```

### 4. Запуск сервера

```bash
cd backend
python main.py
```

### 5. Открыть в браузере

Перейди на: **http://localhost:8001**

## ✨ Функционал

### 📊 Дашборд
- Статистика защищённых устройств
- Количество устройств требующих внимания
- Критические устройства
- Заблокированные угрозы

### 🖥️ Устройства
- Список всех устройств из Dr.Web
- Статус каждого устройства (защищено/внимание/критично)
- **Раскрывающиеся карточки** с детальной информацией:
  - IP адрес
  - MAC адрес
  - Версия антивируса
  - Последнее сканирование
  - Заблокированные угрозы
  - Пользователь
  - Группа
  - Время работы

### 🔧 Сервисы
- Статус инфраструктуры
- Uptime каждого сервиса

### 🔄 Автоматическое обновление
- Опрос Dr.Web каждые 30 секунд
- Обновление интерфейса каждые 10 секунд
- Индикатор подключения

## 🛠️ Технологии

### Backend
- **FastAPI** — веб-фреймворк
- **APScheduler** — фоновые задачи
- **Requests** — HTTP клиент для Dr.Web API

### Frontend
- **React 18** (CDN) — UI библиотека
- **Babel** — JSX компиляция в браузере
- **CSS** — кастомные стили без фреймворков

## 📝 Настройка для продакшена

### Изменение порта

В `backend/main.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)  # Измени port
```

### HTTPS

Для HTTPS используй reverse proxy (Nginx, Caddy):

```nginx
server {
    listen 443 ssl;
    server_name monitor.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Автозапуск (systemd)

Создай `/etc/systemd/system/cyber-monitor.service`:

```ini
[Unit]
Description=Cyber Monitor
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/cyber-monitor/backend
ExecStart=/usr/bin/python3 main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Запусти:
```bash
sudo systemctl enable cyber-monitor
sudo systemctl start cyber-monitor
```

## 🔒 Безопасность

⚠️ **Важно:**
- Не коммить реальные пароли в Git
- Используй переменные окружения для чувствительных данных
- Настрой firewall для ограничения доступа
- Используй HTTPS в продакшене

### Переменные окружения

Создай `.env` файл в `backend/`:

```env
DRWEB_URL=https://10.4.0.1:9081
DRWEB_USER=admin
DRWEB_PASS=your_password
```

Обнови `main.py`:
```python
import os
from dotenv import load_dotenv

load_dotenv()

DRWEB_URL = os.getenv("DRWEB_URL")
DRWEB_USER = os.getenv("DRWEB_USER")
DRWEB_PASS = os.getenv("DRWEB_PASS")
```

## 🐛 Troubleshooting

### Не подключается к Dr.Web
- Проверь доступность сервера: `ping 10.4.0.1`
- Проверь порт: `telnet 10.4.0.1 9081`
- Проверь логин/пароль в настройках

### Белый экран
- Открой DevTools (F12) → Console
- Проверь ошибки JavaScript
- Убедись что есть интернет (для загрузки React с CDN)

### API не отвечает
- Проверь что бэкенд запущен: `python main.py`
- Проверь логи в консоли
- Попробуй напрямую: `curl http://localhost:8001/api/status`

## 📄 Лицензия

MIT

## 👨‍💻 Автор

Кибер Стратегия — Мониторинг безопасности

---

**Версия:** 1.0.0  
**Последнее обновление:** 2026
