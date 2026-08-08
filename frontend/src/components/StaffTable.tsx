import type { StaffMember } from '../services/staffService';

interface StaffTableProps {
  staff: StaffMember[];
  onAssignTask?: (staffId: number) => void;
}

export default function StaffTable({ staff, onAssignTask }: StaffTableProps) {
  if (staff.length === 0) {
    return (
      <div className="bg-surface border border-outline-variant rounded-xl p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-outline mb-2">group</span>
        <h3 className="text-headline-md text-primary mb-1">No staff members</h3>
        <p className="text-body-md text-on-surface-variant">There are no staff members to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl shadow-level-1 border border-outline-variant overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm text-on-surface-variant uppercase tracking-wider">
            <th className="p-4 font-semibold">Staff Member</th>
            <th className="p-4 font-semibold">Contact</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold">Current Load</th>
            {onAssignTask && <th className="p-4 font-semibold text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {staff.map((member) => (
            <tr key={member.id} className="hover:bg-surface-container-lowest transition-colors group">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                    {member.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <div className="text-body-md font-semibold text-primary">{member.fullName}</div>
                    <div className="text-label-sm text-on-surface-variant">ID: #{member.id}</div>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="text-body-md text-on-surface">{member.email}</div>
              </td>
              <td className="p-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                  member.status === 'Available' ? 'bg-[#D1FAE5] text-[#065F46]' :
                  member.status === 'Busy' ? 'bg-error-container text-on-error-container' :
                  'bg-surface-container-highest text-on-surface'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    member.status === 'Available' ? 'bg-[#10B981]' :
                    member.status === 'Busy' ? 'bg-error' :
                    'bg-outline'
                  }`}></div>
                  {member.status}
                </span>
              </td>
              <td className="p-4">
                <div className="text-body-md font-medium text-primary-container">
                  {member.assignedCount} assigned
                </div>
                <div className="text-label-sm text-on-surface-variant">
                  {member.resolvedCount} resolved
                </div>
              </td>
              {onAssignTask && (
                <td className="p-4 text-right">
                  <button
                    onClick={() => onAssignTask(member.id)}
                    className="btn-secondary px-4 py-2"
                  >
                    Assign Task
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
