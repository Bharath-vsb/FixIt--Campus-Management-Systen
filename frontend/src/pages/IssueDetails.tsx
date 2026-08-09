import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { staffService, type StaffMember } from '../services/staffService';
import { useAuth } from '../contexts/AuthContext';
import type { Issue, Comment } from '../types';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { useToast } from '../components/Toast';
import FormField from '../components/FormField';
import PhotoUpload from '../components/PhotoUpload';
import EvidencePanel from '../components/EvidencePanel';

// ─────────────────────────────────────────────────────────────────────────────
// Real timeline builder — no mock data
// ─────────────────────────────────────────────────────────────────────────────
interface TimelineEvent {
  id: string;
  icon: string;
  label: string;
  description: string;
  date?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isPhotoEvent?: boolean;
}

const STATUS_ORDER = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED'];

function buildTimeline(
  issue: Issue,
  comments: Comment[],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const currentIdx = STATUS_ORDER.indexOf(issue.status);

  // 1. Reported
  events.push({
    id: 'pending',
    icon: 'report',
    label: 'Issue Reported',
    description: 'Awaiting triage and assignment',
    date: issue.createdAt,
    isCompleted: true,
    isCurrent: issue.status === 'PENDING',
  });

  // 2. Problem photo uploaded (from evidence data)
  const problemPhoto = issue.problemEvidence?.[0];
  if (problemPhoto) {
    events.push({
      id: 'problem-photo',
      icon: 'photo_camera',
      label: '📷 Problem photo uploaded',
      description: `By ${problemPhoto.uploadedByName}`,
      date: problemPhoto.createdAt,
      isCompleted: true,
      isCurrent: false,
      isPhotoEvent: true,
    });
  }

  // 3. Assigned
  if (currentIdx >= STATUS_ORDER.indexOf('ASSIGNED')) {
    events.push({
      id: 'assigned',
      icon: 'person_add',
      label: 'Staff Assigned',
      description: issue.assignedToName
        ? `Assigned to ${issue.assignedToName}`
        : 'Maintenance team scheduled',
      date: issue.updatedAt,
      isCompleted: currentIdx >= STATUS_ORDER.indexOf('ASSIGNED'),
      isCurrent: issue.status === 'ASSIGNED',
    });
  }

  // 4. In Progress
  if (currentIdx >= STATUS_ORDER.indexOf('IN_PROGRESS')) {
    events.push({
      id: 'in-progress',
      icon: 'engineering',
      label: 'Work in Progress',
      description: 'Team is currently fixing the issue',
      date: issue.updatedAt,
      isCompleted: currentIdx >= STATUS_ORDER.indexOf('IN_PROGRESS'),
      isCurrent: issue.status === 'IN_PROGRESS',
    });
  }

  // 5. Rework requested (if reworkNotes present and IN_PROGRESS)
  if (issue.reworkNotes && issue.status === 'IN_PROGRESS') {
    events.push({
      id: 'rework',
      icon: 'undo',
      label: '⚠ Rework Requested',
      description: issue.reworkNotes,
      isCompleted: true,
      isCurrent: false,
    });
  }

  // 6. Work notes from comments
  const workNotes = comments.filter(c => c.isWorkNote);
  workNotes.forEach((wn, i) => {
    events.push({
      id: `work-note-${i}`,
      icon: 'note',
      label: '📝 Work note added',
      description: wn.content.length > 60 ? wn.content.slice(0, 60) + '…' : wn.content,
      date: wn.createdAt,
      isCompleted: true,
      isCurrent: false,
    });
  });

  // 7. Resolution photo
  const resolutionPhoto = issue.resolutionEvidence?.[0];
  if (resolutionPhoto) {
    events.push({
      id: 'resolution-photo',
      icon: 'photo_camera',
      label: '📷 Resolution photo uploaded',
      description: `By ${resolutionPhoto.uploadedByName}`,
      date: resolutionPhoto.createdAt,
      isCompleted: true,
      isCurrent: false,
      isPhotoEvent: true,
    });
  }

  // 8. Resolved
  if (currentIdx >= STATUS_ORDER.indexOf('RESOLVED')) {
    events.push({
      id: 'resolved',
      icon: 'check_circle',
      label: 'Issue Resolved',
      description: 'Work completed, awaiting verification',
      date: issue.resolvedAt ?? issue.updatedAt,
      isCompleted: currentIdx >= STATUS_ORDER.indexOf('RESOLVED'),
      isCurrent: issue.status === 'RESOLVED',
    });
  }

  // 9. Verified
  if (issue.status === 'VERIFIED') {
    events.push({
      id: 'verified',
      icon: 'verified',
      label: 'Verified',
      description: issue.verifiedByName
        ? `Verified by ${issue.verifiedByName}`
        : 'Admin confirmed the fix',
      date: issue.verifiedAt,
      isCompleted: true,
      isCurrent: true,
    });
  }

  return events;
}

