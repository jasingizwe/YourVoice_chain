import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ImagePlus, X, FileImage } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isFutureDate } from '@/lib/validation';
import { apiRequest } from '@/lib/api';
import { createCaseOnChain, hasBlockchainConfig } from '@/lib/blockchain';
import type { Case } from '@/lib/types';

const MAX_FILES = 8;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export default function NewCase() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incomingFiles = Array.from(e.target.files);
    const nextFiles = [...files];

    for (const file of incomingFiles) {
      const isAllowed = ALLOWED_FILE_TYPES.some(type => file.type.startsWith(type));
      if (!isAllowed) {
        toast({ title: 'Unsupported file type', description: `${file.name} is not an allowed file type.`, variant: 'destructive' });
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ title: 'File too large', description: `${file.name} exceeds 10MB limit.`, variant: 'destructive' });
        continue;
      }
      if (nextFiles.length >= MAX_FILES) {
        toast({ title: 'File limit reached', description: `You can attach up to ${MAX_FILES} files.`, variant: 'destructive' });
        break;
      }
      nextFiles.push(file);
    }

    setFiles(nextFiles);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    if (cleanTitle.length < 5) {
      toast({ title: 'Invalid title', description: 'Case title must be at least 5 characters.', variant: 'destructive' });
      return;
    }
    if (cleanDescription.length < 20) {
      toast({ title: 'Invalid description', description: 'Description must be at least 20 characters.', variant: 'destructive' });
      return;
    }
    if (incidentDate && isFutureDate(incidentDate)) {
      toast({ title: 'Invalid incident date', description: 'Incident date cannot be in the future.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);

    try {
      const { item } = await apiRequest<{ item: Case }>('/cases', {
        method: 'POST',
        body: JSON.stringify({
          title: cleanTitle,
          description: cleanDescription,
          incidentDate: incidentDate || null,
        }),
      });

      let failedUploads = 0;
      let failedChainWrites = 0;
      let chainCaseCreated = !!item.onchain_case_id;
      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append('file', file);

          const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'}/cases/${item.id}/evidence`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });

          const uploadPayload = await uploadRes.json().catch(() => ({}));
          if (!uploadRes.ok) throw new Error(uploadPayload?.error || 'Evidence upload failed');

          const evidence = uploadPayload?.item;
          if (evidence?.id && evidence?.ipfs_hash && hasBlockchainConfig()) {
            try {
              const chain = await createCaseOnChain(evidence.ipfs_hash);
              if (!chainCaseCreated) {
                chainCaseCreated = true;
                await apiRequest(`/cases/${item.id}/onchain`, {
                  method: 'PATCH',
                  body: JSON.stringify({ onchainCaseId: chain.onchainCaseId, txHash: chain.txHash }),
                });
              }
              if (chain.txHash) {
                await apiRequest(`/cases/${item.id}/evidence/${evidence.id}/tx`, {
                  method: 'PATCH',
                  body: JSON.stringify({ txHash: chain.txHash }),
                });
              }
            } catch {
              failedChainWrites += 1;
            }
          }
        } catch {
          failedUploads += 1;
        }
      }

      if (failedUploads > 0) {
        toast({
          title: 'Case created with warnings',
          description: `${failedUploads} file(s) could not be attached.`,
          variant: 'destructive',
        });
      } else if (failedChainWrites > 0) {
        toast({
          title: 'Case created',
          description: 'Evidence uploaded. MetaMask was not available so blockchain anchoring was skipped.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Case created', description: 'Your case has been submitted and anchored on the blockchain.' });
      }

      navigate(`/dashboard/cases/${item.id}`);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <section className="rounded-[30px] border border-[#d8d9dc] bg-[linear-gradient(160deg,#f6f5f1_0%,#f2eee3_55%,#ebe3cc_100%)] p-5 shadow-[0_28px_65px_-45px_rgba(25,35,45,0.45)] md:p-8">
      <Link to="/dashboard/cases" className="inline-flex items-center gap-1 text-sm text-[#666760] hover:text-[#1f2328] mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to cases
      </Link>

      <h1 className="text-3xl font-heading font-semibold text-[#1f2328] mb-2">Submit a New Case</h1>
      <p className="text-[#666760] text-sm mb-8">
        All information is stored in your secured backend workspace.
      </p>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#dad6cc] bg-white/90 p-6 space-y-5">
        <div>
          <Label htmlFor="title" className="text-[#1f2328]">Case Title</Label>
          <Input
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Brief description of the incident"
            required
            className="mt-1 border-[#ddd8cf] bg-white"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-[#1f2328]">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Provide as much detail as you feel comfortable sharing..."
            required
            rows={6}
            className="mt-1 border-[#ddd8cf] bg-white"
          />
        </div>

        <div>
          <Label htmlFor="date" className="text-[#1f2328]">Date of Incident (optional)</Label>
          <Input
            id="date"
            type="date"
            value={incidentDate}
            onChange={e => setIncidentDate(e.target.value)}
            className="mt-1 border-[#ddd8cf] bg-white"
          />
        </div>

        {/* Evidence / Images Upload */}
        <div>
          <Label className="text-[#1f2328]">Evidence / Photos (optional)</Label>
          <p className="text-xs text-[#6f706a] mt-0.5 mb-2">
            Upload images or documents to support your case. Files are securely stored.
          </p>

          {files.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {files.map((file, index) => (
                <div key={index} className="relative group rounded-lg border border-[#ddd8cf] bg-[#f9f6ef] p-2 flex flex-col items-center gap-1">
                  <div className="h-20 w-full flex items-center justify-center">
                    <FileImage className="h-8 w-8 text-[#6f706a]" />
                  </div>
                  <span className="text-xs text-[#6f706a] truncate w-full text-center">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
              multiple
              onChange={handleFileChange}
            />
            <Button type="button" variant="outline" size="sm" className="gap-2 border-[#ddd8cf] bg-white text-[#1f2328]" asChild>
              <span>
                <ImagePlus className="h-4 w-4" />
                Add Photos / Files
              </span>
            </Button>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting} className="rounded-full bg-[#1a6fbb] text-white hover:bg-[#155fa0]">
            {submitting ? 'Submitting...' : 'Submit Case'}
          </Button>
          <Link to="/dashboard/cases">
            <Button type="button" variant="outline" className="rounded-full border-[#ddd8cf] bg-white text-[#1f2328]">Cancel</Button>
          </Link>
        </div>
      </form>
      </section>
    </div>
  );
}
