import { ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, FileText, Users, Settings, BookOpen, House, ShieldCheck, PlusCircle, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Brand from '@/components/Brand';

const roleNavItems = {
  survivor: [
    { icon: House, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'My Cases', path: '/dashboard/cases' },
    { icon: PlusCircle, label: 'New Case', path: '/dashboard/cases/new' },
    { icon: BookOpen, label: 'Guide', path: '/guide/features' },
  ],
  authority: [
    { icon: House, label: 'Dashboard', path: '/dashboard' },
    { icon: ShieldCheck, label: 'Assigned Cases', path: '/dashboard/cases' },
    { icon: BookOpen, label: 'Guide', path: '/guide/features' },
  ],
  admin: [
    { icon: House, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Users', path: '/dashboard/users' },
    { icon: ScrollText, label: 'Audit Log', path: '/dashboard/audit' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ],
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = role ? roleNavItems[role] : [];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col border-r border-border bg-card p-4 md:flex">
        <div className="mb-8 px-2">
          <Brand size="lg" />
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard/cases' && location.pathname.startsWith('/dashboard/cases/'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-border pt-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium text-foreground">{user?.email}</p>
            <p className="text-xs capitalize text-muted-foreground">{role}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Log Out
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <Brand size="sm" />
          <div className="flex items-center gap-2">
            <span className="text-xs capitalize text-muted-foreground">{role}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <nav className="flex items-center gap-1 overflow-x-auto border-b border-border bg-card px-4 py-2 md:hidden">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard/cases' && location.pathname.startsWith('/dashboard/cases/'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
