import { useState, useEffect } from 'react';
import { issueService } from '../services/issueService';
import type { Issue, PriorityLevel, IssueStatus } from '../types';
import IssueTable from '../components/IssueTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function StaffAllIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<PriorityLevel | ''>('');
  const [filterStatus, setFilterStatus] = useState<IssueStatus | ''>('');
  const [filterCategory, setFilterCategory] = useState('');

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

  // Derive unique categories from loaded issues
  const categories = Array.from(new Set(issues.map(i => i.category))).filter(Boolean);

  const filteredIssues = issues.filter(issue => {
    if (filterPriority && issue.priorityLevel !== filterPriority) return false;
    if (filterStatus && issue.status !== filterStatus) return false;
    if (filterCategory && issue.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !issue.title.toLowerCase().includes(q) &&
        !issue.location.toLowerCase().includes(q) &&
        !issue.category.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchIssues} />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-headline-lg font-bold text-primary">All Issues</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Browse and view all campus maintenance issues.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface rounded-xl p-4 shadow-level-1 border border-outline-variant">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Search</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Title, category, location..."
                className="input-field pl-10 py-1.5"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex-1">
            <label className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="input-field py-1.5"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex-1">
            <label className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Priority</label>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value as any)}
              className="input-field py-1.5"
            >
              <option value="">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex-1">
            <label className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Category</label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="input-field py-1.5"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Clear */}
          <div className="flex items-end">
            <button
              onClick={() => { setSearch(''); setFilterPriority(''); setFilterStatus(''); setFilterCategory(''); }}
              className="btn-secondary h-[38px]"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <p className="text-label-md text-on-surface-variant">
        Showing {filteredIssues.length} of {issues.length} issues
      </p>

      <IssueTable issues={filteredIssues} basePath="/staff/issues" />
    </div>
  );
}
