import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import IssueTable from '../components/IssueTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { issueService } from '../services/issueService';
import type { Issue } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStats } from '../types';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [issuesData, statsData] = await Promise.all([
        issueService.getAssignedIssues(),
        dashboardService.getStaffStats()
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

  const activeIssues = issues.filter(i => i.status !== 'RESOLVED' && i.status !== 'VERIFIED');

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-primary">Staff Dashboard</h1>
          <p className="text-body-md text-on-surface-variant">Manage your assigned maintenance tasks.</p>
        </div>
        <div className="bg-[#D1FAE5] text-[#065F46] px-4 py-2 rounded-full font-bold flex items-center gap-2 self-start">
          <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
          Available for tasks
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Assigned Tasks" value={stats.assignedIssues} icon="assignment" />
        <StatCard label="In Progress" value={stats.inProgressIssues} borderColor="border-[#f59e0b]" icon="engineering" />
        <StatCard label="Resolved Today" value={stats.resolvedIssues} borderColor="border-[#10b981]" icon="task_alt" />
        <StatCard label="Critical Issues" value={stats.criticalIssues} borderColor="border-error" icon="error" iconColor="text-error" />
      </div>

      {/* Active Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-md font-bold text-primary">Your Active Tasks</h2>
          <Link to="/staff/tasks" className="text-primary font-semibold hover:underline text-label-md">
            View All Tasks
          </Link>
        </div>
        
        <IssueTable issues={activeIssues} basePath="/staff/tasks" />
      </div>
    </div>
  );
}
