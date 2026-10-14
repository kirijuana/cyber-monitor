import { NavLink } from 'react-router-dom';

const menuItems = [
  { path: '/', icon: '📊', label: 'Дашборд' },
  { path: '/drweb', icon: '🛡️', label: 'Dr.Web' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-bg-secondary border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-text-primary">Cyber Monitor</h1>
        <p className="text-xs text-text-muted mt-1">v3.0.0</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="status-dot status-online"></div>
          <span className="text-text-muted text-sm">Система активна</span>
        </div>
      </div>
    </aside>
  );
}
