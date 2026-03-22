import { useEffect, useState } from 'react';
import { Users, FileText, Shield, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';
import { approveOrganizationOnChain, hasBlockchainConfig, isOrganizationApprovedOnChain } from '@/lib/blockchain';

interface UserWithRole {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  role: string;
  wallet_address?: string | null;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [chainApprovals, setChainApprovals] = useState<Record<string, boolean>>({});
  const [caseCount, setCaseCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ users: UserWithRole[]; caseCount: number }>('/admin/overview');
      setUsers(res.users || []);
      setCaseCount(res.caseCount || 0);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not load admin data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const checkChainApproval = async (user: UserWithRole) => {
    if (!hasBlockchainConfig()) {
      toast({ title: 'Contract not configured', description: 'Set VITE_EVIDENCE_CONTRACT_ADDRESS first.', variant: 'destructive' });
      return;
    }
    if (!user.wallet_address) {
      toast({ title: 'No wallet', description: 'User has no wallet address saved.', variant: 'destructive' });
      return;
    }
    try {
      const approved = await isOrganizationApprovedOnChain(user.wallet_address);
      setChainApprovals(prev => ({ ...prev, [user.id]: approved }));
      toast({ title: approved ? 'Approved on-chain' : 'Not approved on-chain' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not check on-chain approval.', variant: 'destructive' });
    }
  };

  const approveOnChain = async (user: UserWithRole) => {
    if (!hasBlockchainConfig()) {
      toast({ title: 'Contract not configured', description: 'Set VITE_EVIDENCE_CONTRACT_ADDRESS first.', variant: 'destructive' });
      return;
    }
    if (!user.wallet_address) {
      toast({ title: 'No wallet', description: 'User has no wallet address saved.', variant: 'destructive' });
      return;
    }
    try {
      await approveOrganizationOnChain(user.wallet_address);
      setChainApprovals(prev => ({ ...prev, [user.id]: true }));
      toast({ title: 'Organization approved on-chain' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not approve organization on-chain.', variant: 'destructive' });
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await apiRequest(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      toast({ title: 'Role updated' });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not update role.', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage users and monitor the system</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: 'Total Users', value: users.length },
          { icon: Shield, label: 'Survivors', value: users.filter(u => u.role === 'survivor').length },
          { icon: Activity, label: 'Authorities', value: users.filter(u => u.role === 'authority').length },
          { icon: FileText, label: 'Total Cases', value: caseCount },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-[#e8dde4] bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="h-4 w-4 text-[#c0394b]" />
              <p className="text-sm text-[#666]">{stat.label}</p>
            </div>
            <p className="text-2xl font-bold text-[#1a1a1a]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-heading font-semibold text-foreground mb-4">User Management</h2>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <div className="border border-[#e8dde4] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Wallet</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-foreground">{u.full_name || '-'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[#fce8ec] text-[#c0394b] capitalize">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {u.wallet_address ? `${u.wallet_address.slice(0, 8)}...${u.wallet_address.slice(-6)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={u.role}
                            onChange={e => updateRole(u.id, e.target.value)}
                            className="text-xs border border-[#e8dde4] rounded-md px-2 py-1 bg-white text-[#1a1a1a]"
                          >
                            <option value="survivor">Survivor</option>
                            <option value="authority">Authority</option>
                            <option value="admin">Admin</option>
                          </select>

                          {u.role === 'authority' && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => checkChainApproval(u)}
                                className="h-7 px-2 text-xs"
                              >
                                Check Chain
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => approveOnChain(u)}
                                disabled={!u.wallet_address}
                                className="h-7 px-2 text-xs"
                              >
                                {chainApprovals[u.id] ? 'Approved' : 'Approve Chain'}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
