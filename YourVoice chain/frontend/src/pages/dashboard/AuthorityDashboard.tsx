import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { Case } from '@/lib/types';
import { apiRequest } from '@/lib/api';

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', className: 'text-warning bg-warning/10' },
  in_progress: { icon: AlertCircle, label: 'In Progress', className: 'text-info bg-info/10' },
  closed: { icon: CheckCircle, label: 'Closed', className: 'text-success bg-success/10' },
};

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    apiRequest<{ items: Case[] }>('/cases')
      .then(({ items }) => setCases(items || []))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-foreground">Authority Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Cases you've been granted access to</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Assigned', value: cases.length },
          { label: 'Active', value: cases.filter(c => c.status !== 'closed').length },
          { label: 'Closed', value: cases.filter(c => c.status === 'closed').length },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-[#e8dde4] bg-white p-4">
            <p className="text-sm text-[#666]">{stat.label}</p>
            <p className="text-2xl font-bold text-[#1a1a1a] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="font-heading font-semibold text-foreground">Assigned Cases</h2>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#e8dde4] rounded-xl">
            <FileText className="h-10 w-10 text-[#aaa] mx-auto mb-3" />
            <p className="text-[#666]">No cases assigned to you yet.</p>
          </div>
        ) : (
          cases.map(c => {
            const status = statusConfig[c.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            return (
              <Link
                key={c.id}
                to={`/dashboard/cases/${c.id}`}
                className="block rounded-xl border border-[#e8dde4] bg-white p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{c.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{c.description}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Updated {new Date(c.updated_at).toLocaleDateString()}
                </p>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
