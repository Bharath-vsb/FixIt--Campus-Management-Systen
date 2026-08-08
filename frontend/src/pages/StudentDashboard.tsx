import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import IssueCard from '../components/IssueCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { issueService } from '../services/issueService';
import type { Issue } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await issueService.getMyIssues();
      setIssues(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load issues');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchIssues} />;

  const activeIssues = issues.filter(i => i.status !== 'RESOLVED' && i.status !== 'VERIFIED');
  const resolvedIssues = issues.filter(i => i.status === 'RESOLVED' || i.status === 'VERIFIED');
  const recentIssues = [...issues].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-primary">Welcome, {user?.fullName.split(' ')[0]}</h1>
          <p className="text-body-md text-on-surface-variant">Here's an overview of your reported issues.</p>
        </div>
        <Link to="/student/report-issue" className="btn-primary w-full md:w-auto">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Report New Issue
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Total Reported" value={issues.length} icon="receipt_long" />
        <StatCard label="Active Issues" value={activeIssues.length} borderColor="border-[#f59e0b]" icon="pending_actions" />
        <StatCard label="Resolved" value={resolvedIssues.length} borderColor="border-[#10b981]" icon="task_alt" />
        <StatCard label="Pending Verification" value={issues.filter(i => i.status === 'RESOLVED').length} borderColor="border-primary" icon="fact_check" />
      </div>

      {/* Recent Issues List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-md font-bold text-primary">Recent Reports</h2>
          <Link to="/student/issues" className="text-primary font-semibold hover:underline text-label-md">
            View All
          </Link>
        </div>
        
        {recentIssues.length === 0 ? (
          <div className="bg-surface border border-outline-variant rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">inbox</span>
            <p className="text-body-md text-on-surface-variant">You haven't reported any issues yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="bg-primary-container text-on-primary-container rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-level-1">
        <div className="w-12 h-12 rounded-full bg-surface/20 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-3xl">lightbulb</span>
        </div>
        <div>
          <h3 className="text-headline-md font-bold mb-1">Help keep our campus beautiful</h3>
          <p className="text-body-md opacity-90 max-w-3xl">
            When reporting an issue, providing a clear photo and detailed location helps our maintenance team resolve it up to 40% faster.
          </p>
        </div>
      </div>
    </div>
  );
}
