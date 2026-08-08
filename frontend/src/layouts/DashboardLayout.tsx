import { type ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard if they try to access wrong role route
    const fallback = user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'STAFF' ? '/staff/dashboard' : '/student/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar />
      <Sidebar />
      <main className="pt-16 pb-20 md:pt-0 md:pb-0 md:ml-64 min-h-screen">
        <div className="max-w-container mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      <BottomNavBar />
    </div>
  );
}
