import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import PhotoUpload from '../components/PhotoUpload';
import { issueService } from '../services/issueService';
import type { UrgencyLevel } from '../types';
import { useToast } from '../components/Toast';

export default function ReportIssue() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel | ''>('');
  const [affectedPeople, setAffectedPeople] = useState<number | ''>('');

  // Photo state
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhotoError(null);

    if (!title || !category || !location || !description || !urgency || affectedPeople === '') {
      setError('Please fill in all required fields.');
      return;
    }

    if (!photo) {
      setPhotoError('Please upload a photo of the issue before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await issueService.create(
        {
          title,
          category,
          location,
          description,
          urgency: urgency as UrgencyLevel,
          affectedPeople: Number(affectedPeople),
        },
        photo
      );

      if (response.possibleDuplicate) {
        showToast('Issue submitted, but marked as a possible duplicate.', 'info');
      } else {
        showToast('Issue reported successfully!', 'success');
      }

      navigate(`/student/issues/${response.issue.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to report issue. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Failed to report issue.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-headline-lg font-bold text-primary mb-2">Report an Issue</h1>
        <p className="text-body-md text-on-surface-variant">
          Please provide as much detail as possible to help us resolve the problem quickly.
        </p>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container p-4 rounded-xl mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        {/* Form Container */}
        <div className="card p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Issue Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Leaking pipe in bathroom"
              required
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                label="Category"
                as="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'Plumbing', label: 'Plumbing' },
                  { value: 'Electrical', label: 'Electrical' },
                  { value: 'HVAC', label: 'HVAC / Climate' },
                  { value: 'Carpentry', label: 'Carpentry / Furniture' },
                  { value: 'Cleaning', label: 'Cleaning / Janitorial' },
                  { value: 'IT', label: 'IT / Network' },
                  { value: 'Other', label: 'Other' },
                ]}
                required
              />

              <FormField
                label="Location"
                as="select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                options={[
                  { value: 'Hostel A', label: 'Hostel A' },
                  { value: 'Hostel B', label: 'Hostel B' },
                  { value: 'Boys Hostel', label: 'Boys Hostel' },
                  { value: 'Girls Hostel', label: 'Girls Hostel' },
                  { value: 'Library', label: 'Main Library' },
                  { value: 'Engineering Block', label: 'Engineering Block' },
                  { value: 'Science Block', label: 'Science Block' },
                  { value: 'Cafeteria', label: 'Cafeteria' },
                  { value: 'Sports Complex', label: 'Sports Complex' },
                ]}
                required
              />
            </div>

            <FormField
              label="Description"
              as="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue in detail. What is broken? When did you notice it?"
              rows={4}
              required
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                label="Perceived Urgency"
                as="select"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                options={[
                  { value: 'LOW', label: 'Low (Cosmetic/Minor)' },
                  { value: 'MEDIUM', label: 'Medium (Inconvenient)' },
                  { value: 'HIGH', label: 'High (Impacts usability)' },
                  { value: 'CRITICAL', label: 'Critical (Safety/Severe damage)' },
                ]}
                helperText="How severe does this seem to you?"
                required
              />

              <FormField
                label="Estimated People Affected"
                type="number"
                min="1"
                value={affectedPeople}
                onChange={(e) => setAffectedPeople(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g., 50"
                helperText="Approximate number of people impacted."
                required
              />
            </div>

            {/* Photo Evidence — REQUIRED */}
            <div className="pt-2 border-t border-outline-variant">
              <PhotoUpload
                label="📷 Photo Evidence (Required)"
                hint="Take or upload a clear photo of the issue so the maintenance team can understand the problem."
                currentFile={photo}
                onFileSelected={(f) => {
                  setPhoto(f);
                  if (f) setPhotoError(null);
                }}
                error={photoError}
                captureCamera
              />
            </div>

            <div className="pt-4 border-t border-outline-variant flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/student/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Side Panel */}
        <div className="space-y-6">
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant">
            <div className="flex items-center gap-2 text-primary font-bold mb-3">
              <span className="material-symbols-outlined">smart_toy</span>
              Automated Triage
            </div>
            <p className="text-body-md text-on-surface-variant mb-4">
              Our smart priority engine automatically analyzes your report to calculate the correct priority level and route it to the right team.
            </p>
            <div className="text-label-sm text-on-surface space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#10B981]">check_circle</span>
                Category routing
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#10B981]">check_circle</span>
                Impact assessment
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#10B981]">check_circle</span>
                Duplicate detection
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant">
            <div className="flex items-center gap-2 text-primary font-bold mb-3">
              <span className="material-symbols-outlined">photo_camera</span>
              Photo Evidence
            </div>
            <p className="text-body-md text-on-surface-variant mb-3">
              A clear photo helps the maintenance team understand the problem immediately — speeding up resolution.
            </p>
            <div className="text-label-sm text-on-surface space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#10B981]">check_circle</span>
                Faster assignment
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#10B981]">check_circle</span>
                Better diagnosis
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#10B981]">check_circle</span>
                Admin verification
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
