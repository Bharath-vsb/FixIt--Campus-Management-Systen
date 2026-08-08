import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

interface NavItem {
  icon: string;
  label: string;
  path: string;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard', },
  { icon: 'report', label: 'Report Issue', path: '/student/report-issue', roles: ['STUDENT'] },
  { icon: 'assignment', label: 'My Issues', path: '/student/issues', roles: ['STUDENT'] },
  { icon: 'assignment_ind', label: 'Assigned', path: '/staff/issues', roles: ['STAFF'] },
  { icon: 'list_alt', label: 'All Issues', path: '/admin/issues', roles: ['ADMIN'] },
  { icon: 'error', label: 'Critical', path: '/admin/issues?priority=CRITICAL', roles: ['ADMIN'] },
  { icon: 'group', label: 'Staff', path: '/admin/staff', roles: ['ADMIN'] },
  { icon: 'category', label: 'Categories', path: '/admin/management', roles: ['ADMIN'] },
  { icon: 'analytics', label: 'Analytics', path: '/admin/analytics', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'STAFF': return '/staff/dashboard';
      default: return '/student/dashboard';
    }
  };

  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  }).map(item => ({
    ...item,
    path: item.path === '/dashboard' ? getDashboardPath() : item.path,
  }));

  const isActive = (path: string) => {
    if (path.includes('?')) return location.pathname === path.split('?')[0];
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="hidden md:flex flex-col h-screen fixed left-0 top-0 p-4 gap-2 w-64 bg-surface border-r border-outline-variant z-40">
      {/* Logo */}
      <div className="mb-8 px-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-3xl">build_circle</span>
        <div>
          <h1 className="text-headline-md font-bold text-primary leading-tight">FixIt</h1>
          <p className="text-label-sm text-on-surface-variant">Campus Maintenance</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-2 flex-grow overflow-y-auto">
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 ${
              isActive(item.path)
                ? 'bg-secondary-container text-on-secondary-container font-bold scale-95'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="text-label-md">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-outline-variant">
        <Link
          to="/profile"
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="text-label-md">{user?.fullName || 'Profile'}</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors w-full text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-label-md">Logout</span>
        </button>
      </div>
    </aside>
  );
}
