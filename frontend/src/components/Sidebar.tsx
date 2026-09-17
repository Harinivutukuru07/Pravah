import { useAuth } from '../context/AuthContext';
import { NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  ShoppingCart,
  Package,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/enquiries', label: 'Enquiries', icon: FileText },
  { to: '/quotations', label: 'Quotations', icon: Receipt },
  { to: '/sales-orders', label: 'Sales Orders', icon: ShoppingCart },
  { to: '/inventory', label: 'Inventory', icon: Package },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div>
          <h1>PRAVAH</h1>
          <div className="logo-subtitle">Industrial ERP</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={`sidebar-link ${location.pathname.startsWith(item.to) ? 'active' : ''}`}
          >
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-role">
            {user?.role === 'ADMIN' ? 'Administrator' : 'Sales User'}
          </div>
        </div>
        <button
          className="btn btn-ghost btn-icon"
          onClick={logout}
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
