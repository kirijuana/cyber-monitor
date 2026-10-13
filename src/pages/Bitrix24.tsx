export function Bitrix24() {
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Bitrix24</h1>
        <p className="text-slate-400">Мониторинг CRM и бизнес-процессов</p>
      </div>

      <div className="card p-12 text-center">
        <div className="text-7xl mb-6">💼</div>
        <h2 className="text-3xl font-bold mb-4 text-white">Раздел в разработке</h2>
        <p className="text-slate-400 mb-8 text-lg">
          Интеграция с Bitrix24 будет включать:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="glass p-4 rounded-xl text-left">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <span className="text-white font-semibold">Мониторинг активных сделок</span>
            </div>
          </div>
          <div className="glass p-4 rounded-xl text-left">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span className="text-white font-semibold">Статистика по задачам</span>
            </div>
          </div>
          <div className="glass p-4 rounded-xl text-left">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <span className="text-white font-semibold">Бизнес-процессы</span>
            </div>
          </div>
          <div className="glass p-4 rounded-xl text-left">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <span className="text-white font-semibold">Уведомления</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
