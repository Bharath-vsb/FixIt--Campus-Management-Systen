export interface DashboardStats {
  totalIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  criticalIssues: number;
  assignedIssues: number;
}

export interface CategoryStat {
  category: string;
  count: number;
}

export interface LocationStat {
  location: string;
  count: number;
}
