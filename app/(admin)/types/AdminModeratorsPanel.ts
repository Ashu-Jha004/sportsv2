export interface AdminUserProps {
  id: string;
  name: string;
  email: string;
  role: string | null;
  permissions: {
    canApproveModerators: boolean;
    canManageAdmins: boolean;
    canViewAuditLogs: boolean;
  };
}

export interface ModeratorApplication {
  id: string;
  userId: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  guideEmail: string | null;
  PrimarySports: string | null;
  Sports: string[];
  Experience: number | null;
  documents: string[];
  city: string | null;
  state: string | null;
  country: string | null;
  status: "pending_review" | "approved" | "rejected";
  reviewNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStats {
  total: number;
  pending_review: number;
  approved: number;
  rejected: number;
}

export interface AdminDashboardData {
  applications: ModeratorApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: ApplicationStats;
  adminInfo: {
    name: string;
    role: string | null;
    permissions: {
      canApproveModerators: boolean;
      canManageUsers: boolean;
      canManageAdmins: boolean;
      canViewAuditLogs: boolean;
    };
  };
}

export interface AdminModeratorsPanelProps {
  adminUser: AdminUserProps;
}
export interface ApplicationDetailModalProps {
  applicationId: string;
  applications: ModeratorApplication[];
  onClose: () => void;
  onStatusUpdate: () => void;
}
