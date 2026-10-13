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
    <aside className="w-64 glass border-r border-slate-700/50 flex flex-col">
      <div className="p-6 border-b border-slate-700/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Cyber Monitor
        </h1>
        <p className="text-slate-400 text-sm mt-1">Мониторинг инфраструктуры</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'gradient-primary text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
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

      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-slate-400 text-sm">Система активна</span>
        </div>
      </div>
    </aside>
  );
}
