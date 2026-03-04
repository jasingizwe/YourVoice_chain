export type AppRole = 'survivor' | 'authority' | 'admin';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  wallet_address: string | null;
  created_at: string;
}

export interface Case {
  id: string;
  survivor_id: string;
  title: string;
  description: string;
  incident_date: string | null;
  status: 'pending' | 'in_progress' | 'closed';
  onchain_case_id?: string | null;
  onchain_case_tx?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  case_id: string;
  survivor_id: string;
  evidence_type: string;
  ipfs_hash: string | null;
  blockchain_tx: string | null;
  file_name: string | null;
  uploaded_at: string;
}

export interface AccessGrant {
  id: string;
  case_id: string;
  authority_id: string;
  granted_by: string;
  authority_wallet_address?: string | null;
  authority_email?: string | null;
  grant_tx?: string | null;
  revoke_tx?: string | null;
  granted_at: string;
  revoked_at: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  case_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface CaseNote {
  id: string;
  case_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  recipient_user_id: string;
  sender_user_id: string | null;
  case_id: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string | null;
  case_title?: string | null;
}
