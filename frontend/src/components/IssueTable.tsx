import { Link } from 'react-router-dom';
import type { Issue } from '../types';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

interface IssueTableProps {
  issues: Issue[];
  basePath?: string;
  onAssign?: (issueId: number) => void;
}

export default function IssueTable({ issues, basePath = '/admin/issues', onAssign }: IssueTableProps) {
  if (issues.length === 0) {
    return (
      <div className="bg-surface border border-outline-variant rounded-xl p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-outline mb-2">inbox</span>
        <h3 className="text-headline-md text-primary mb-1">No issues found</h3>
        <p className="text-body-md text-on-surface-variant">There are currently no issues matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl shadow-level-1 border border-outline-variant overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm text-on-surface-variant uppercase tracking-wider">
            <th className="p-4 font-semibold">ID</th>
            <th className="p-4 font-semibold">Title</th>
            <th className="p-4 font-semibold">Category / Location</th>
            <th className="p-4 font-semibold">Priority</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {issues.map((issue) => (
            <tr key={issue.id} className="hover:bg-surface-container-lowest transition-colors group">
              <td className="p-4 text-body-md font-medium text-primary-container">#{issue.id}</td>
              <td className="p-4">
                <Link to={`${basePath}/${issue.id}`} className="text-body-md font-semibold text-primary hover:underline line-clamp-1">
                  {issue.title}
                </Link>
                <div className="text-label-sm text-on-surface-variant mt-1">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td className="p-4">
                <div className="text-body-md text-on-surface">{issue.category}</div>
                <div className="text-label-sm text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {issue.location}
                </div>
              </td>
              <td className="p-4">
                <PriorityBadge level={issue.priorityLevel} />
              </td>
              <td className="p-4">
                <StatusBadge status={issue.status} />
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  {onAssign && issue.status === 'PENDING' && (
                    <button
                      onClick={() => onAssign(issue.id)}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Assign
                    </button>
                  )}
                  <Link
                    to={`${basePath}/${issue.id}`}
                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors inline-flex"
                    title="View Details"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
