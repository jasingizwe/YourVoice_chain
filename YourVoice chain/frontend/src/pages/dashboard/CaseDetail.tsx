import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Clock,
  FileUp,
  MessageSquare,
  Pencil,
  Save,
  Trash2,
  UserMinus,
  UserPlus,
  X,
} from 'lucide-react';
import type { Case, Evidence, AccessGrant, CaseNote } from '@/lib/types';
import { apiRequest } from '@/lib/api';
import { createCaseOnChain, grantCaseAccessOnChain, hasBlockchainConfig, revokeCaseAccessOnChain } from '@/lib/blockchain';

type CaseDetailsResponse = {
  item: Case;
  evidence: Evidence[];
  grants: AccessGrant[];
  notes: CaseNote[];
};

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [loading, setLoading] = useState(true);

  const [newStatus, setNewStatus] = useState<'pending' | 'in_progress' | 'closed'>('pending');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIncidentDate, setEditIncidentDate] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [authorityEmail, setAuthorityEmail] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const txExplorerBase = (import.meta.env.VITE_TX_EXPLORER_BASE as string | undefined) || 'https://sepolia.etherscan.io/tx/';
  const ipfsGatewayBase = (import.meta.env.VITE_IPFS_GATEWAY_BASE as string | undefined) || 'https://gateway.pinata.cloud/ipfs/';

  const loadCase = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiRequest<CaseDetailsResponse>(`/cases/${id}`);
      setCaseData(res.item);
      setEvidence(res.evidence || []);
      setGrants(res.grants || []);
      setNotes(res.notes || []);
      setNewStatus(res.item.status);
      setEditTitle(res.item.title || '');
      setEditDescription(res.item.description || '');
      setEditIncidentDate(res.item.incident_date ? res.item.incident_date.slice(0, 10) : '');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not load case.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [id]);

  const saveEdits = async () => {
    if (!id) return;
    const title = editTitle.trim();
    const description = editDescription.trim();

    if (title.length < 3) {
      toast({ title: 'Invalid title', description: 'Title must be at least 3 characters.', variant: 'destructive' });
      return;
    }
    if (description.length < 10) {
      toast({ title: 'Invalid description', description: 'Description must be at least 10 characters.', variant: 'destructive' });
      return;
    }

    setBusy(true);
    try {
      await apiRequest(`/cases/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, description, incidentDate: editIncidentDate || null }),
      });
      toast({ title: 'Case updated' });
      setIsEditing(false);
      await loadCase();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not update case.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const deleteCase = async () => {
    if (!id) return;
    if (!window.confirm('Delete this case permanently? This action cannot be undone.')) return;

    setBusy(true);
    try {
      await apiRequest(`/cases/${id}`, { method: 'DELETE' });
      toast({ title: 'Case deleted' });
      navigate('/dashboard/cases');
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message || 'Could not delete case.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const updateStatus = async () => {
    if (!id) return;
    setBusy(true);
    try {
      await apiRequest(`/cases/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      toast({ title: 'Status updated' });
      await loadCase();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not update status.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const addNote = async () => {
    if (!id || !noteContent.trim()) return;
    setBusy(true);
    try {
      await apiRequest(`/cases/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content: noteContent.trim() }),
      });
      setNoteContent('');
      toast({ title: 'Note added' });
      await loadCase();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not add note.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const grantAccess = async () => {
    if (!id || !authorityEmail.trim()) return;
    setBusy(true);
    try {
      const res = await apiRequest<{ item: AccessGrant }>(`/cases/${id}/grants`, {
        method: 'POST',
        body: JSON.stringify({ authorityEmail: authorityEmail.trim().toLowerCase() }),
      });

      if (isSurvivorOwner && hasBlockchainConfig()) {
        const onchainCaseId = caseData?.onchain_case_id || null;
        const authorityWallet = res.item.authority_wallet_address;
        if (!onchainCaseId) {
          toast({
            title: 'Access granted (off-chain only)',
            description: 'This case has no on-chain ID yet. Upload evidence first to anchor it on-chain.',
            variant: 'destructive',
          });
        } else if (!authorityWallet) {
          toast({
            title: 'Access granted (off-chain only)',
            description: 'Authority has no wallet address saved, so on-chain grant was skipped.',
            variant: 'destructive',
          });
        } else {
          try {
            const txHash = await grantCaseAccessOnChain(onchainCaseId, authorityWallet);
            await apiRequest(`/cases/grants/${res.item.id}/tx`, {
              method: 'PATCH',
              body: JSON.stringify({ grantTx: txHash }),
            });
          } catch (chainErr: any) {
            toast({
              title: 'Access granted (off-chain only)',
              description: chainErr?.message || 'On-chain grant failed.',
              variant: 'destructive',
            });
          }
        }
      }

      setAuthorityEmail('');
      toast({ title: 'Access granted' });
      await loadCase();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not grant access.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const revokeGrant = async (grantId: string) => {
    setBusy(true);
    try {
      await apiRequest(`/cases/grants/${grantId}/revoke`, { method: 'PATCH' });

      const grant = grants.find(g => g.id === grantId);
      const onchainCaseId = caseData?.onchain_case_id || null;
      if (isSurvivorOwner && onchainCaseId && grant?.authority_wallet_address && hasBlockchainConfig()) {
        try {
          const txHash = await revokeCaseAccessOnChain(onchainCaseId, grant.authority_wallet_address);
          await apiRequest(`/cases/grants/${grantId}/tx`, {
            method: 'PATCH',
            body: JSON.stringify({ revokeTx: txHash }),
          });
        } catch (chainErr: any) {
          toast({
            title: 'Access revoked (off-chain only)',
            description: chainErr?.message || 'On-chain revoke failed.',
            variant: 'destructive',
          });
        }
      }

      toast({ title: 'Access revoked' });
      await loadCase();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not revoke access.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const addEvidence = async () => {
    if (!id || !evidenceFile) {
      toast({ title: 'No file selected', description: 'Please choose a file before uploading.', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append('file', evidenceFile);
      const token = localStorage.getItem('yourvoice_api_token');

      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'}/cases/${id}/evidence`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const payload = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) {
        throw new Error(payload?.error || 'Evidence upload failed');
      }

      const evidenceRow = payload?.item as Evidence | undefined;
      if (evidenceRow?.id && evidenceRow.ipfs_hash && hasBlockchainConfig()) {
        try {
          let chainTxHash: string | null = null;
          if (!caseData?.onchain_case_id) {
            const chain = await createCaseOnChain(evidenceRow.ipfs_hash);
            chainTxHash = chain.txHash;
            await apiRequest(`/cases/${id}/onchain`, {
              method: 'PATCH',
              body: JSON.stringify({ onchainCaseId: chain.onchainCaseId, txHash: chain.txHash }),
            });
          }
          if (chainTxHash) {
            await apiRequest(`/cases/${id}/evidence/${evidenceRow.id}/tx`, {
              method: 'PATCH',
              body: JSON.stringify({ txHash: chainTxHash }),
            });
          }
        } catch (chainErr: any) {
          toast({
            title: 'Evidence uploaded',
            description: chainErr?.message || 'On-chain anchoring failed.',
            variant: 'destructive',
          });
        }
      }

      setEvidenceFile(null);
      toast({ title: 'Evidence added' });
      await loadCase();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not add evidence.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const deleteEvidence = async (evidenceId: string) => {
    if (!id) return;
    if (!window.confirm('Delete this evidence item?')) return;
    setBusy(true);
    try {
      await apiRequest(`/cases/${id}/evidence/${evidenceId}`, { method: 'DELETE' });
      toast({ title: 'Evidence deleted' });
      await loadCase();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not delete evidence.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const sendSurvivorUpdate = async () => {
    if (!id || !updateMessage.trim()) return;
    setBusy(true);
    try {
      await apiRequest('/notifications', {
        method: 'POST',
        body: JSON.stringify({
          caseId: id,
          title: updateTitle.trim() || undefined,
          message: updateMessage.trim(),
        }),
      });
      setUpdateTitle('');
      setUpdateMessage('');
      toast({ title: 'Update sent to survivor' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not send update.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  if (!caseData) return <div className="py-12 text-center text-muted-foreground">Case not found.</div>;

  const isSurvivorOwner = role === 'survivor' && caseData.survivor_id === user?.id;
  const canUpdateStatus = role === 'authority' || role === 'admin';
  const canManageAccess = isSurvivorOwner || role === 'admin';
  const canAddNotes = role === 'authority' || role === 'admin';
  const canSendUpdates = role === 'authority' || role === 'admin';

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <Link to="/dashboard/cases" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to cases
      </Link>

      <div className="rounded-xl border border-[#ddd6c6] bg-white p-6 dark:border-[#36404a] dark:bg-[#232c34]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Case title" />
                <Input type="date" value={editIncidentDate} onChange={e => setEditIncidentDate(e.target.value)} />
              </div>
            ) : (
              <>
                <h1 className="text-xl font-heading font-bold text-foreground">{caseData.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Created {new Date(caseData.created_at).toLocaleDateString()}
                  {caseData.incident_date && ` · Incident: ${new Date(caseData.incident_date).toLocaleDateString()}`}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSurvivorOwner && !isEditing && (
              <>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="gap-1">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={deleteCase} disabled={busy} className="gap-1">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </>
            )}
            {isSurvivorOwner && isEditing && (
              <>
                <Button size="sm" onClick={saveEdits} disabled={busy} className="gap-1">
                  <Save className="h-3.5 w-3.5" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="gap-1">
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
              </>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-[#efe8d8] px-3 py-1 text-xs font-medium text-[#7a6651]">
              <Clock className="h-3 w-3" />
              {caseData.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {isEditing ? (
          <Textarea
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            rows={5}
            className="mt-4"
            placeholder="Case description"
          />
        ) : (
          <p className="mt-4 leading-relaxed text-foreground">{caseData.description}</p>
        )}
      </div>

      {canUpdateStatus && (
        <div className="rounded-xl border border-[#ddd6c6] bg-white p-6 dark:border-[#36404a] dark:bg-[#232c34]">
          <h2 className="mb-3 font-heading font-semibold text-foreground">Update Status</h2>
          <div className="flex gap-3">
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as 'pending' | 'in_progress' | 'closed')}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
            <Button onClick={updateStatus} size="sm" disabled={busy}>Update</Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[#ddd6c6] bg-white p-6 dark:border-[#36404a] dark:bg-[#232c34]">
        <h2 className="mb-3 font-heading font-semibold text-foreground">Evidence ({evidence.length})</h2>
        {evidence.length === 0 ? (
          <p className="text-sm text-muted-foreground">No evidence yet.</p>
        ) : (
          <div className="space-y-2">
            {evidence.map(ev => (
              <div key={ev.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/50 p-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{ev.file_name || 'Evidence file'}</p>
                  <p className="text-xs text-muted-foreground">Uploaded {new Date(ev.uploaded_at).toLocaleString()}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 ${ev.ipfs_hash ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>
                      IPFS: {ev.ipfs_hash ? 'Linked' : 'Missing'}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 ${ev.blockchain_tx ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-muted text-muted-foreground'}`}>
                      Blockchain: {ev.blockchain_tx ? 'Anchored' : 'Pending'}
                    </span>
                    {ev.ipfs_hash && !ev.ipfs_hash.startsWith('local-') && (
                      <a
                        href={`${ipfsGatewayBase}${ev.ipfs_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline underline-offset-2"
                      >
                        View IPFS
                      </a>
                    )}
                    {ev.blockchain_tx && (
                      <a
                        href={`${txExplorerBase}${ev.blockchain_tx}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline underline-offset-2"
                      >
                        View Tx
                      </a>
                    )}
                  </div>
                </div>
                {(isSurvivorOwner || role === 'admin') && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEvidence(ev.id)}
                    className="gap-1 text-destructive"
                    disabled={busy}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        {(isSurvivorOwner || role === 'admin') && (
          <div className="mt-4 flex gap-2">
            <Input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={e => setEvidenceFile(e.target.files?.[0] || null)}
            />
            <Button onClick={addEvidence} disabled={busy} className="gap-1">
              <FileUp className="h-4 w-4" /> Add
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[#ddd6c6] bg-white p-6 dark:border-[#36404a] dark:bg-[#232c34]">
        <h2 className="mb-3 font-heading font-semibold text-foreground">Access Grants ({grants.filter(g => !g.revoked_at).length})</h2>
        {grants.filter(g => !g.revoked_at).length === 0 ? (
          <p className="text-sm text-muted-foreground">No active grants.</p>
        ) : (
          <div className="space-y-2">
            {grants.filter(g => !g.revoked_at).map(g => (
              <div key={g.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm text-foreground">
                <span>
                  Authority: {g.authority_email || `${g.authority_id.slice(0, 8)}...`} · Granted {new Date(g.granted_at).toLocaleDateString()}
                  {g.grant_tx ? ' · On-chain recorded' : ''}
                </span>
                {canManageAccess && (
                  <Button variant="ghost" size="sm" onClick={() => revokeGrant(g.id)} className="gap-1 text-destructive">
                    <UserMinus className="h-3.5 w-3.5" /> Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        {canManageAccess && (
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Authority email"
              value={authorityEmail}
              onChange={e => setAuthorityEmail(e.target.value)}
            />
            <Button onClick={grantAccess} disabled={busy} className="gap-1">
              <UserPlus className="h-4 w-4" /> Grant
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[#ddd6c6] bg-white p-6 dark:border-[#36404a] dark:bg-[#232c34]">
        <h2 className="mb-3 flex items-center gap-2 font-heading font-semibold text-foreground">
          <MessageSquare className="h-4 w-4" /> Notes ({notes.length})
        </h2>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        ) : (
          <div className="space-y-3">
            {notes.map(note => (
              <div key={note.id} className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-foreground">{note.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(note.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
        {canAddNotes && (
          <div className="mt-4 flex gap-2">
            <Textarea
              placeholder="Add note"
              rows={2}
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
            />
            <Button onClick={addNote} disabled={busy} className="self-end">Add</Button>
          </div>
        )}
      </div>

      {canSendUpdates && (
        <div className="rounded-xl border border-[#ddd6c6] bg-white p-6 dark:border-[#36404a] dark:bg-[#232c34]">
          <h2 className="mb-3 font-heading font-semibold text-foreground">Send Update to Survivor</h2>
          <div className="space-y-3">
            <Input
              placeholder="Notification title (optional)"
              value={updateTitle}
              onChange={e => setUpdateTitle(e.target.value)}
            />
            <Textarea
              placeholder="Write an update message for the survivor"
              rows={3}
              value={updateMessage}
              onChange={e => setUpdateMessage(e.target.value)}
            />
            <Button onClick={sendSurvivorUpdate} disabled={busy || !updateMessage.trim()}>
              Send Update
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
