export function Bitrix24() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-cyber-white">Bitrix24</h1>
        <p className="text-cyber-gray">Мониторинг CRM и бизнес-процессов</p>
      </div>

      <div className="bg-cyber-black/50 border border-cyber-red/20 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">💼</div>
        <h2 className="text-2xl font-bold mb-4 text-cyber-white">Раздел в разработке</h2>
        <p className="text-cyber-gray mb-6">
          Интеграция с Bitrix24 будет включать:
        </p>
        <ul className="text-left max-w-md mx-auto space-y-3 text-cyber-gray">
          <li className="flex items-center gap-3">
            <span className="text-cyber-red">•</span>
            <span>Мониторинг активных сделок</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-cyber-red">•</span>
            <span>Статистика по задачам и проектам</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-cyber-red">•</span>
            <span>Отслеживание бизнес-процессов</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-cyber-red">•</span>
            <span>Уведомления о критических событиях</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
