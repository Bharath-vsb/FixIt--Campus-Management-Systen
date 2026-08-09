import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { staffService, type StaffMember } from '../services/staffService';
import type { Issue, IssueStatus } from '../types';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { useToast } from '../components/Toast';

export default function AdminCritical() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allIssues, staffData] = await Promise.all([
        issueService.getAll(),
        staffService.getAll()
      ]);
      const critical = allIssues
        .filter(i => i.priorityLevel === 'CRITICAL')
        .sort((a, b) => b.priorityScore - a.priorityScore);
      setIssues(critical);
      setStaff(staffData);
    } catch (err: any) {
      setError(err.message || 'Failed to load critical issues');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async (issueId: number, staffId: number) => {
    setAssigningId(issueId);
    try {
      await issueService.update(issueId, { assignedToId: staffId });
      showToast('Staff assigned successfully', 'success');
      fetchData();
    } catch {
      showToast('Failed to assign staff', 'error');
    } finally {
      setAssigningId(null);
    }
  };

  const activeCount = issues.filter(i => i.status !== 'RESOLVED' && i.status !== 'VERIFIED').length;

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-primary flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-[36px]">error</span>
            Critical Issues
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            CRITICAL priority issues requiring immediate admin attention.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className={`px-4 py-2 rounded-full font-bold text-label-md flex items-center gap-2 ${
            activeCount > 0 ? 'bg-error-container text-on-error-container' : 'bg-[#D1FAE5] text-[#065F46]'
          }`}>
            <span className="material-symbols-outlined text-[18px]">{activeCount > 0 ? 'warning' : 'check_circle'}</span>
            {activeCount > 0 ? `${activeCount} Unresolved` : 'All Resolved'}
          </div>
          <button onClick={fetchData} className="btn-secondary">
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      {issues.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-[#10B981] mb-3 block">check_circle</span>
          <h3 className="text-headline-md text-primary mb-1">No Critical Issues</h3>
          <p className="text-body-md text-on-surface-variant">There are currently no CRITICAL priority issues.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-level-1 border border-outline-variant overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-error-container/30 border-b border-outline-variant text-label-sm text-on-surface-variant uppercase tracking-wider">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold hidden md:table-cell">Location</th>
                <th className="p-4 font-semibold hidden sm:table-cell">Score</th>
                <th className="p-4 font-semibold hidden sm:table-cell">Affected</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold hidden lg:table-cell">Assigned To</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {issues.map(issue => (
                <tr key={issue.id} className="hover:bg-surface-container-lowest transition-colors border-l-4 border-error">
                  <td className="p-4 text-body-md font-medium text-primary-container">#{issue.id}</td>
                  <td className="p-4">
                    <div
                      className="text-body-md font-semibold text-primary hover:underline cursor-pointer"
                      onClick={() => navigate(`/admin/issues/${issue.id}`)}
                    >
                      {issue.title}
                    </div>
                    <div className="text-label-sm text-on-surface-variant mt-1">{issue.category}</div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-body-md text-on-surface">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant">location_on</span>
                      {issue.location}
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="font-bold text-error text-body-md">{issue.priorityScore}</span>
                    <span className="text-on-surface-variant text-label-sm">/100</span>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-body-md text-on-surface">
                    {issue.affectedPeople} people
                  </td>
                  <td className="p-4">
                    <StatusBadge status={issue.status} />
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <select
                      className="input-field py-1 px-2 text-label-sm min-w-[160px]"
                      value={issue.assignedTo || ''}
                      onChange={e => e.target.value && handleAssign(issue.id, Number(e.target.value))}
                      disabled={assigningId === issue.id}
                    >
                      <option value="">Unassigned</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.fullName} ({s.status})</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => navigate(`/admin/issues/${issue.id}`)}
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
