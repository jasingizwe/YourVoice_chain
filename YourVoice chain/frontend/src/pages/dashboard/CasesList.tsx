import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  Clock3,
  FileText,
  Plus,
  Search,
} from 'lucide-react';
import type { Case } from '@/lib/types';
import { apiRequest } from '@/lib/api';

type CaseFilter = 'all' | 'pending' | 'in_progress' | 'closed';

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock3,
    badge: 'bg-[#efe8d8] text-[#7a6651] border border-[#e2d6bf]',
  },
  in_progress: {
    label: 'In Progress',
    icon: AlertCircle,
    badge: 'bg-[#e8edf1] text-[#3f5f74] border border-[#d2dbe2]',
  },
  closed: {
    label: 'Closed',
    icon: CheckCircle,
    badge: 'bg-[#e8efe8] text-[#4e6d58] border border-[#d0dfd1]',
  },
} as const;

const filters: { key: CaseFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'closed', label: 'Closed' },
];

export default function CasesList() {
  const { user, role } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CaseFilter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    apiRequest<{ items: Case[] }>('/cases')
      .then(res => setCases(res.items || []))
      .finally(() => setLoading(false));
  }, [user, role]);

  const filteredCases = useMemo(() => {
    let result = filter === 'all' ? cases : cases.filter(c => c.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
    }
    return result;
  }, [cases, filter, search]);

  const emptyMessage =
    role === 'authority' ? 'No cases assigned yet.' : 'No cases found. Try a different filter.';

  const pageTitle = role === 'authority' ? 'Assigned Cases' : 'My Cases';
  const pageSubtitle = role === 'authority'
    ? 'Cases you have been granted access to'
    : `${cases.length} case${cases.length !== 1 ? 's' : ''} total`;

  return (
    <div className="mx-auto max-w-4xl animate-fade-in space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-[#1f2328]">{pageTitle}</h1>
          <p className="mt-1 text-sm text-[#666760]">{pageSubtitle}</p>
        </div>
        {role === 'survivor' && (
          <Link to="/dashboard/cases/new">
            <Button className="rounded-full bg-[#1a6fbb] px-5 text-white hover:bg-[#155fa0]">
              <Plus className="mr-2 h-4 w-4" />
              New Case
            </Button>
          </Link>
        )}
      </div>

      {/* Search + Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#aaa]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cases…"
            className="w-full rounded-full border border-[#e2ddd2] bg-white py-2 pl-9 pr-4 text-sm text-[#1f2328] outline-none focus:border-[#1a6fbb] transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                filter === f.key
                  ? 'bg-[#1a6fbb] text-white'
                  : 'border border-[#e2ddd2] bg-white text-[#5e5f5a] hover:border-[#1a6fbb] hover:text-[#1a6fbb]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cases list */}
      <div className="rounded-2xl border border-[#e2ddd2] bg-white">
        {loading ? (
          <div className="py-16 text-center text-sm text-[#777a74]">Loading cases…</div>
        ) : filteredCases.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-[#ccc]" />
            <p className="text-sm text-[#6d6f69]">{emptyMessage}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f2ede8]">
            {filteredCases.map((item, idx) => {
              const status = statusConfig[item.status];
              const StatusIcon = status.icon;
              const dateLabel = role === 'authority' ? 'Updated' : 'Created';
              const dateValue = role === 'authority' ? item.updated_at : item.created_at;

              return (
                <Link
                  key={item.id}
                  to={`/dashboard/cases/${item.id}`}
                  className={`flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#f0f7ff] ${idx === 0 ? 'rounded-t-2xl' : ''} ${idx === filteredCases.length - 1 ? 'rounded-b-2xl' : ''}`}
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-[#1f2328]">{item.title}</h3>
                    <p className="mt-0.5 line-clamp-1 text-sm text-[#70726c]">{item.description}</p>
                    <p className="mt-1 text-xs text-[#9b9d97]">{dateLabel} {new Date(dateValue).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.badge}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-[#1a6fbb]" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
