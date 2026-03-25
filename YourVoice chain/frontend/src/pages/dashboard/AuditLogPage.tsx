import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import type { AuditLog } from '@/lib/types';
import { apiRequest } from '@/lib/api';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ items: AuditLog[] }>('/audit-logs?limit=100')
      .then(({ items }) => {
        setLogs(items || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const actionLabels: Record<string, string> = {
    case_submitted: 'Case Submitted',
    evidence_uploaded: 'Evidence Uploaded',
    access_granted: 'Access Granted',
    access_revoked: 'Access Revoked',
    status_updated: 'Status Updated',
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Audit Log</h1>
      <p className="text-muted-foreground text-sm mb-8">Immutable record of all system actions</p>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#e8dde4] rounded-xl">
          <Activity className="h-10 w-10 text-[#aaa] mx-auto mb-3" />
          <p className="text-[#666]">No audit logs yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id} className="rounded-lg border border-[#e8dde4] bg-white p-4 flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-[#1a6fbb] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {actionLabels[log.action] || log.action}
                </p>
                {log.details && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {JSON.stringify(log.details)}
                  </p>
                )}
              </div>
              <time className="text-xs text-muted-foreground flex-shrink-0">
                {new Date(log.created_at).toLocaleString()}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
