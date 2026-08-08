import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { useAuth } from '../contexts/AuthContext';
import type { Issue, Comment } from '../types';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { useToast } from '../components/Toast';
import FormField from '../components/FormField';

export default function IssueDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const [issueData, commentsData] = await Promise.all([
        issueService.getById(Number(id)),
        issueService.getComments(Number(id))
      ]);
      setIssue(issueData);
      setComments(commentsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load issue details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusUpdate = async (newStatus: Issue['status']) => {
    try {
      await issueService.update(Number(id), { status: newStatus });
      showToast(`Status updated to ${newStatus}`, 'success');
      fetchDetails();
    } catch (err) {
      showToast('Failed to update status', 'error');
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
    } catch (err) {
      showToast('Failed to post comment', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error || !issue) return <ErrorState message={error || 'Issue not found'} onRetry={fetchDetails} />;

  // History mock since the backend may not store detailed status timestamps yet
  // In a real app, this comes from a status_history table
  const mockHistory = [
    { status: 'PENDING' as const, date: issue.createdAt },
    ...(issue.status !== 'PENDING' ? [{ status: 'ASSIGNED' as const, date: issue.updatedAt }] : []),
    ...(issue.status === 'IN_PROGRESS' || issue.status === 'RESOLVED' || issue.status === 'VERIFIED' ? [{ status: 'IN_PROGRESS' as const, date: issue.updatedAt }] : []),
    ...(issue.status === 'RESOLVED' || issue.status === 'VERIFIED' ? [{ status: 'RESOLVED' as const, date: issue.resolvedAt || issue.updatedAt }] : []),
    ...(issue.status === 'VERIFIED' ? [{ status: 'VERIFIED' as const, date: issue.updatedAt }] : []),
  ];

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
        
        {/* Actions based on role and status */}
        <div className="flex gap-3">
          {user?.role === 'STUDENT' && issue.status === 'RESOLVED' && (
            <button onClick={() => handleStatusUpdate('VERIFIED')} className="btn-primary">
              <span className="material-symbols-outlined text-[20px]">verified</span>
              Verify Fix
            </button>
          )}
          {user?.role === 'STAFF' && issue.status === 'ASSIGNED' && (
            <button onClick={() => handleStatusUpdate('IN_PROGRESS')} className="btn-primary">
              <span className="material-symbols-outlined text-[20px]">engineering</span>
              Start Work
            </button>
          )}
          {user?.role === 'STAFF' && issue.status === 'IN_PROGRESS' && (
            <button onClick={() => handleStatusUpdate('RESOLVED')} className="btn-primary bg-[#10B981] hover:bg-[#059669]">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Mark Resolved
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
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
                  {issue.assignedToName || 'Unassigned'}
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="card p-6 md:p-8">
            <h3 className="text-headline-md font-bold text-primary mb-6">Discussion & Updates</h3>
            
            <div className="space-y-6 mb-8">
              {comments.map(comment => (
                <div key={comment.id} className={`flex gap-4 ${comment.isWorkNote ? 'bg-tertiary-fixed/30 p-4 rounded-lg' : ''}`}>
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
              {comments.length === 0 && (
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
          <div className="card p-6">
            <h3 className="text-headline-md font-bold text-primary mb-6">Issue Status</h3>
            <Timeline currentStatus={issue.status} history={mockHistory} />
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
