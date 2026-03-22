import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { AppRole } from '@/lib/types';
import { getPasswordValidationError, isValidEmail } from '@/lib/validation';
import Brand from '@/components/Brand';

type AuthView = 'chooser' | 'login' | 'register';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const initialView: AuthView =
    modeParam === 'register' ? 'register' : modeParam === 'login' ? 'login' : 'chooser';

  const [view, setView] = useState<AuthView>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<AppRole>('survivor');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const { signIn, signUp, resendConfirmation, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isRegister = view === 'register';

  useEffect(() => {
    if (user) navigate('/guide/features');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setUnconfirmedEmail('');

    try {
      if (!isValidEmail(email)) {
        throw new Error('Please enter a valid email address.');
      }

      if (isRegister) {
        const passwordError = getPasswordValidationError(password);
        if (passwordError) throw new Error(passwordError);
        if (!fullName.trim()) throw new Error('Full name is required.');
      }

      if (isRegister) {
        await signUp(email, password, fullName.trim(), role);
        toast({
          title: 'Account created',
          description: 'Account created. Check your email for the confirmation link, then log in.',
        });
        setPassword('');
        setView('login');
      } else {
        await signIn(email, password);
        navigate('/guide/features');
      }
    } catch (err: any) {
      const message = String(err?.message || 'Something went wrong');
      if (!isRegister && /email.*confirm|confirm.*email/i.test(message)) {
        setUnconfirmedEmail(email.trim());
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail) return;
    setResending(true);
    try {
      await resendConfirmation(unconfirmedEmail);
      toast({
        title: 'Confirmation sent',
        description: `A new confirmation email was sent to ${unconfirmedEmail}.`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: String(err?.message || 'Could not resend confirmation email'),
        variant: 'destructive',
      });
    } finally {
      setResending(false);
    }
  };

  const roles: { value: AppRole; label: string }[] = [
    { value: 'survivor', label: 'Survivor' },
    { value: 'authority', label: 'Authority' },
  ];

  const pageWrap = 'min-h-screen bg-[#fdf2f8] flex items-center justify-center p-4';
  const cardWrap = 'w-full max-w-md rounded-[24px] border border-[#fbcfe8] bg-white p-7 shadow-[0_22px_40px_-30px_rgba(192,57,75,0.15)]';
  const subtleText = 'text-sm text-[#6f6a62]';

  if (view === 'chooser') {
    return (
      <div className={pageWrap}>
        <div className={cardWrap}>
          <div className="mb-6 text-center">
            <div className="mb-3 flex justify-center">
              <Brand size="lg" showText={false} />
            </div>
            <h1 className="text-2xl font-heading font-semibold text-[#1f1e1a]">Get Started</h1>
            <p className={`${subtleText} mt-1`}>Choose how you want to continue</p>
          </div>

          <div className="space-y-3">
            <Button className="w-full rounded-lg bg-[#c0394b] text-white hover:bg-[#a8303f]" onClick={() => setView('register')}>
              Create Account
            </Button>
            <Button variant="outline" className="w-full rounded-lg border-[#fbcfe8] bg-white text-[#c0394b] hover:bg-[#fce8ec]" onClick={() => setView('login')}>
              Log In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={pageWrap}>
      <div className={cardWrap}>
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <Brand size="lg" showText={false} />
          </div>
          <h1 className="text-2xl font-heading font-semibold text-[#1f1e1a]">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className={`${subtleText} mt-1`}>
            {isRegister ? 'Set up your secure account' : 'Enter your details to sign in'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <Label htmlFor="fullName" className="text-[#2b2924]">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                className="mt-1 border-[#fbcfe8] focus:border-[#c0394b]"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-[#2b2924]">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="mt-1 border-[#fbcfe8] focus:border-[#c0394b]"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-[#2b2924]">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="********"
                required
                minLength={6}
                className="border-[#fbcfe8] pr-10 focus:border-[#c0394b]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#817a70] hover:text-[#2b2924]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div>
              <Label className="text-[#2b2924]">Role</Label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {roles.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      role === r.value
                        ? 'border-[#c0394b] bg-[#fce8ec] text-[#c0394b]'
                        : 'border-[#fbcfe8] bg-white text-[#5a554d] hover:border-[#c0394b]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isRegister && (
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-[#c0394b] hover:underline">
                Forgot password?
              </Link>
            </div>
          )}

          <Button
            type="submit"
            className="w-full rounded-lg bg-[#c0394b] text-white hover:bg-[#a8303f]"
            disabled={submitting}
          >
            {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Log In'}
          </Button>

          {!isRegister && unconfirmedEmail && (
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-lg border-[#fbcfe8] text-[#c0394b]"
              disabled={resending}
              onClick={handleResendConfirmation}
            >
              {resending ? 'Resending...' : 'Resend Confirmation Email'}
            </Button>
          )}

          <p className="text-center text-sm text-[#6f6a62]">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setView(isRegister ? 'login' : 'register')}
              className="font-medium text-[#1f1e1a] hover:underline"
            >
              {isRegister ? 'Log In' : 'Create Account'}
            </button>
          </p>
          <p className="text-center text-xs text-[#8a847a]">
            <button
              type="button"
              onClick={() => setView('chooser')}
              className="hover:text-[#1f1e1a]"
            >
              Back to options
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
