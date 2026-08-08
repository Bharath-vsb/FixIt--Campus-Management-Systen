import { useState, useEffect } from 'react';
import { issueService } from '../services/issueService';
import type { Issue } from '../types';
import IssueCard from '../components/IssueCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

export default function StudentIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

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

  const filteredIssues = issues.filter(issue => {
    if (filter === 'ACTIVE') return issue.status !== 'RESOLVED' && issue.status !== 'VERIFIED';
    if (filter === 'RESOLVED') return issue.status === 'RESOLVED' || issue.status === 'VERIFIED';
    return true;
  });

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchIssues} />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-primary">My Issues</h1>
          <p className="text-body-md text-on-surface-variant">Track the status of all issues you've reported.</p>
        </div>

        {/* Filters */}
        <div className="bg-surface border border-outline-variant rounded-lg p-1 flex">
          {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-label-md rounded-md transition-colors ${
                filter === f 
                  ? 'bg-primary-container text-on-primary-container font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <EmptyState 
          title="No issues found" 
          message={filter === 'ALL' ? "You haven't reported any issues yet." : `You have no ${filter.toLowerCase()} issues.`}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
