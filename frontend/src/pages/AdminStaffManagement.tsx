import { useState, useEffect } from 'react';
import { adminStaffService, type StaffManagementItem } from '../services/adminStaffService';
import StatCard from '../components/StatCard';
import { useToast } from '../components/Toast';

export default function AdminStaffManagement() {
  const [staffList, setStaffList] = useState<StaffManagementItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'ACTIVE' | 'DISABLED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'disable' | 'remove' | null;
    staff: StaffManagementItem | null;
  }>({ isOpen: false, action: null, staff: null });

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const data = await adminStaffService.getStaff();
      setStaffList(data);
    } catch (err) {
      showToast('Failed to load staff list', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await adminStaffService.approveStaff(id);
      showToast('Staff member approved successfully', 'success');
      fetchStaff();
    } catch (err) {
      showToast('Failed to approve staff member', 'error');
    }
  };

  const handleEnable = async (id: number) => {
    try {
      await adminStaffService.enableStaff(id);
      showToast('Staff member enabled successfully', 'success');
      fetchStaff();
    } catch (err) {
      showToast('Failed to enable staff member', 'error');
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.staff || !confirmModal.action) return;
    
    try {
      if (confirmModal.action === 'disable') {
        await adminStaffService.disableStaff(confirmModal.staff.id);
        showToast('Staff member disabled', 'success');
      } else if (confirmModal.action === 'remove') {
        await adminStaffService.removeStaff(confirmModal.staff.id);
        showToast('Staff member removed', 'success');
      }
      fetchStaff();
    } catch (err: any) {
      const msg = err.response?.data?.message || `Failed to ${confirmModal.action} staff member`;
      showToast(msg, 'error');
    } finally {
      setConfirmModal({ isOpen: false, action: null, staff: null });
    }
  };

  const filteredStaff = staffList
    .filter(s => filter === 'ALL' || s.accountStatus === filter)
    .filter(s => 
      s.fullName.toLowerCase().includes(search.toLowerCase()) || 
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.mobileNumber.toLowerCase().includes(search.toLowerCase())
    );

  const pendingCount = staffList.filter(s => s.accountStatus === 'PENDING_APPROVAL').length;
  const activeCount = staffList.filter(s => s.accountStatus === 'ACTIVE').length;
  const disabledCount = staffList.filter(s => s.accountStatus === 'DISABLED').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-bold text-on-surface">Staff Management</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Review and manage campus maintenance staff.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div onClick={() => setFilter('PENDING_APPROVAL')} className="cursor-pointer">
          <StatCard
            label="Pending Approval"
            value={pendingCount}
            icon="pending_actions"
            borderColor="border-[#f59e0b]"
            iconColor="text-[#f59e0b]"
          />
        </div>
        <div onClick={() => setFilter('ACTIVE')} className="cursor-pointer">
          <StatCard
            label="Active Staff"
            value={activeCount}
            icon="person_check"
            borderColor="border-[#10b981]"
            iconColor="text-[#10b981]"
          />
        </div>
        <div onClick={() => setFilter('DISABLED')} className="cursor-pointer">
          <StatCard
            label="Disabled Staff"
            value={disabledCount}
            icon="person_cancel"
            borderColor="border-error"
            iconColor="text-error"
          />
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-container-low rounded-t-2xl">
          <div className="flex space-x-1 bg-surface-container p-1 rounded-lg">
            {['ALL', 'PENDING_APPROVAL', 'ACTIVE', 'DISABLED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === f
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                {f === 'PENDING_APPROVAL' ? 'Pending' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-lowest text-on-surface-variant border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Active Tasks</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-[32px] mb-2">refresh</span>
                    <p>Loading staff...</p>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[48px] opacity-20 mb-2">group_off</span>
                    <p>No staff members found matching criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-on-surface">{staff.fullName}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">
                        Joined {new Date(staff.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface">{staff.email}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">{staff.mobileNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      {staff.accountStatus === 'PENDING_APPROVAL' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-warning-container text-on-warning-container">
                          <span className="material-symbols-outlined text-[14px]">pending</span>
                          Pending
                        </span>
                      )}
                      {staff.accountStatus === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Active
                        </span>
                      )}
                      {staff.accountStatus === 'DISABLED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-error/10 text-error">
                          <span className="material-symbols-outlined text-[14px]">block</span>
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${staff.activeIssuesCount > 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {staff.activeIssuesCount}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          ({staff.resolvedIssuesCount} resolved)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {staff.accountStatus === 'PENDING_APPROVAL' && (
                          <button
                            onClick={() => handleApprove(staff.id)}
                            className="btn-primary py-1.5 px-3 text-sm"
                          >
                            Approve
                          </button>
                        )}
                        {staff.accountStatus === 'ACTIVE' && (
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, action: 'disable', staff })}
                            className="btn-outline py-1.5 px-3 text-sm text-warning border-warning hover:bg-warning-container"
                          >
                            Disable
                          </button>
                        )}
                        {staff.accountStatus === 'DISABLED' && (
                          <button
                            onClick={() => handleEnable(staff.id)}
                            className="btn-outline py-1.5 px-3 text-sm text-success border-success hover:bg-success/10"
                          >
                            Enable
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmModal({ isOpen: true, action: 'remove', staff })}
                          className="p-1.5 text-error hover:bg-error-container rounded-lg transition-colors"
                          title="Remove Staff"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.staff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className={`p-6 ${confirmModal.action === 'remove' ? 'bg-error-container/30' : 'bg-warning-container/30'}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`material-symbols-outlined text-[32px] ${confirmModal.action === 'remove' ? 'text-error' : 'text-warning'}`}>
                  warning
                </span>
                <h3 className="text-title-lg font-bold text-on-surface">
                  {confirmModal.action === 'remove' ? 'Remove Staff Member' : 'Disable Staff Member'}
                </h3>
              </div>
              
              <p className="text-body-md text-on-surface-variant mb-4">
                Are you sure you want to {confirmModal.action} <strong>{confirmModal.staff.fullName}</strong>?
                {confirmModal.action === 'disable' && " They will not be able to log in until re-enabled."}
                {confirmModal.action === 'remove' && " Their account will be deactivated."}
              </p>

              {confirmModal.staff.activeIssuesCount > 0 && (
                <div className="bg-error/10 border border-error/30 text-error p-3 rounded-lg flex items-start gap-2 mb-2">
                  <span className="material-symbols-outlined text-[20px] shrink-0">assignment_late</span>
                  <div className="text-sm font-medium">
                    This staff member has {confirmModal.staff.activeIssuesCount} active assigned issues. 
                    {confirmModal.action === 'remove' 
                      ? ' You must reassign them before removing this account.' 
                      : ' Consider reassigning them.'}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-outline-variant flex justify-end gap-3 bg-surface">
              <button
                onClick={() => setConfirmModal({ isOpen: false, action: null, staff: null })}
                className="btn-outline px-5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={confirmModal.action === 'remove' && confirmModal.staff.activeIssuesCount > 0}
                className={`px-5 py-2 rounded-full font-medium transition-colors ${
                  confirmModal.action === 'remove'
                    ? (confirmModal.staff.activeIssuesCount > 0 
                        ? 'bg-outline-variant text-outline cursor-not-allowed' 
                        : 'bg-error text-on-error hover:bg-error/90 shadow-md')
                    : 'bg-warning text-on-warning hover:bg-warning/90 shadow-md'
                }`}
              >
                {confirmModal.action === 'remove' ? 'Remove Staff' : 'Disable Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
