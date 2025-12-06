/**
 * Corporate Sidebar Navigation
 */

import { NavLink } from 'react-router-dom';

export default function CorporateSidebar() {
  // location is available via NavLink's isActive; no explicit use needed here

  const items = [
    { to: '/corporate/dashboard', label: 'Dashboard' },
    { to: '/corporate/jobs', label: 'Jobs' },
    { to: '/workforce', label: 'Workforce' },
    { to: '/corporate/accounts', label: 'Accounts' },
    { to: '/corporate/settings', label: 'Settings' }
  ];

  return (
    <aside className="w-56 border-r h-full p-4">
      <nav className="space-y-2">
        {items.map(i => (
          <NavLink
            key={i.to}
            to={i.to}
            className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {i.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
