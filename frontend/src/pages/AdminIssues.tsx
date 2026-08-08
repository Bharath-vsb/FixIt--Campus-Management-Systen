import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { issueService } from '../services/issueService';
import type { Issue, PriorityLevel, IssueStatus } from '../types';
import IssueTable from '../components/IssueTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function AdminIssues() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const initialPriority = (queryParams.get('priority') as PriorityLevel) || '';
  const initialStatus = (queryParams.get('status') as IssueStatus) || '';

  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterPriority, setFilterPriority] = useState<PriorityLevel | ''>(initialPriority);
  const [filterStatus, setFilterStatus] = useState<IssueStatus | ''>(initialStatus);

  const fetchIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await issueService.getAll();
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

  // Sync state with URL if needed, but for MVP local filtering is fine
  const filteredIssues = issues.filter(issue => {
    if (filterPriority && issue.priorityLevel !== filterPriority) return false;
    if (filterStatus && issue.status !== filterStatus) return false;
    return true;
  });

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchIssues} />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-primary">All Issues</h1>
          <p className="text-body-md text-on-surface-variant">View and manage all reported campus issues.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface rounded-xl p-4 shadow-level-1 border border-outline-variant flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Status</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="input-field py-1.5"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Triage</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="VERIFIED">Verified</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Priority</label>
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="input-field py-1.5"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div className="flex items-end">
          <button 
            onClick={() => { setFilterPriority(''); setFilterStatus(''); }}
            className="btn-secondary h-[38px]"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-label-md text-on-surface-variant">Showing {filteredIssues.length} issues</p>
      </div>

      <IssueTable 
        issues={filteredIssues} 
        basePath="/admin/issues" 
        onAssign={(id) => navigate(`/admin/issues/${id}`)}
      />
    </div>
  );
}