// ─────────────────────────────────────────────────────────────────────────────
// Timeline renderer
// ─────────────────────────────────────────────────────────────────────────────
function RealTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative border-l-2 border-outline-variant ml-4 space-y-5 pb-4">
      {events.map((step) => (
        <div key={step.id} className="relative pl-6">
          <div className={`absolute -left-[17px] p-1 rounded-full border-2 bg-surface ${
            step.isPhotoEvent
              ? 'border-[#6366F1] text-[#6366F1]'
              : step.isCurrent
              ? 'border-primary text-primary'
              : step.isCompleted
              ? 'border-[#10B981] text-[#10B981]'
              : 'border-outline-variant text-outline-variant'
          }`}>
            <span className="material-symbols-outlined text-[16px] leading-none">
              {step.icon}
            </span>
          </div>
          <div>
            <h4 className={`text-label-md ${step.isCurrent || step.isCompleted ? 'text-primary' : 'text-on-surface-variant'}`}>
              {step.label}
            </h4>
            <p className="text-body-md text-on-surface-variant">{step.description}</p>
            {step.date && (
              <p className="text-label-sm text-outline mt-0.5">
                {new Date(step.date).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function IssueDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Staff resolution state
  const [resolutionPhoto, setResolutionPhoto] = useState<File | null>(null);
  const [resolutionPhotoError, setResolutionPhotoError] = useState<string | null>(null);
  const [workNote, setWorkNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Admin verify/rework state
  const [reworkReason, setReworkReason] = useState('');
  const [showReworkForm, setShowReworkForm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRequestingRework, setIsRequestingRework] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const [issueData, commentsData] = await Promise.all([
        issueService.getById(Number(id)),
        issueService.getComments(Number(id)),
      ]);
      setIssue(issueData);
      setComments(commentsData);

      if (user?.role === 'ADMIN') {
        const staffData = await staffService.getAll();
        setStaff(staffData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load issue details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); }, [id]);

  const handleAssign = async (staffId: number) => {
    try {
      await issueService.update(Number(id), { assignedToId: staffId });
      showToast('Issue assigned successfully', 'success');
      fetchDetails();
    } catch {
      showToast('Failed to assign issue', 'error');
    }
  };

  const handleStartWork = async () => {
    try {
      await issueService.update(Number(id), { status: 'IN_PROGRESS' });
      showToast('Status updated to IN_PROGRESS', 'success');
      fetchDetails();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleMarkResolved = async () => {
    setResolutionPhotoError(null);

    if (!resolutionPhoto) {
      setResolutionPhotoError('Please upload a photo of the completed work before resolving.');
      return;
    }

    setIsResolving(true);
    try {
      // 1. Upload resolution evidence
      await issueService.uploadResolutionEvidence(Number(id), resolutionPhoto);

      // 2. If work note provided, post it
      if (workNote.trim()) {
        await issueService.addComment(Number(id), workNote.trim(), true);
      }

      // 3. Mark RESOLVED — backend will verify resolution evidence exists
      await issueService.update(Number(id), { status: 'RESOLVED' });
      showToast('Issue marked as resolved!', 'success');
      setResolutionPhoto(null);
      setWorkNote('');
      fetchDetails();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to resolve issue.';
      showToast(typeof msg === 'string' ? msg : 'Failed to resolve issue.', 'error');
    } finally {
      setIsResolving(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await issueService.verify(Number(id));
      showToast('Issue verified successfully!', 'success');
      fetchDetails();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to verify issue.';
      showToast(typeof msg === 'string' ? msg : 'Failed to verify issue.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRequestRework = async () => {
    if (!reworkReason.trim()) {
      showToast('Please provide a reason for rework.', 'error');
      return;
    }
    setIsRequestingRework(true);
    try {
      await issueService.requestRework(Number(id), reworkReason.trim());
      showToast('Rework requested — issue sent back to staff.', 'info');
      setReworkReason('');
      setShowReworkForm(false);
      fetchDetails();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to request rework.';
      showToast(typeof msg === 'string' ? msg : 'Failed to request rework.', 'error');
    } finally {
      setIsRequestingRework(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      await issueService.addComment(Number(id), newComment, false);
      setNewComment('');
      fetchDetails();
    } catch {
      showToast('Failed to post comment', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error || !issue) return <ErrorState message={error || 'Issue not found'} onRetry={fetchDetails} />;

  const timelineEvents = buildTimeline(issue, comments);
  const isAdminResolved = user?.role === 'ADMIN' && issue.status === 'RESOLVED';
  const isStaffInProgress = user?.role === 'STAFF' && issue.status === 'IN_PROGRESS';
  const workNoteComments = comments.filter(c => c.isWorkNote);
  const discussionComments = comments.filter(c => !c.isWorkNote);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="text-primary font-semibold hover:underline flex items-center gap-1 mb-4">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Issues
          </button>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-headline-lg font-bold text-primary">Issue #{issue.id}</h1>
            <PriorityBadge level={issue.priorityLevel} size="md" />
            <StatusBadge status={issue.status} />
          </div>
          <p className="text-body-lg text-on-surface-variant max-w-3xl">{issue.title}</p>
        </div>

        {/* Top-level actions */}
        <div className="flex gap-3">
          {user?.role === 'STAFF' && issue.status === 'ASSIGNED' && (
            <button onClick={handleStartWork} className="btn-primary">
              <span className="material-symbols-outlined text-[20px]">engineering</span>
              Start Work
            </button>
          )}
        </div>
      </div>

      {/* Rework banner */}
      {issue.reworkNotes && issue.status === 'IN_PROGRESS' && (
        <div className="bg-warning-container/20 border border-warning rounded-xl p-4 flex gap-3">
          <span className="material-symbols-outlined text-warning">warning</span>
          <div>
            <p className="font-semibold text-on-surface">⚠ Rework Requested by Admin</p>
            <p className="text-body-md text-on-surface-variant mt-1">{issue.reworkNotes}</p>
          </div>
        </div>
      )}

      {/* Verified banner */}
      {issue.status === 'VERIFIED' && (
        <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-4 flex gap-3 items-center">
          <span className="material-symbols-outlined text-[#10B981] text-[28px]">verified</span>
          <div>
            <p className="font-semibold text-[#10B981]">✓ Issue Verified</p>
            {issue.verifiedByName && (
              <p className="text-body-md text-on-surface-variant">
                Verified by <strong>{issue.verifiedByName}</strong>
                {issue.verifiedAt && ` on ${new Date(issue.verifiedAt).toLocaleString()}`}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-6 md:p-8">
            <h3 className="text-headline-md font-bold text-primary mb-4">Description</h3>
            <p className="text-body-md text-on-surface-variant whitespace-pre-wrap">{issue.description}</p>

            <div className="grid sm:grid-cols-2 gap-6 mt-8 pt-6 border-t border-outline-variant">
              <div>
                <span className="text-label-sm text-outline uppercase tracking-wider block mb-1">Reported By</span>
                <div className="flex items-center gap-2 text-primary font-medium">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  {issue.reportedByName}
                </div>
              </div>
              <div>
                <span className="text-label-sm text-outline uppercase tracking-wider block mb-1">Assigned To</span>
                <div className="flex items-center gap-2 text-primary font-medium">
                  <span className="material-symbols-outlined text-[18px]">engineering</span>
                  {user?.role === 'ADMIN' ? (
                    <select
                      className="input-field py-1 px-2 min-w-[200px]"
                      value={issue.assignedToId || ''}
                      onChange={(e) => handleAssign(Number(e.target.value))}
                    >
                      <option value="" disabled>Unassigned</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.fullName} ({s.status})</option>
                      ))}
                    </select>
                  ) : (
                    issue.assignedToName || 'Unassigned'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Section */}
          {(issue.problemEvidence?.length > 0 || issue.resolutionEvidence?.length > 0) && (
            <div className="card p-6 md:p-8">
              {isAdminResolved ? (
                <>
                  <h3 className="text-headline-md font-bold text-primary mb-6">
                    📷 Evidence Comparison
                  </h3>
                  <EvidencePanel
                    problemEvidence={issue.problemEvidence}
                    resolutionEvidence={issue.resolutionEvidence}
                    layout="comparison"
                  />

                  {/* Work Notes for Admin */}
                  {workNoteComments.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-outline-variant">
                      <h4 className="text-label-md font-bold text-primary mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">note</span>
                        Work Notes from Staff
                      </h4>
                      <div className="space-y-3">
                        {workNoteComments.map(wn => (
                          <div key={wn.id} className="bg-tertiary-fixed/20 rounded-lg p-4 border-l-4 border-primary">
                            <p className="text-body-md text-on-surface">{wn.content}</p>
                            <p className="text-label-sm text-outline mt-1">
                              {wn.userName} · {new Date(wn.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div className="mt-6 pt-6 border-t border-outline-variant">
                    <h4 className="text-label-md font-bold text-on-surface mb-4">Admin Verification</h4>
                    <p className="text-body-md text-on-surface-variant mb-4">
                      Review the evidence above and verify the resolution or request rework if the fix is insufficient.
                    </p>

                    {showReworkForm ? (
                      <div className="space-y-3">
                        <FormField
                          label="Reason for Rework"
                          as="textarea"
                          rows={3}
                          value={reworkReason}
                          onChange={(e) => setReworkReason(e.target.value)}
                          placeholder="Describe what needs to be done differently..."
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleRequestRework}
                            disabled={isRequestingRework || !reworkReason.trim()}
                            className="btn-primary bg-warning hover:bg-warning/90"
                          >
                            {isRequestingRework ? 'Sending…' : 'Send Rework Request'}
                          </button>
                          <button onClick={() => setShowReworkForm(false)} className="btn-secondary">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setShowReworkForm(true)}
                          className="btn-secondary border-warning text-warning hover:bg-warning/10"
                        >
                          <span className="material-symbols-outlined text-[20px]">undo</span>
                          Request Rework
                        </button>
                        <button
                          onClick={handleVerify}
                          disabled={isVerifying}
                          className="btn-primary bg-[#10B981] hover:bg-[#059669]"
                        >
                          <span className="material-symbols-outlined text-[20px]">verified</span>
                          {isVerifying ? 'Verifying…' : '✓ Verify Resolution'}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-headline-md font-bold text-primary mb-6">📷 Evidence</h3>
                  <EvidencePanel
                    problemEvidence={issue.problemEvidence}
                    resolutionEvidence={issue.resolutionEvidence}
                    layout="stacked"
                  />
                </>
              )}
            </div>
          )}

          {/* Student view: show just problem evidence if no resolution yet */}
          {issue.problemEvidence?.length > 0 && issue.resolutionEvidence?.length === 0 &&
           !isAdminResolved && user?.role === 'STUDENT' && (
            <div className="card p-6 md:p-8">
              <h3 className="text-headline-md font-bold text-primary mb-4">📷 Problem Evidence</h3>
              <EvidencePanel
                problemEvidence={issue.problemEvidence}
                resolutionEvidence={[]}
                layout="stacked"
              />
            </div>
          )}

          {/* Staff resolution workflow */}
          {isStaffInProgress && (
            <div className="card p-6 md:p-8">
              {/* Show problem photo to staff */}
              {issue.problemEvidence?.length > 0 && (
                <div className="mb-6 pb-6 border-b border-outline-variant">
                  <h3 className="text-headline-md font-bold text-primary mb-2">📷 Problem to Fix</h3>
                  <p className="text-body-md text-on-surface-variant mb-4">
                    This is what was reported by the student.
                  </p>
                  <EvidencePanel
                    problemEvidence={issue.problemEvidence}
                    resolutionEvidence={[]}
                    layout="stacked"
                  />
                </div>
              )}

              <h3 className="text-headline-md font-bold text-primary mb-4">📷 Mark as Resolved</h3>
              <p className="text-body-md text-on-surface-variant mb-6">
                Upload a photo of the completed work and add a work note, then mark the issue as resolved.
              </p>

              <div className="space-y-6">
                <PhotoUpload
                  label="Resolution Photo (Required)"
                  hint="Take or upload a clear photo showing the completed repair."
                  currentFile={resolutionPhoto}
                  onFileSelected={(f) => {
                    setResolutionPhoto(f);
                    if (f) setResolutionPhotoError(null);
                  }}
                  error={resolutionPhotoError}
                  captureCamera
                />

                <FormField
                  label="Work Note"
                  as="textarea"
                  rows={3}
                  value={workNote}
                  onChange={(e) => setWorkNote(e.target.value)}
                  placeholder="Describe what you fixed and how (e.g., Replaced faulty wiring and tested circuit)..."
                  helperText="Optional but highly recommended"
                />

                <button
                  onClick={handleMarkResolved}
                  disabled={isResolving}
                  className="btn-primary bg-[#10B981] hover:bg-[#059669] w-full md:w-auto"
                >
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  {isResolving ? 'Resolving…' : 'Mark as Resolved'}
                </button>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="card p-6 md:p-8">
            <h3 className="text-headline-md font-bold text-primary mb-6">Discussion & Updates</h3>

            <div className="space-y-6 mb-8">
              {discussionComments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0">
                    {comment.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-primary">{comment.userName}</span>
                      <span className="text-xs bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface-variant">{comment.userRole}</span>
                      <span className="text-label-sm text-outline ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-body-md text-on-surface-variant">{comment.content}</p>
                  </div>
                </div>
              ))}
              {discussionComments.length === 0 && (
                <p className="text-body-md text-outline italic">No updates yet.</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0">
                {user?.fullName.charAt(0)}
              </div>
              <div className="flex-grow">
                <FormField
                  label=""
                  as="textarea"
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment or update..."
                  className="mb-2"
                />
                <div className="flex justify-end">
                  <button type="submit" disabled={isSubmittingComment || !newComment.trim()} className="btn-primary">
                    Post
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Real Timeline */}
          <div className="card p-6">
            <h3 className="text-headline-md font-bold text-primary mb-6">Issue Timeline</h3>
            <RealTimeline events={timelineEvents} />
          </div>

          <div className="card p-6">
            <h3 className="text-headline-md font-bold text-primary mb-4">Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-outline-variant">
                <span className="text-label-md text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">category</span> Category
                </span>
                <span className="font-semibold text-primary">{issue.category}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant">
                <span className="text-label-md text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">location_on</span> Location
                </span>
                <span className="font-semibold text-primary">{issue.location}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant">
                <span className="text-label-md text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">groups</span> Affected
                </span>
                <span className="font-semibold text-primary">{issue.affectedPeople} people</span>
              </div>
            </div>

            {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
              <div className="mt-6 pt-6 border-t border-outline-variant">
                <h4 className="text-label-md font-bold text-primary mb-3">Priority Factors</h4>
                <ul className="space-y-2">
                  {issue.priorityFactors?.map((factor, i) => (
                    <li key={i} className="text-label-sm text-on-surface-variant flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">add</span>
                      {factor}
                    </li>
                  ))}
                  <li className="text-label-md font-bold text-primary flex justify-between mt-4">
                    Total Score: <span>{issue.priorityScore}/100</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
