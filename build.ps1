# Build script for Cyber Monitor
# Запусти этот скрипт чтобы собрать React приложение

Write-Host "🚀 Сборка Cyber Monitor..." -ForegroundColor Green

# Проверяем что Node.js установлен
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js найден: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js не найден! Установи с https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Устанавливаем зависимости
Write-Host "`n📦 Установка зависимостей..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка установки зависимостей!" -ForegroundColor Red
    exit 1
}

# Собираем проект
Write-Host "`n🔨 Сборка проекта..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка сборки!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Готово! Файлы собраны в frontend/" -ForegroundColor Green
Write-Host "`n🎯 Теперь запусти бэкенд:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   python main.py" -ForegroundColor White
Write-Host "`n🌐 Открой браузер: http://localhost:8001" -ForegroundColor Cyan
