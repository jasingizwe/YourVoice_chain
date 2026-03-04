import { Link } from 'react-router-dom';
import { HeartHandshake, Shield, Users } from 'lucide-react';
import Brand from '@/components/Brand';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#e2ded3] p-3 md:p-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-[#dfd8c8] bg-[#f7f2e7] shadow-[0_30px_80px_-40px_rgba(12,24,40,0.35)]">
        <header className="px-5 py-5 md:px-10">
          <div className="flex items-center justify-between gap-3">
            <Brand size="lg" showText={false} />
            <nav className="hidden items-center gap-8 text-sm font-medium text-[#272b2f] md:flex">
              <Link to="/guide/features" className="hover:text-black">Features</Link>
              <Link to="/guide/how-it-works" className="hover:text-black">How it works</Link>
              <Link to="/dashboard/cases" className="hover:text-black">Cases</Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/auth?mode=login">
                <Button variant="outline" size="sm" className="rounded-full border-[#ddd6c6] bg-white/70 text-[#1f2328]">Sign in</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="rounded-full bg-[#efc37f] px-5 text-[#1f1e1a] hover:bg-[#e7b86e]">Get Started</Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="px-5 pb-8 md:px-10">
          <section className="py-6">
            <h1
              className="text-[48px] font-semibold leading-[0.95] text-[#1f2328] md:text-[80px]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Your voice. Your power
            </h1>
          </section>

          <section className="mb-8 mt-8 border-y border-[#e2dccf] py-5">
            <div className="grid gap-3 text-sm font-medium text-[#2a2f34] md:grid-cols-4">
              <span>Private reporting</span>
              <span>Evidence tracking</span>
              <span>Role-based access</span>
              <span>Survivor-first workflow</span>
            </div>
          </section>

          <section className="pb-4">
            <div className="mb-7 text-center">
              <p className="mb-2 inline-flex rounded-full bg-[#d7efe0] px-3 py-1 text-xs font-semibold text-[#2c7354]">
                What We Do
              </p>
              <h2 className="mx-auto max-w-3xl font-heading text-4xl font-semibold leading-tight text-[#1f2328] md:text-5xl">
                Providing support, structure, and safety during difficult moments
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-[#ddd6c6] bg-white p-5">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f6eddd] text-[#9b7b42]">
                  <HeartHandshake className="h-4 w-4" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[#1f2328]">Get Support</h3>
                <p className="mt-2 text-sm text-[#62655f]">Access guided case steps, safe documentation, and practical follow-up support.</p>
              </div>

              <div className="rounded-[24px] border border-[#ddd6c6] bg-white p-5">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e4edf8] text-[#355a88]">
                  <Shield className="h-4 w-4" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[#1f2328]">Protect Evidence</h3>
                <p className="mt-2 text-sm text-[#62655f]">Keep records organized with clear timelines and controlled visibility.</p>
              </div>

              <div className="rounded-[24px] border border-[#ddd6c6] bg-white p-5">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e7f2ec] text-[#3f775f]">
                  <Users className="h-4 w-4" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[#1f2328]">Coordinate Safely</h3>
                <p className="mt-2 text-sm text-[#62655f]">Share only what is needed with trusted people and institutions.</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
