import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages — Public
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';

// Pages — Student
import StudentDashboard from './pages/StudentDashboard';
import ReportIssue from './pages/ReportIssue';
import StudentIssues from './pages/StudentIssues';
import IssueDetails from './pages/IssueDetails';

// Pages — Staff
import StaffDashboard from './pages/StaffDashboard';
import StaffTasks from './pages/StaffTasks';
import StaffAllIssues from './pages/StaffAllIssues';
import StaffCritical from './pages/StaffCritical';
import StaffResolved from './pages/StaffResolved';
import StaffProfile from './pages/StaffProfile';

// Pages — Admin
import AdminDashboard from './pages/AdminDashboard';
import AdminIssues from './pages/AdminIssues';
import AdminStaff from './pages/AdminStaff';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><AuthPage /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><AuthPage /></PublicLayout>} />

            {/* Smart Dashboard Redirect */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Student Routes */}
            <Route path="/student" element={<DashboardLayout allowedRoles={['STUDENT']}><Outlet /></DashboardLayout>}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="report-issue" element={<ReportIssue />} />
              <Route path="issues" element={<StudentIssues />} />
              <Route path="issues/:id" element={<IssueDetails />} />
            </Route>

            {/* Staff Routes */}
            <Route path="/staff" element={<DashboardLayout allowedRoles={['STAFF']}><Outlet /></DashboardLayout>}>
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="tasks" element={<StaffTasks />} />
              <Route path="tasks/:id" element={<IssueDetails />} />
              <Route path="issues" element={<StaffAllIssues />} />
              <Route path="issues/:id" element={<IssueDetails />} />
              <Route path="critical" element={<StaffCritical />} />
              <Route path="resolved" element={<StaffResolved />} />
              <Route path="profile" element={<StaffProfile />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<DashboardLayout allowedRoles={['ADMIN']}><Outlet /></DashboardLayout>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="issues" element={<AdminIssues />} />
              <Route path="issues/:id" element={<IssueDetails />} />
              <Route path="staff" element={<AdminStaff />} />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  switch (user?.role) {
    case 'ADMIN': return <Navigate to="/admin/dashboard" replace />;
    case 'STAFF': return <Navigate to="/staff/dashboard" replace />;
    default: return <Navigate to="/student/dashboard" replace />;
  }
}
