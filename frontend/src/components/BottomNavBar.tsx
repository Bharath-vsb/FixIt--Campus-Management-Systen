import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function BottomNavBar() {
  const { user } = useAuth();
  const location = useLocation();

  const getBasePath = () => {
    switch (user?.role) {
      case 'ADMIN': return '/admin';
      case 'STAFF': return '/staff';
      default: return '/student';
    }
  };

  const base = getBasePath();

  const tabs = [
    { icon: 'home', label: 'Home', path: `${base}/dashboard` },
    { icon: 'list_alt', label: 'Issues', path: `${base}/issues` },
    { icon: 'notifications', label: 'Alerts', path: '#' },
    { icon: 'person', label: 'Profile', path: '/profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-surface shadow-[0_-4px_6px_-1px_rgba(15,23,42,0.05)] rounded-t-xl">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          to={tab.path}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-2xl transition-all duration-200 ${
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
