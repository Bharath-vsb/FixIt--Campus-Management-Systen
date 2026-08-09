import { useAuth } from '../contexts/AuthContext';

export default function AdminProfile() {
  const { user } = useAuth();

  const infoRows = [
    { icon: 'person', label: 'Full Name', value: user?.fullName || '—' },
    { icon: 'email', label: 'Email', value: user?.email || '—' },
    { icon: 'badge', label: 'Role', value: 'Administrator' },
    { icon: 'event', label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-headline-lg font-bold text-primary">Profile</h1>
        <p className="text-body-md text-on-surface-variant mt-1">Your administrator account information.</p>
      </div>

      {/* Avatar + Name Card */}
      <div className="bg-surface border border-outline-variant rounded-xl p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-3xl shrink-0">
          {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
        </div>
        <div>
          <h2 className="text-headline-md font-bold text-primary">{user?.fullName}</h2>
          <p className="text-body-md text-on-surface-variant">{user?.email}</p>
          <span className="mt-2 inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-label-sm font-bold">
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            System Administrator
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

      {/* Permissions Summary */}
      <div className="bg-primary-container border border-outline-variant rounded-xl p-6">
        <h3 className="font-bold text-on-primary-container mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined">security</span>
          Administrator Privileges
        </h3>
        <ul className="space-y-2 text-sm text-on-primary-container/80">
          {[
            'View and manage all campus issues',
            'Assign maintenance staff to issues',
            'Manage staff accounts and workloads',
            'Manage issue categories and locations',
            'View system-wide analytics',
            'Monitor issue resolution across campus',
          ].map(priv => (
            <li key={priv} className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">check_circle</span>
              {priv}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
