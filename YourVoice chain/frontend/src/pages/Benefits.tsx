import { Link } from 'react-router-dom';
import { ArrowRight, Database, Eye, FileText, Lock, Smartphone, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Brand from '@/components/Brand';

const features = [
  { icon: Lock, title: 'Full Survivor Control', description: 'You decide who can see your data and can revoke access at any time.' },
  { icon: Database, title: 'Secure Evidence Storage', description: 'Evidence is stored securely and linked with verifiable records.' },
  { icon: Users, title: 'Role-Based Access', description: 'Only verified and authorized actors can access granted records.' },
  { icon: Eye, title: 'Privacy by Design', description: 'Sensitive personal data is protected while integrity logs stay auditable.' },
  { icon: FileText, title: 'Easy Documentation', description: 'Simple forms make it easier to create and maintain case records.' },
  { icon: Smartphone, title: 'Works Across Devices', description: 'Use the platform on phone, tablet, or desktop with the same flow.' },
];

export default function Benefits() {
  return (
    <div className="min-h-screen bg-[#e2ded3] p-3 md:p-8 dark:bg-[#121619]">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-[#dfd8c8] bg-[#f7f2e7] shadow-[0_30px_80px_-40px_rgba(12,24,40,0.35)] dark:border-[#2a3136] dark:bg-[#1b2228]">
        <header className="px-5 py-5 md:px-10">
          <div className="flex items-center justify-between gap-3">
            <Brand size="lg" />
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#272b2f] dark:text-[#d6dde3]">
              <Link to="/" className="hover:text-black dark:hover:text-white">Home</Link>
              <Link to="/guide/features" className="hover:text-black dark:hover:text-white">Features</Link>
              <Link to="/guide/how-it-works" className="hover:text-black dark:hover:text-white">How it works</Link>
              <Link to="/dashboard/cases" className="hover:text-black dark:hover:text-white">Cases</Link>
            </nav>
            <Link to="/guide/how-it-works">
              <Button size="sm" className="rounded-full gap-2 px-5 bg-[#efc37f] text-[#1f1e1a] hover:bg-[#e7b86e]">
                How It Works <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>

        <main className="px-5 pb-6 md:px-10 md:pb-10">
          <div className="mb-7 max-w-2xl">
            <p className="mb-2 text-xs tracking-[0.22em] text-[#4f5f6d] dark:text-[#9fb0bf]">CORE PLATFORM FEATURES</p>
            <h1 className="font-heading text-4xl text-[#1A202C] md:text-5xl dark:text-[#edf2f7]">Everything built around survivor safety</h1>
            <p className="mt-3 text-[#4e5861] dark:text-[#b7c2cc]">Key features that support secure case reporting, controlled sharing, and accountable follow-up.</p>
          </div>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-[#ddd6c6] bg-white p-5 shadow-sm dark:border-[#36404a] dark:bg-[#232c34]">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6eddd] text-[#9b7b42] dark:bg-[#2b3942] dark:text-[#efc37f]">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h2 className="font-heading text-xl text-[#1A202C] dark:text-[#edf2f7]">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B] dark:text-[#b5c1cb]">{feature.description}</p>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
