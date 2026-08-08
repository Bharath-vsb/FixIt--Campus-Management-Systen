import { Link } from 'react-router-dom';
import type { Issue } from '../types';
import PriorityBadge, { priorityStyles } from './PriorityBadge';
import StatusBadge from './StatusBadge';

interface IssueCardProps {
  issue: Issue;
  basePath?: string;
}

export default function IssueCard({ issue, basePath = '/student/issues' }: IssueCardProps) {
  const pStyle = priorityStyles[issue.priorityLevel];

  // Helper for progress bar percentage
  const getProgress = (status: string) => {
    switch (status) {
      case 'PENDING': return 25;
      case 'ASSIGNED': return 50;
      case 'IN_PROGRESS': return 75;
      case 'RESOLVED':
      case 'VERIFIED': return 100;
      default: return 0;
    }
  };

  return (
    <Link to={`${basePath}/${issue.id}`} className="block group">
      <div className={`card ${pStyle.border} border-l-4 hover:-translate-y-1 transition-transform duration-200 h-full flex flex-col`}>
        <div className="p-4 flex-grow flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <PriorityBadge level={issue.priorityLevel} />
            <StatusBadge status={issue.status} />
          </div>
          
          <div>
            <h3 className="text-headline-md text-primary line-clamp-2 group-hover:text-secondary-fixed transition-colors">
              {issue.title}
            </h3>
            <p className="text-body-md text-on-surface-variant line-clamp-2 mt-1">
              {issue.description}
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-2 text-label-sm text-on-surface-variant">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              <span>{issue.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">category</span>
              <span>{issue.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar footer */}
        <div className="bg-surface-container-lowest border-t border-outline-variant p-3">
          <div className="flex justify-between text-label-sm text-on-surface-variant mb-1">
            <span>Progress</span>
            <span>{getProgress(issue.status)}%</span>
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${issue.status === 'RESOLVED' || issue.status === 'VERIFIED' ? 'bg-[#10B981]' : 'bg-primary'}`}
              style={{ width: `${getProgress(issue.status)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
}
