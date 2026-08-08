import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import IssueTable from '../components/IssueTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { issueService } from '../services/issueService';
import { dashboardService } from '../services/dashboardService';
import type { Issue, DashboardStats } from '../types';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [issuesData, statsData] = await Promise.all([
        issueService.getAll({ status: 'PENDING' }), // Get pending for quick assignment
        dashboardService.getAdminStats()
      ]);
      setIssues(issuesData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error || !stats) return <ErrorState message={error || 'Data not found'} onRetry={fetchData} />;

  // Sort to show highest priority pending issues first
  const criticalPending = issues.filter(i => i.priorityLevel === 'CRITICAL' || i.priorityLevel === 'HIGH').slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-primary">Campus Command Center</h1>
          <p className="text-body-md text-on-surface-variant">Overview of all facility maintenance operations.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/staff" className="btn-secondary">
            <span className="material-symbols-outlined text-[20px]">group</span>
            Manage Staff
          </Link>
          <button className="btn-primary" onClick={() => fetchData()}>
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <StatCard label="Total Open" value={stats.totalIssues} icon="list_alt" />
        <StatCard label="Critical" value={stats.criticalIssues} borderColor="border-error" icon="warning" iconColor="text-error" />
        <StatCard label="Pending Triage" value={stats.pendingIssues} borderColor="border-primary" icon="rule" />
        <StatCard label="In Progress" value={stats.inProgressIssues} borderColor="border-[#f59e0b]" icon="engineering" />
        <StatCard label="Resolved Today" value={stats.resolvedIssues} borderColor="border-[#10b981]" icon="task_alt" />
      </div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Action Required */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-error">assignment_late</span>
              Action Required (Pending Triage)
            </h2>
            <Link to="/admin/issues" className="text-primary font-semibold hover:underline text-label-md">
              View All
            </Link>
          </div>
          
          <IssueTable 
            issues={criticalPending.length > 0 ? criticalPending : issues.slice(0, 5)} 
            basePath="/admin/issues"
            onAssign={(id) => navigate(`/admin/issues/${id}`)}
          />
        </div>

        {/* Right Column: Quick Analytics */}
        <div className="space-y-6">
          <h2 className="text-headline-md font-bold text-primary">System Health</h2>
          
          <div className="card p-6">
            <h3 className="text-label-md font-bold text-primary mb-4 uppercase tracking-wider">Top Categories</h3>
            <div className="space-y-4">
              {/* Dummy data for now, ideally comes from API */}
              <div className="flex justify-between items-center text-body-md">
                <span>Plumbing</span>
                <span className="font-bold text-primary">32%</span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span>Electrical</span>
                <span className="font-bold text-primary">24%</span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span>HVAC</span>
                <span className="font-bold text-primary">18%</span>
              </div>
            </div>
          </div>
          
          <div className="card p-6 bg-primary-container text-on-primary-container">
            <h3 className="text-label-md font-bold mb-4 uppercase tracking-wider">Staff Availability</h3>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-display-lg font-bold">8/12</div>
                <div className="text-label-sm opacity-80 mt-1">Available Staff Members</div>
              </div>
              <span className="material-symbols-outlined text-4xl opacity-50">group</span>
            </div>
            <Link to="/admin/staff" className="mt-4 text-on-primary-container font-semibold hover:underline text-sm inline-block">
              View Staff Roster →
            </Link>
          </div>
        </div>
        
      </div>
    </div>
  );
}
