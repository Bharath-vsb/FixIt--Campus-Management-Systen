import type { IssueStatus } from '../types';

const statusConfig: Record<IssueStatus, { icon: string; text: string; bg: string; color: string }> = {
  PENDING: { icon: 'schedule', text: 'Pending', bg: 'bg-surface-container-highest', color: 'text-on-surface-variant' },
  ASSIGNED: { icon: 'assignment_ind', text: 'Assigned', bg: 'bg-primary-container', color: 'text-on-primary-container' },
  IN_PROGRESS: { icon: 'engineering', text: 'In Progress', bg: 'bg-tertiary-fixed', color: 'text-on-tertiary-fixed' },
  RESOLVED: { icon: 'check_circle', text: 'Resolved', bg: 'bg-status-low-bg', color: 'text-[#065F46]' },
  VERIFIED: { icon: 'verified', text: 'Verified', bg: 'bg-status-low-bg', color: 'text-[#065F46]' },
};

interface StatusBadgeProps {
  status: IssueStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-label-sm font-semibold ${config.bg} ${config.color}`}>
      <span className="material-symbols-outlined text-[16px]">{config.icon}</span>
      {config.text}
    </span>
  );
}
