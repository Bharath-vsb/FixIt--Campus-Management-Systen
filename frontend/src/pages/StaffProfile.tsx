import { useAuth } from '../contexts/AuthContext';

export default function StaffProfile() {
  const { user } = useAuth();

  const infoRows = [
    { icon: 'person', label: 'Full Name', value: user?.fullName || '—' },
    { icon: 'email', label: 'Email', value: user?.email || '—' },
    { icon: 'badge', label: 'Role', value: user?.role || '—' },
    { icon: 'event', label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-headline-lg font-bold text-primary">Profile</h1>
        <p className="text-body-md text-on-surface-variant mt-1">Your account information.</p>
      </div>

      {/* Avatar + Name Card */}
      <div className="bg-surface border border-outline-variant rounded-xl p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-3xl shrink-0">
          {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <h2 className="text-headline-md font-bold text-primary">{user?.fullName}</h2>
          <p className="text-body-md text-on-surface-variant">{user?.email}</p>
          <span className="mt-2 inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-sm font-bold">
            <span className="material-symbols-outlined text-[16px]">engineering</span>
            Maintenance Staff
          </span>
        </div>
      </div>

      {/* Info Table */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <h3 className="text-headline-md font-bold text-primary">Account Details</h3>
        </div>
        <div className="divide-y divide-outline-variant">
          {infoRows.map(row => (
            <div key={row.label} className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">{row.icon}</span>
                <span className="text-label-md">{row.label}</span>
              </div>
              <span className="font-semibold text-primary text-body-md">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Badge */}
      <div className="bg-[#D1FAE5] border border-[#A7F3D0] rounded-xl p-6 flex items-center gap-4">
        <div className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse"></div>
        <div>
          <p className="font-bold text-[#065F46]">Available for Tasks</p>
          <p className="text-sm text-[#047857]">You are currently active in the maintenance system.</p>
        </div>
      </div>
    </div>
  );
}
