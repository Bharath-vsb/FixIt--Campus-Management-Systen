import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../services/issueService';
import type { Issue } from '../types';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function StaffResolved() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await issueService.getAssignedIssues();
      const resolved = data.filter(
        i => i.status === 'RESOLVED' || i.status === 'VERIFIED'
      );
      // Sort by resolvedAt or updatedAt descending
      resolved.sort((a, b) => {
        const dateA = new Date(a.resolvedAt || a.updatedAt).getTime();
        const dateB = new Date(b.resolvedAt || b.updatedAt).getTime();
        return dateB - dateA;
      });
      setIssues(resolved);
    } catch (err: any) {
      setError(err.message || 'Failed to load resolved issues');
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-primary flex items-center gap-3">
            <span className="material-symbols-outlined text-[#10B981] text-[32px]">task_alt</span>
            Resolved Issues
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Your completed maintenance work history.
          </p>
        </div>
        <div className="bg-[#D1FAE5] text-[#065F46] px-4 py-2 rounded-full font-bold text-label-md flex items-center gap-2 self-start">
          <span className="material-symbols-outlined text-[18px]">done_all</span>
          {issues.length} Completed
        </div>
      </div>

      {/* Content */}
      {issues.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline mb-3 block">history</span>
          <h3 className="text-headline-md text-primary mb-1">No Resolved Issues Yet</h3>
          <p className="text-body-md text-on-surface-variant">
            Your completed maintenance tasks will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-level-1 border border-outline-variant overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm text-on-surface-variant uppercase tracking-wider">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold hidden md:table-cell">Category / Location</th>
                <th className="p-4 font-semibold hidden sm:table-cell">Priority</th>
                <th className="p-4 font-semibold">Resolution Date</th>
                <th className="p-4 font-semibold hidden lg:table-cell">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {issues.map(issue => (
                <tr key={issue.id} className="hover:bg-surface-container-lowest transition-colors border-l-4 border-[#10B981] opacity-90 hover:opacity-100">
                  <td className="p-4 text-body-md font-medium text-primary-container">#{issue.id}</td>
                  <td className="p-4">
                    <div
                      className="text-body-md font-semibold text-primary hover:underline cursor-pointer line-clamp-1"
                      onClick={() => navigate(`/staff/tasks/${issue.id}`)}
                    >
                      {issue.title}
                    </div>
                    <div className="text-label-sm text-on-surface-variant mt-1">
                      Assigned {new Date(issue.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="text-body-md text-on-surface">{issue.category}</div>
                    <div className="text-label-sm text-on-surface-variant flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {issue.location}
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <PriorityBadge level={issue.priorityLevel} />
                  </td>
                  <td className="p-4">
                    <div className="text-body-md text-on-surface font-medium">
                      {new Date(issue.resolvedAt || issue.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="text-label-sm text-on-surface-variant">
                      {new Date(issue.resolvedAt || issue.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className={`px-3 py-1 rounded-full text-label-sm font-bold ${
                      issue.status === 'VERIFIED'
                        ? 'bg-[#D1FAE5] text-[#065F46]'
                        : 'bg-[#D1FAE5] text-[#065F46]'
                    }`}>
                      {issue.status === 'VERIFIED' ? '✓ Verified' : '✓ Resolved'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => navigate(`/staff/tasks/${issue.id}`)}
                      className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors inline-flex"
                      title="View Details"
                    >
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
