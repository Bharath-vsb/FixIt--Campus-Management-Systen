import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { issueService } from '../services/issueService';
import type { Issue } from '../types';
import IssueTable from '../components/IssueTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function StaffIssues() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const statusParam = queryParams.get('status');

  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await issueService.getAssignedIssues();
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-primary">
            {statusParam === 'RESOLVED' ? 'Resolved Issues' : 'Assigned Issues'}
          </h1>
          <p className="text-body-md text-on-surface-variant">
            {statusParam === 'RESOLVED' ? 'View your resolved maintenance tasks.' : 'View and manage all your assigned maintenance tasks.'}
          </p>
        </div>
      </div>

      <IssueTable 
        issues={statusParam ? issues.filter(i => i.status === statusParam) : issues} 
        basePath="/staff/issues" 
      />
    </div>
  );
}
