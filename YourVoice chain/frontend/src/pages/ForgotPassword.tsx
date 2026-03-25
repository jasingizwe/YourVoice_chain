import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { isValidEmail } from '@/lib/validation';
import Brand from '@/components/Brand';
import { apiRequest } from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!isValidEmail(email)) throw new Error('Please enter a valid email address.');

      const res = await apiRequest<{ ok: boolean; resetToken?: string }>(
        '/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        },
        false,
      );
      if (!res.ok) throw new Error('Request failed');
      if (res.resetToken) {
        toast({
          title: 'Reset token generated',
          description: `Dev token: ${res.resetToken}`,
        });
      } else {
        toast({
          title: 'Reset link requested',
          description: 'If the account exists, a reset link has been sent.',
        });
      }

      setSent(true);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[24px] border border-[#bfdbfe] bg-white p-7 shadow-[0_22px_40px_-30px_rgba(26,111,187,0.15)]">
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <Brand size="lg" showText={false} />
          </div>
          <h1 className="text-2xl font-semibold text-[#1a1a1a]">Reset your password</h1>
          <p className="mt-1 text-sm text-[#888]">Enter your email and we&apos;ll send you reset instructions.</p>
        </div>

        {sent ? (
          <div className="text-center">
            <p className="mb-2 font-medium text-[#1a1a1a]">Check your email</p>
            <p className="mb-4 text-sm text-[#888]">
              If your account exists, reset instructions were generated for <span className="font-medium text-[#1a1a1a]">{email}</span>.
            </p>
            <Link to="/auth?mode=login">
              <Button variant="outline" size="sm" className="gap-2 rounded-lg border-[#bfdbfe] text-[#1a6fbb] hover:bg-[#dbeafe]">
                <ArrowLeft className="h-4 w-4" /> Back to Log In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-[#1a1a1a]">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="mt-1 border-[#bfdbfe] focus-visible:ring-[#1a6fbb]"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-lg bg-[#1a6fbb] text-white hover:bg-[#155fa0]"
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <p className="text-center text-sm text-[#888]">
              <Link to="/auth?mode=login" className="font-medium text-[#1a6fbb] hover:underline">
                Back to Log In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
