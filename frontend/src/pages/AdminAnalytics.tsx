import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

interface AnalyticsData {
  byStatus: {
    total: number;
    pending: number;
    assigned: number;
    inProgress: number;
    resolved: number;
    verified: number;
  };
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byCategory: { category: string; count: number }[];
  byLocation: { location: string; count: number }[];
  avgResolutionHours: number;
  totalResolved: number;
}

function BarRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-body-md text-on-surface">{label}</span>
        <span className="text-label-md font-bold text-primary">{count} <span className="text-on-surface-variant font-normal">({pct}%)</span></span>
      </div>
      <div className="w-full bg-surface-container-high rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getAnalytics();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error || !data) return <ErrorState message={error || 'No data'} onRetry={fetchData} />;

  const { byStatus, byPriority, byCategory, byLocation, avgResolutionHours, totalResolved } = data;
  const total = byStatus.total;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-primary">Analytics</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Real-time campus maintenance system insights.
          </p>
        </div>
        <button onClick={fetchData} className="btn-secondary self-start">
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Issues', value: total, color: 'border-primary', icon: 'list_alt' },
          { label: 'Active Issues', value: total - byStatus.resolved - byStatus.verified, color: 'border-[#f59e0b]', icon: 'engineering' },
          { label: 'Resolved', value: totalResolved, color: 'border-[#10B981]', icon: 'task_alt' },
          { label: 'Avg Resolution', value: avgResolutionHours > 0 ? `${avgResolutionHours}h` : 'N/A', color: 'border-secondary', icon: 'schedule' },
        ].map(card => (
          <div key={card.label} className={`bg-surface rounded-xl p-5 shadow-level-1 border-l-2 ${card.color} border border-outline-variant`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{card.label}</p>
              <span className="material-symbols-outlined text-outline opacity-50">{card.icon}</span>
            </div>
            <p className="text-display-lg text-primary font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Two-col grid */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Status Breakdown */}
        <div className="card p-6">
          <h2 className="text-headline-md font-bold text-primary mb-6">Issue Status Breakdown</h2>
          <div className="space-y-4">
            <BarRow label="Pending" count={byStatus.pending} total={total} color="bg-outline" />
            <BarRow label="Assigned" count={byStatus.assigned} total={total} color="bg-secondary" />
            <BarRow label="In Progress" count={byStatus.inProgress} total={total} color="bg-[#f59e0b]" />
            <BarRow label="Resolved" count={byStatus.resolved} total={total} color="bg-[#10B981]" />
            <BarRow label="Verified" count={byStatus.verified} total={total} color="bg-primary" />
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card p-6">
          <h2 className="text-headline-md font-bold text-primary mb-6">Priority Distribution</h2>
          <div className="space-y-4">
            <BarRow label="Critical" count={byPriority.critical} total={total} color="bg-error" />
            <BarRow label="High" count={byPriority.high} total={total} color="bg-[#f59e0b]" />
            <BarRow label="Medium" count={byPriority.medium} total={total} color="bg-secondary" />
            <BarRow label="Low" count={byPriority.low} total={total} color="bg-outline" />
          </div>
        </div>

        {/* By Category */}
        <div className="card p-6">
          <h2 className="text-headline-md font-bold text-primary mb-6">Issues by Category</h2>
          {byCategory.length === 0 ? (
            <p className="text-body-md text-on-surface-variant italic">No category data yet.</p>
          ) : (
            <div className="space-y-4">
              {byCategory.slice(0, 8).map(row => (
                <BarRow key={row.category} label={row.category} count={row.count} total={total} color="bg-primary" />
              ))}
            </div>
          )}
        </div>

        {/* By Location */}
        <div className="card p-6">
          <h2 className="text-headline-md font-bold text-primary mb-6">Issues by Location</h2>
          {byLocation.length === 0 ? (
            <p className="text-body-md text-on-surface-variant italic">No location data yet.</p>
          ) : (
            <div className="space-y-4">
              {byLocation.slice(0, 8).map(row => (
                <BarRow key={row.location} label={row.location} count={row.count} total={total} color="bg-secondary" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
