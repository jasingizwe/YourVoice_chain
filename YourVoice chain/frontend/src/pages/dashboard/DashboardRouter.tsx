import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import SurvivorDashboard from './SurvivorDashboard';
import AuthorityDashboard from './AuthorityDashboard';

export default function DashboardRouter() {
  const { role, loading } = useAuth();

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'authority') return <AuthorityDashboard />;
  if (role === 'survivor') return <SurvivorDashboard />;

  return <Navigate to="/dashboard/cases" replace />;
}
