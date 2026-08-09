import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function BottomNavBar() {
  const { user } = useAuth();
  const location = useLocation();

  type Tab = { icon: string; label: string; path: string };

  const studentTabs: Tab[] = [
    { icon: 'home', label: 'Home', path: '/student/dashboard' },
    { icon: 'list_alt', label: 'Issues', path: '/student/issues' },
    { icon: 'report', label: 'Report', path: '/student/report-issue' },
  ];

  const staffTabs: Tab[] = [
    { icon: 'home', label: 'Home', path: '/staff/dashboard' },
    { icon: 'task', label: 'My Tasks', path: '/staff/tasks' },
    { icon: 'list_alt', label: 'All', path: '/staff/issues' },
    { icon: 'error', label: 'Critical', path: '/staff/critical' },
    { icon: 'person', label: 'Profile', path: '/staff/profile' },
  ];

  const adminTabs: Tab[] = [
    { icon: 'home', label: 'Home', path: '/admin/dashboard' },
    { icon: 'list_alt', label: 'Issues', path: '/admin/issues' },
    { icon: 'group', label: 'Staff', path: '/admin/staff' },
  ];

  const tabs =
    user?.role === 'STAFF' ? staffTabs :
    user?.role === 'ADMIN' ? adminTabs :
    studentTabs;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 bg-surface shadow-[0_-4px_6px_-1px_rgba(15,23,42,0.05)] rounded-t-xl">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          to={tab.path}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-2xl transition-all duration-200 ${
            isActive(tab.path)
              ? 'bg-primary-container text-on-primary-container scale-90'
              : 'text-on-surface-variant hover:bg-surface-container-highest'
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={isActive(tab.path) ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {tab.icon}
          </span>
          <span className={`text-label-sm mt-1 ${isActive(tab.path) ? 'font-bold' : ''}`}>
            {tab.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
