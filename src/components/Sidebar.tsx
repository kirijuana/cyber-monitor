import { NavLink } from 'react-router-dom';

const menuItems = [
  { path: '/', icon: '📊', label: 'Дашборд' },
  { path: '/drweb', icon: '🛡️', label: 'Dr.Web' },
  { path: '/bitrix24', icon: '💼', label: 'Bitrix24' },
  { path: '/mail', icon: '📧', label: 'Почта' },
  { path: '/services', icon: '⚙️', label: 'Сервисы' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-cyber-black/80 border-r border-cyber-red/20 flex flex-col">
      <div className="p-6 border-b border-cyber-red/20">
        <h1 className="text-2xl font-bold text-cyber-white">Кибер Стратегия</h1>
        <p className="text-cyber-gray text-sm mt-1">Мониторинг инфраструктуры</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-cyber-red/20 text-cyber-white border-l-4 border-cyber-red'
                      : 'text-cyber-gray hover:bg-cyber-black/50 hover:text-cyber-white'
                  }`
                }
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-semibold">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-cyber-red/20">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-cyber-gray text-sm">Система активна</span>
        </div>
      </div>
    </aside>
  );
}
