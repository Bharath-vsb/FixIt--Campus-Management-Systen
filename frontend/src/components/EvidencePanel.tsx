import { useState } from 'react';
import type { EvidenceItem } from '../types';
import ImageModal from './ImageModal';
import AuthenticatedImage from './AuthenticatedImage';


interface EvidencePanelProps {
  problemEvidence: EvidenceItem[];
  resolutionEvidence: EvidenceItem[];
  /** 'comparison' = side-by-side BEFORE/AFTER (Admin); 'stacked' = vertical */
  layout?: 'comparison' | 'stacked';
}

function EvidenceCard({
  evidence,
  label,
  labelColor = 'primary',
}: {
  evidence: EvidenceItem | null;
  label: string;
  labelColor?: 'primary' | 'success';
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const colorClass =
    labelColor === 'success'
      ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
      : 'bg-primary/10 text-primary border-primary/30';

  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden">
      {/* Label */}
      <div className={`px-4 py-2 border-b ${colorClass} flex items-center gap-2`}>
        <span className="material-symbols-outlined text-[18px]">photo_camera</span>
        <span className="text-label-md font-bold">{label}</span>
      </div>

      {/* Image or placeholder */}
      <div className="p-3">
        {evidence ? (
          <>
            <div
              className="cursor-zoom-in relative group rounded-lg overflow-hidden"
              onClick={() => setModalOpen(true)}
            >
              <AuthenticatedImage
                url={evidence.url}
                alt={label}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                <span className="material-symbols-outlined text-white text-[36px] opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                  zoom_in
                </span>
              </div>
            </div>
            <div className="mt-2 text-body-md text-on-surface-variant">
              <span className="font-medium text-on-surface">{evidence.uploadedByName}</span>
              <span className="mx-1">·</span>
              {new Date(evidence.createdAt).toLocaleString()}
            </div>
          </>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-on-surface-variant gap-2 rounded-lg bg-surface-container">
            <span className="material-symbols-outlined text-[36px] text-outline">image_not_supported</span>
            <p className="text-body-md">No photo uploaded yet</p>
          </div>
        )}
      </div>

      {modalOpen && evidence && (
        <ImageModal
          src={evidence.url}
          alt={label}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function EvidencePanel({
  problemEvidence,
  resolutionEvidence,
  layout = 'stacked',
}: EvidencePanelProps) {
  const problem = problemEvidence[0] ?? null;
  const resolution = resolutionEvidence[0] ?? null;

  if (layout === 'comparison') {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <EvidenceCard evidence={problem} label="BEFORE — Problem Reported" labelColor="primary" />
        <EvidenceCard evidence={resolution} label="AFTER — Work Completed" labelColor="success" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {problem && (
        <EvidenceCard evidence={problem} label="Problem Evidence" labelColor="primary" />
      )}
      {resolution && (
        <EvidenceCard evidence={resolution} label="Resolution Evidence" labelColor="success" />
      )}
    </div>
  );
}
