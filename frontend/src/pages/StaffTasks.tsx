import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../services/issueService';
import type { Issue, IssueStatus } from '../types';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { useToast } from '../components/Toast';

type FilterTab = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'CRITICAL' | 'RESOLVED';

export default function StaffTasks() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await issueService.getAssignedIssues();
      setIssues(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
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

  const filteredIssues = issues.filter(issue => {
    switch (activeFilter) {
      case 'PENDING': return issue.status === 'PENDING' || issue.status === 'ASSIGNED';
      case 'IN_PROGRESS': return issue.status === 'IN_PROGRESS';
      case 'CRITICAL': return issue.priorityLevel === 'CRITICAL' || issue.priorityLevel === 'HIGH';
      case 'RESOLVED': return issue.status === 'RESOLVED' || issue.status === 'VERIFIED';
      default: return true;
    }
  });

  const tabs: { key: FilterTab; label: string; icon: string }[] = [
    { key: 'ALL', label: 'All', icon: 'list_alt' },
    { key: 'PENDING', label: 'Pending', icon: 'pending' },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: 'engineering' },
    { key: 'CRITICAL', label: 'Critical', icon: 'error' },
    { key: 'RESOLVED', label: 'Resolved', icon: 'task_alt' },
  ];

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchIssues} />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-headline-lg font-bold text-primary">My Tasks</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          View and manage your assigned maintenance tasks.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-label-md font-medium transition-all duration-150 ${
              activeFilter === tab.key
                ? 'bg-primary text-on-primary shadow-md scale-95'
                : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              activeFilter === tab.key ? 'bg-on-primary/20' : 'bg-surface-container-high'
            }`}>
              {tab.key === 'ALL' ? issues.length :
               tab.key === 'PENDING' ? issues.filter(i => i.status === 'PENDING' || i.status === 'ASSIGNED').length :
               tab.key === 'IN_PROGRESS' ? issues.filter(i => i.status === 'IN_PROGRESS').length :
               tab.key === 'CRITICAL' ? issues.filter(i => i.priorityLevel === 'CRITICAL' || i.priorityLevel === 'HIGH').length :
               issues.filter(i => i.status === 'RESOLVED' || i.status === 'VERIFIED').length}
            </span>
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-label-md text-on-surface-variant">
        Showing {filteredIssues.length} task{filteredIssues.length !== 1 ? 's' : ''}
      </p>

      {/* Task List */}
      {filteredIssues.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline mb-3 block">inbox</span>
          <h3 className="text-headline-md text-primary mb-1">No tasks found</h3>
          <p className="text-body-md text-on-surface-variant">
            {activeFilter === 'ALL'
              ? 'You have no assigned tasks at the moment.'
              : `No tasks in the "${tabs.find(t => t.key === activeFilter)?.label}" category.`}
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
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold hidden lg:table-cell">Updated</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredIssues.map(issue => (
                <tr key={issue.id} className="hover:bg-surface-container-lowest transition-colors group">
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
                    <StatusBadge status={issue.status} />
                  </td>
                  <td className="p-4 hidden lg:table-cell text-label-sm text-on-surface-variant">
                    {new Date(issue.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* View */}
                      <button
                        onClick={() => navigate(`/staff/tasks/${issue.id}`)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors inline-flex"
                        title="View Details"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>

                      {/* Start Work */}
                      {issue.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleStatusUpdate(issue.id, 'IN_PROGRESS')}
                          disabled={updatingId === issue.id}
                          className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1"
                          title="Start Work"
                        >
                          <span className="material-symbols-outlined text-[16px]">engineering</span>
                          Start
                        </button>
                      )}

                      {/* Resolve */}
                      {issue.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusUpdate(issue.id, 'RESOLVED')}
                          disabled={updatingId === issue.id}
                          className="px-3 py-1.5 text-xs rounded-lg font-medium bg-[#10B981] hover:bg-[#059669] text-white flex items-center gap-1 transition-colors"
                          title="Mark Resolved"
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
