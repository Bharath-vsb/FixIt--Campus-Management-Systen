import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../services/issueService';
import type { Issue, IssueStatus } from '../types';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

export default function StaffCritical() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await issueService.getAll();
      // Show only CRITICAL and HIGH priority issues
      const critical = data.filter(
        i => i.priorityLevel === 'CRITICAL' || i.priorityLevel === 'HIGH'
      );
      // Sort by priority score descending
      critical.sort((a, b) => b.priorityScore - a.priorityScore);
      setIssues(critical);
    } catch (err: any) {
      setError(err.message || 'Failed to load critical issues');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleStatusUpdate = async (issueId: number, newStatus: IssueStatus) => {
    setUpdatingId(issueId);
    try {
      await issueService.update(issueId, { status: newStatus });
      showToast(`Status updated to ${newStatus.replace('_', ' ')}`, 'success');
      fetchIssues();
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const isMyIssue = (issue: Issue) => issue.assignedTo === user?.id;

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchIssues} />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-primary flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-[32px]">error</span>
            Critical Issues
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            High and critical priority issues requiring urgent attention.
          </p>
        </div>
        <div className="bg-error-container text-on-error-container px-4 py-2 rounded-full font-bold text-label-md flex items-center gap-2 self-start">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          {issues.filter(i => i.status !== 'RESOLVED' && i.status !== 'VERIFIED').length} Active
        </div>
      </div>

      {/* Issue Cards */}
      {issues.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-[#10B981] mb-3 block">check_circle</span>
          <h3 className="text-headline-md text-primary mb-1">No Critical Issues</h3>
          <p className="text-body-md text-on-surface-variant">
            There are currently no high or critical priority issues.
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-level-1 border border-outline-variant overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm text-on-surface-variant uppercase tracking-wider">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold hidden md:table-cell">Location</th>
                <th className="p-4 font-semibold hidden sm:table-cell">Priority</th>
                <th className="p-4 font-semibold hidden lg:table-cell">Score</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold hidden lg:table-cell">Assigned To</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {issues.map(issue => (
                <tr
                  key={issue.id}
                  className={`hover:bg-surface-container-lowest transition-colors group ${
                    issue.priorityLevel === 'CRITICAL' ? 'border-l-4 border-error' : 'border-l-4 border-[#f59e0b]'
                  }`}
                >
                  <td className="p-4 text-body-md font-medium text-primary-container">#{issue.id}</td>
                  <td className="p-4">
                    <div
                      className="text-body-md font-semibold text-primary hover:underline cursor-pointer line-clamp-1"
                      onClick={() => navigate(`/staff/issues/${issue.id}`)}
                    >
                      {issue.title}
                    </div>
                    <div className="text-label-sm text-on-surface-variant mt-1">{issue.category}</div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="text-body-md text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant">location_on</span>
                      {issue.location}
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <PriorityBadge level={issue.priorityLevel} />
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="font-bold text-primary">{issue.priorityScore}</span>
                    <span className="text-on-surface-variant text-label-sm">/100</span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={issue.status} />
                  </td>
                  <td className="p-4 hidden lg:table-cell text-body-md text-on-surface-variant">
                    {issue.assignedToName || (
                      <span className="text-outline italic">Unassigned</span>
                    )}
                    {isMyIssue(issue) && (
                      <span className="ml-2 text-xs bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold">
                        You
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/staff/issues/${issue.id}`)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors inline-flex"
                        title="View Details"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>

                      {/* Only allow workflow actions on own assigned issues */}
                      {isMyIssue(issue) && issue.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleStatusUpdate(issue.id, 'IN_PROGRESS')}
                          disabled={updatingId === issue.id}
                          className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">engineering</span>
                          Start
                        </button>
                      )}
                      {isMyIssue(issue) && issue.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusUpdate(issue.id, 'RESOLVED')}
                          disabled={updatingId === issue.id}
                          className="px-3 py-1.5 text-xs rounded-lg font-medium bg-[#10B981] hover:bg-[#059669] text-white flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Resolve
                        </button>
                      )}
                    </div>
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
