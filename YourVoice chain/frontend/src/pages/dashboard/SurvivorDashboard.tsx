import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock3,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Wallet,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Case, NotificationItem } from '@/lib/types';
import { apiRequest } from '@/lib/api';

const statusConfig = {
  pending: {
    icon: Clock3,
    label: 'Pending',
    className: 'bg-[#efe8d8] text-[#7a6651] border border-[#e2d6bf]',
  },
  in_progress: {
    icon: AlertCircle,
    label: 'In Progress',
    className: 'bg-[#e8edf1] text-[#3f5f74] border border-[#d2dbe2]',
  },
  closed: {
    icon: CheckCircle,
    label: 'Closed',
    className: 'bg-[#e8efe8] text-[#4e6d58] border border-[#d0dfd1]',
  },
} as const;

export default function SurvivorDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      apiRequest<{ items: Case[] }>('/cases'),
      apiRequest<{ items: NotificationItem[] }>('/notifications?limit=20'),
    ])
      .then(([caseRes, notificationRes]) => {
        setCases(caseRes.items || []);
        setNotifications(notificationRes.items || []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const unreadCount = notifications.filter(item => !item.is_read).length;

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await apiRequest(`/notifications/${notificationId}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(item => (item.id === notificationId ? { ...item, is_read: true } : item)));
    } catch {
      // non-blocking
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' });
      setNotifications(prev => prev.map(item => ({ ...item, is_read: true })));
    } catch {
      // non-blocking
    }
  };

  const stats = useMemo(
    () => ({
      total: cases.length,
      pending: cases.filter(c => c.status === 'pending').length,
      inProgress: cases.filter(c => c.status === 'in_progress').length,
      closed: cases.filter(c => c.status === 'closed').length,
    }),
    [cases],
  );

  const completion = stats.total ? Math.round((stats.closed / stats.total) * 100) : 0;
  const hasMetaMask = typeof window !== 'undefined' && !!window.ethereum;
  const [guideOpen, setGuideOpen] = useState(false);

  const steps = [
    {
      number: '1',
      title: 'Install MetaMask',
      body: 'MetaMask is a free browser extension. Install it for Chrome, Firefox, or Brave from the official site.',
      link: { label: 'metamask.io', href: 'https://metamask.io/download/' },
    },
    {
      number: '2',
      title: 'Create your wallet',
      body: 'Open MetaMask and click "Create a new wallet". Write down your secret recovery phrase and keep it safe.',
    },
    {
      number: '3',
      title: 'Switch to Sepolia Testnet',
      body: 'In MetaMask, click the network dropdown (top left) → "Show test networks" → select "Sepolia".',
    },
    {
      number: '4',
      title: 'Get free test ETH',
      body: 'You need a small amount of Sepolia ETH to pay for transactions. It is completely free.',
      link: { label: 'sepoliafaucet.com', href: 'https://sepoliafaucet.com' },
    },
    {
      number: '5',
      title: 'You\'re ready',
      body: 'When you submit a case with evidence, MetaMask will ask you to approve the transaction. This anchors your evidence on the blockchain.',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">

      {/* MetaMask setup banner */}
      {!hasMetaMask && (
        <div className="mb-5 rounded-2xl border border-[#bfdbfe] bg-[#f0f7ff] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#bee3f8]">
                <Wallet className="h-5 w-5 text-[#1a6fbb]" />
              </div>
              <div>
                <p className="font-semibold text-[#1a1a1a]">MetaMask not detected</p>
                <p className="text-sm text-[#666]">
                  Install MetaMask to anchor your evidence on the blockchain and prove its authenticity.
                </p>
              </div>
            </div>
            <button
              onClick={() => setGuideOpen(g => !g)}
              className="shrink-0 rounded-lg bg-[#1a6fbb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#155fa0] transition-colors"
            >
              {guideOpen ? 'Hide guide' : 'Setup guide'}
            </button>
          </div>

          {guideOpen && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 border-t border-[#bfdbfe] pt-4">
              {steps.map(step => (
                <div key={step.number} className="rounded-xl bg-white border border-[#bfdbfe] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a6fbb] text-xs font-bold text-white">
                      {step.number}
                    </span>
                    <p className="font-semibold text-sm text-[#1a1a1a]">{step.title}</p>
                  </div>
                  <p className="text-xs text-[#666] leading-relaxed">{step.body}</p>
                  {step.link && (
                    <a
                      href={step.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs font-semibold text-[#1a6fbb] hover:underline"
                    >
                      {step.link.label} →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <section className="rounded-[30px] border border-[#d9dbdf] bg-[linear-gradient(165deg,#f7f6f2_0%,#f4f0e7_60%,#ece3ce_100%)] p-5 shadow-[0_28px_65px_-45px_rgba(25,35,45,0.45)] md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-[#1f2328]">Hello, {user?.user_metadata?.full_name?.trim() || user?.email?.split('@')[0] || 'there'}</h1>
            <p className="mt-1 text-sm text-[#666760]">Track your cases and progress in one clean dashboard.</p>
          </div>
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd8cd] bg-white/85 text-[#4f5358]"
              onClick={() => setShowNotifications(prev => !prev)}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-[#1a6fbb] px-1.5 py-0.5 text-[10px] text-white">
                {unreadCount}
              </span>
            )}
            <Link to="/dashboard/cases/new">
              <Button className="rounded-full bg-[#1a6fbb] px-5 text-white hover:bg-[#155fa0]">
                <Plus className="mr-2 h-4 w-4" />
                New Case
              </Button>
            </Link>

            {showNotifications && (
              <div className="absolute right-0 top-12 z-30 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-[#e4ddcf] bg-white p-4 shadow-xl">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-lg font-heading font-semibold text-[#1f2328]">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button type="button" onClick={markAllAsRead} className="text-xs font-medium text-[#4f5358] hover:underline">
                        Mark all read
                      </button>
                    )}
                    <button type="button" onClick={() => setShowNotifications(false)} className="text-[#7a7c76]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="rounded-xl border border-[#eee8db] bg-[#fdfbf6] p-3 text-sm text-[#6d6f69]">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => markNotificationAsRead(item.id)}
                        className={`w-full rounded-xl border p-3 text-left ${item.is_read ? 'border-[#eee8db] bg-[#fdfbf6]' : 'border-[#bee3f8] bg-[#dbeafe]'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-[#22262b]">{item.title}</p>
                          <span className="text-xs text-[#888b84]">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-1 text-xs text-[#6d6f69]">{item.message}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-[#d9d6cd] bg-white/85 p-4">
            <p className="text-xs uppercase tracking-wide text-[#7b7d77]">Total Cases</p>
            <p className="mt-1 text-3xl font-heading text-[#1f2328]">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-[#d9d6cd] bg-white/85 p-4">
            <p className="text-xs uppercase tracking-wide text-[#7b7d77]">Pending</p>
            <p className="mt-1 text-3xl font-heading text-[#7a6651]">{stats.pending}</p>
          </div>
          <div className="rounded-2xl border border-[#d9d6cd] bg-white/85 p-4">
            <p className="text-xs uppercase tracking-wide text-[#7b7d77]">In Progress</p>
            <p className="mt-1 text-3xl font-heading text-[#3f5f74]">{stats.inProgress}</p>
          </div>
          <div className="rounded-2xl border border-[#d9d6cd] bg-white/85 p-4">
            <p className="text-xs uppercase tracking-wide text-[#7b7d77]">Completion</p>
            <p className="mt-1 text-3xl font-heading text-[#4e6d58]">{completion}%</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-2xl border border-[#dad6cc] bg-white/90 p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-lg font-heading font-medium text-[#1f2328]">Recent Cases</h2>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e2dccf] bg-white px-3 py-1.5 text-xs text-[#666860]">
                <Search className="h-3.5 w-3.5" />
                Search
              </div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-sm text-[#777a74]">Loading cases...</div>
            ) : cases.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d8d4ca] bg-[#fbfaf6] py-10 text-center">
                <FileText className="mx-auto mb-3 h-9 w-9 text-[#9b9b95]" />
                <p className="text-sm text-[#6d6f69]">No cases yet. Create your first case to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cases.slice(0, 5).map(c => {
                  const status = statusConfig[c.status];
                  const StatusIcon = status.icon;

                  return (
                    <Link
                      key={c.id}
                      to={`/dashboard/cases/${c.id}`}
                      className="block rounded-xl border border-[#e2ddd2] bg-[#fffefb] p-4 transition hover:border-[#d4cbb9] hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-medium text-[#1f2328]">{c.title}</h3>
                          <p className="mt-1 line-clamp-1 text-sm text-[#70726c]">{c.description}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-[#80827c]">
                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#dad6cc] bg-[#f9f6ef] p-5">
              <h3 className="text-base font-heading font-medium text-[#1f2328]">Progress</h3>
              <p className="mt-1 text-sm text-[#6f706a]">Overall case completion this period.</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e7e0d2]">
                <div className="h-full rounded-full bg-[#1a6fbb]" style={{ width: `${completion}%` }} />
              </div>
              <p className="mt-2 text-sm font-medium text-[#5a4a37]">{completion}% completed</p>
            </div>

            <div className="rounded-2xl border border-[#dad6cc] bg-[#111] p-5 text-white">
              <h3 className="text-base font-heading font-medium">Quick Actions</h3>
              <div className="mt-3 space-y-2 text-sm text-white/85">
                <p>- Open a case to review details.</p>
                <p>- Keep your case information up to date.</p>
              </div>
              <Link to="/dashboard/cases" className="mt-4 inline-flex">
                <Button className="rounded-full bg-[#1a6fbb] text-white hover:bg-[#155fa0]">
                  View My Cases
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
