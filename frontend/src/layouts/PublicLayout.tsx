import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  // Redirect authenticated users trying to access public pages (like login/landing)
  if (isAuthenticated && user) {
    const fallback = user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'STAFF' ? '/staff/dashboard' : '/student/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-16 bg-surface shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">build_circle</span>
          <span className="text-headline-md font-bold text-primary">FixIt</span>
        </div>
      </nav>
      <main className="pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
