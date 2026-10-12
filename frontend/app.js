console.log("🚀 app.js загружен и выполнен");

// Обновление часов
function updateDateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { hour12: false });
    const dateStr = now.toLocaleDateString('ru-RU', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const timeEl = document.getElementById('current-time');
    const dateEl = document.getElementById('current-date');
    
    if (timeEl) timeEl.textContent = timeStr;
    if (dateEl) dateEl.textContent = dateStr;
}

// Получение данных с API
async function fetchStatus() {
    console.log("📡 Запрос к /api/status...");
    try {
        const response = await fetch('/api/status');
        console.log("✅ Ответ получен, статус:", response.status);
        
        const data = await response.json();
        console.log("📦 Данные:", data);
        
        updateUI(data);
        
        // Показываем что подключено
        const statusEl = document.getElementById('connection-status');
        if (statusEl) {
            statusEl.style.borderColor = 'var(--color-green)';
            const statusText = statusEl.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Подключено';
                statusText.style.color = 'var(--color-green)';
            }
        }
    } catch (error) {
        console.error('❌ Ошибка получения данных:', error);
        
        const statusEl = document.getElementById('connection-status');
        if (statusEl) {
            statusEl.style.borderColor = 'var(--color-red)';
            const statusText = statusEl.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Ошибка подключения';
                statusText.style.color = 'var(--color-red)';
            }
        }
    }
}

// Обновление интерфейса
function updateUI(data) {
    console.log("🎨 updateUI вызван с данными:", data);
    
    if (!data || !data.summary) {
        console.error("❌ Нет данных для отрисовки");
        return;
    }
    
    // Обновляем статистику
    animateValue('protected-count', data.summary.protected || 0);
    animateValue('warning-count', data.summary.warnings || 0);
    animateValue('critical-count', data.summary.critical || 0);
    animateValue('threats-count', data.summary.threats_blocked_today || 0);
    
    // Обновляем список устройств
    const deviceList = document.getElementById('device-list');
    if (deviceList && data.devices) {
        console.log(`📱 Отрисовываем ${data.devices.length} устройств`);
        deviceList.innerHTML = data.devices.map(device => `
            <div class="device-item ${device.status}">
                <div>
                    <span class="item-name">${device.name}</span>
                    <div style="font-size: 12px; color: var(--color-gray); margin-top: 4px;">
                        ${formatTimestamp(device.last_update)} • ${device.os}
                    </div>
                </div>
                <span class="item-status status-${device.status}">
                    ${getStatusText(device.status)}
                </span>
            </div>
        `).join('');
    } else {
        console.error("❌ Не найден элемент device-list или нет данных devices");
    }
    
    // Обновляем список сервисов
    const serviceList = document.getElementById('service-list');
    if (serviceList && data.services) {
        console.log(`🔧 Отрисовываем ${data.services.length} сервисов`);
        serviceList.innerHTML = data.services.map(service => `
            <div class="service-item ${service.status}">
                <span class="item-name">${service.name}</span>
                <span class="item-status status-${service.status}">
                    ${service.uptime}
                </span>
            </div>
        `).join('');
    }
}

// Анимация изменения чисел
function animateValue(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`❌ Элемент ${elementId} не найден`);
        return;
    }
    
    const currentValue = parseInt(element.textContent) || 0;
    
    if (currentValue !== newValue) {
        element.style.transform = 'scale(1.2)';
        element.style.color = 'var(--color-red)';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
            element.style.color = 'var(--color-white)';
        }, 200);
    }
}

// Форматирование времени
function formatTimestamp(unixTime) {
    if (!unixTime || unixTime === 0) return "Неизвестно";
    const ms = unixTime < 10000000000 ? unixTime * 1000 : unixTime;
    const date = new Date(ms);
    return date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// Преобразование статуса в текст
function getStatusText(status) {
    const statusMap = {
        'protected': 'Защищено',
        'warning': 'Внимание',
        'critical': 'Критично',
        'online': 'Онлайн',
        'degraded': 'Сбои',
        'offline': 'Оффлайн'
    };
    return statusMap[status] || status;
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ DOM загружен, запускаем таймеры");
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    fetchStatus();
    setInterval(fetchStatus, 10000);
});
