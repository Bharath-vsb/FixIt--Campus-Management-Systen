import type { PriorityLevel } from '../types';

const priorityStyles: Record<PriorityLevel, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'bg-error-container', text: 'text-on-error-container', border: 'border-error' },
  HIGH: { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-fixed', border: 'border-tertiary-fixed-dim' },
  MEDIUM: { bg: 'bg-secondary-container', text: 'text-on-secondary-container', border: 'border-secondary' },
  LOW: { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]', border: 'border-[#10B981]' },
};

interface PriorityBadgeProps {
  level: PriorityLevel;
  size?: 'sm' | 'md';
}

export default function PriorityBadge({ level, size = 'sm' }: PriorityBadgeProps) {
  const style = priorityStyles[level] || priorityStyles.LOW;

  return (
    <span className={`inline-flex items-center ${style.bg} ${style.text} ${
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-label-sm px-2.5 py-1'
    } font-bold rounded-full uppercase tracking-wider`}>
      {level}
    </span>
  );
}

export { priorityStyles };
