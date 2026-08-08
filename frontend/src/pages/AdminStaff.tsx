import { useState, useEffect } from 'react';
import { staffService, type StaffMember } from '../services/staffService';
import StaffTable from '../components/StaffTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function AdminStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await staffService.getAll();
      setStaff(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load staff list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchStaff} />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-primary">Staff Management</h1>
          <p className="text-body-md text-on-surface-variant">View maintenance staff workload and availability.</p>
        </div>
        <button className="btn-primary" onClick={() => fetchStaff()}>
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Refresh Status
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="card p-4 flex items-center gap-4 border-l-4 border-[#10B981]">
          <div className="w-12 h-12 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center">
            <span className="material-symbols-outlined">how_to_reg</span>
          </div>
          <div>
            <div className="text-headline-md font-bold text-primary">{staff.filter(s => s.status === 'Available').length}</div>
            <div className="text-label-sm text-on-surface-variant">Available Now</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 border-l-4 border-error">
          <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
            <span className="material-symbols-outlined">engineering</span>
          </div>
          <div>
            <div className="text-headline-md font-bold text-primary">{staff.filter(s => s.status === 'Busy').length}</div>
            <div className="text-label-sm text-on-surface-variant">Currently Busy</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 border-l-4 border-outline">
          <div className="w-12 h-12 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center">
            <span className="material-symbols-outlined">coffee</span>
          </div>
          <div>
            <div className="text-headline-md font-bold text-primary">{staff.filter(s => s.status === 'On Break').length}</div>
            <div className="text-label-sm text-on-surface-variant">On Break</div>
          </div>
        </div>
      </div>

      <StaffTable staff={staff} />
    </div>
  );
}
