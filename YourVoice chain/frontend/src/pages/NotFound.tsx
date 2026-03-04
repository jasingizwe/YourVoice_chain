import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Brand from '@/components/Brand';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#e2ded3] p-3 md:p-8 dark:bg-[#121619]">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-6xl items-center justify-center overflow-hidden rounded-[28px] border border-[#dfd8c8] bg-[#f7f2e7] px-4 shadow-[0_30px_80px_-40px_rgba(12,24,40,0.35)] md:min-h-[calc(100vh-4rem)] dark:border-[#2a3136] dark:bg-[#1b2228]">
        <div className="w-full max-w-md rounded-2xl border border-[#ddd6c6] bg-white p-8 text-center shadow-sm dark:border-[#36404a] dark:bg-[#232c34]">
          <div className="mb-5 flex items-center justify-center">
            <Brand size="lg" />
          </div>
          <h1 className="font-heading text-6xl text-[#1f2328] dark:text-[#edf2f7]">404</h1>
          <p className="mt-2 text-[#64748B] dark:text-[#b5c1cb]">The page you&apos;re looking for does not exist.</p>
          <Link to="/" className="mt-5 inline-flex">
            <Button className="rounded-full gap-2 bg-[#efc37f] text-[#1f1e1a] hover:bg-[#e7b86e]">
              <ArrowLeft className="h-4 w-4" /> Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
