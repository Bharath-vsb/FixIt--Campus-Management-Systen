export type IssueStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Issue {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  urgency: UrgencyLevel;
  affectedPeople: number;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  priorityFactors: string[];
  status: IssueStatus;
  reportedBy: number;
  reportedByName: string;
  assignedTo?: number;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateIssueRequest {
  title: string;
  description: string;
  category: string;
  location: string;
  urgency: UrgencyLevel;
  affectedPeople: number;
}

export interface CreateIssueResponse {
  issue: Issue;
  possibleDuplicate: boolean;
  existingIssueId?: number;
  similarityReason?: string;
}

export interface UpdateIssueRequest {
  status?: IssueStatus;
  assignedTo?: number;
  priorityLevel?: PriorityLevel;
}

export interface Comment {
  id: number;
  issueId: number;
  userId: number;
  userName: string;
  userRole: string;
  content: string;
  isWorkNote: boolean;
  createdAt: string;
}

export interface PriorityResult {
  priorityScore: number;
  priorityLevel: PriorityLevel;
  factors: string[];
}
