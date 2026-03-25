import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getPasswordValidationError } from '@/lib/validation';
import { apiRequest } from '@/lib/api';
import Brand from '@/components/Brand';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const initialToken = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      toast({ title: 'Error', description: 'Reset token is required.', variant: 'destructive' });
      return;
    }

    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      toast({ title: 'Error', description: passwordError, variant: 'destructive' });
      return;
    }

    if (password !== confirm) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest<{ ok: boolean }>(
        '/auth/reset-password',
        {
          method: 'POST',
          body: JSON.stringify({ token: token.trim(), password }),
        },
        false,
      );
      toast({ title: 'Password updated', description: 'You can now log in with your new password.' });
      navigate('/auth?mode=login');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not reset password.', variant: 'destructive' });
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
          <h1 className="text-2xl font-semibold text-[#1a1a1a]">Set new password</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="token" className="text-[#1a1a1a]">Reset Token</Label>
            <Input
              id="token"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Paste reset token"
              required
              className="mt-1 border-[#bfdbfe] focus-visible:ring-[#1a6fbb]"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-[#1a1a1a]">New Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="********"
                required
                minLength={6}
                className="border-[#bfdbfe] pr-10 focus-visible:ring-[#1a6fbb]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#1a6fbb]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirm" className="text-[#1a1a1a]">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="********"
              required
              minLength={6}
              className="mt-1 border-[#bfdbfe] focus-visible:ring-[#1a6fbb]"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-lg bg-[#1a6fbb] text-white hover:bg-[#155fa0]"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
