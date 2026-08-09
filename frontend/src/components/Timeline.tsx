import type { IssueStatus } from '../types';

interface TimelineStep {
  status: IssueStatus;
  title: string;
  description: string;
  date?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface TimelineProps {
  currentStatus: IssueStatus;
  history?: { status: IssueStatus; date: string }[];
}

const statusOrder: IssueStatus[] = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED'];

const stepDetails: Record<IssueStatus, { title: string; desc: string; icon: string }> = {
  PENDING: { title: 'Issue Reported', desc: 'Awaiting triage and assignment', icon: 'report' },
  ASSIGNED: { title: 'Staff Assigned', desc: 'Maintenance team scheduled', icon: 'person_add' },
  IN_PROGRESS: { title: 'Work in Progress', desc: 'Team is currently fixing the issue', icon: 'engineering' },
  RESOLVED: { title: 'Issue Resolved', desc: 'Work completed, awaiting verification', icon: 'check_circle' },
  VERIFIED: { title: 'Verified', desc: 'Reporter confirmed the fix', icon: 'verified' },
};

export default function Timeline({ currentStatus, history = [] }: TimelineProps) {
  const currentIndex = statusOrder.indexOf(currentStatus);

  const steps: (TimelineStep & { icon: string })[] = statusOrder.map((status, index) => {
    const historyItem = history.find(h => h.status === status);
    return {
      status,
      title: stepDetails[status].title,
      description: stepDetails[status].desc,
      icon: stepDetails[status].icon,
      date: historyItem?.date,
      isCompleted: index <= currentIndex,
      isCurrent: index === currentIndex,
    };
  });

  return (
    <div className="relative border-l-2 border-outline-variant ml-4 space-y-6 pb-4">
      {steps.map((step) => (
        <div key={step.status} className="relative pl-6">
          {/* Icon Badge */}
          <div className={`absolute -left-[17px] p-1 rounded-full border-2 bg-surface ${
            step.isCurrent ? 'border-primary text-primary' :
            step.isCompleted ? 'border-[#10B981] text-[#10B981]' :
            'border-outline-variant text-outline-variant'
          }`}>
            <span className="material-symbols-outlined text-[16px] leading-none">
              {step.icon}
            </span>
          </div>

          <div>
            <h4 className={`text-label-md ${step.isCurrent || step.isCompleted ? 'text-primary' : 'text-on-surface-variant'}`}>
              {step.title}
            </h4>
            <p className="text-body-md text-on-surface-variant">{step.description}</p>
            {step.date && (
              <p className="text-label-sm text-outline mt-1">{new Date(step.date).toLocaleString()}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
