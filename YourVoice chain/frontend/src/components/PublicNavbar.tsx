import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Brand from '@/components/Brand';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/guide/features', label: 'Features' },
  { to: '/guide/how-it-works', label: 'How it works' },
  { to: '/resources', label: 'Resources' },
  { to: '/dashboard/cases', label: 'Cases' },
];

interface PublicNavbarProps {
  /** Highlight the matching nav link */
  activePath?: string;
  /** Show Sign in / Get Started / Dashboard auth buttons */
  showAuth?: boolean;
}

export default function PublicNavbar({ activePath, showAuth = false }: PublicNavbarProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="bg-[#bee3f8] px-6 py-4 md:px-16">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Brand */}
        <Brand size={showAuth ? 'lg' : 'md'} showText={showAuth} />

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#1a1a1a] md:flex">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={
                activePath === link.to
                  ? 'font-semibold text-[#1a6fbb]'
                  : 'hover:text-[#1a6fbb] transition-colors'
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth buttons + mobile hamburger */}
        <div className="flex items-center gap-3">
          {showAuth && (
            <div className="hidden items-center gap-3 md:flex">
              {user ? (
                <Link
                  to="/dashboard"
                  className="rounded-md bg-[#1a6fbb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#155fa0] transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth?mode=login"
                    className="text-sm font-medium text-[#1a1a1a] hover:text-[#1a6fbb] transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/auth"
                    className="rounded-md border border-[#1a6fbb] px-4 py-2 text-sm font-semibold text-[#1a6fbb] hover:bg-[#1a6fbb] hover:text-white transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Hamburger — always visible on mobile */}
          <button
            className="rounded-lg p-2 text-[#1a1a1a] hover:bg-[#a8d0ed] transition-colors md:hidden"
            onClick={() => setOpen(prev => !prev)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="mt-3 border-t border-[#a8d0ed] pt-3 pb-2 space-y-0.5 md:hidden">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                activePath === link.to
                  ? 'bg-[#dbeafe] font-semibold text-[#1a6fbb]'
                  : 'text-[#1a1a1a] hover:bg-[#dbeafe] hover:text-[#1a6fbb]'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {showAuth && (
            <div className="mt-2 border-t border-[#a8d0ed] pt-3 space-y-2">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-md bg-[#1a6fbb] px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth?mode=login"
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-md border border-[#1a6fbb] px-4 py-2.5 text-center text-sm font-semibold text-[#1a6fbb]"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-md bg-[#1a6fbb] px-4 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
