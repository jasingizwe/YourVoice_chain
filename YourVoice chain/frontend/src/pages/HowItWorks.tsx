import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Share2, Upload, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Brand from '@/components/Brand';

const steps = [
  { icon: UserPlus, step: 'Step 1', title: 'Log In or Create Account', description: 'Use your account to access the secure workflow.' },
  { icon: Upload, step: 'Step 2', title: 'Submit Case Evidence', description: 'Add case details and upload evidence files in one place.' },
  { icon: Share2, step: 'Step 3', title: 'Grant Access', description: 'Choose exactly which trusted actors can view records.' },
  { icon: FileText, step: 'Step 4', title: 'Track Progress', description: 'Review updates, status changes, and activity history on your cases.' },
];

export default function HowItWorks() {
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
            <div className="flex items-center gap-2">
              <Link to="/guide/features">
                <Button variant="outline" size="sm" className="rounded-full border-[#ddd6c6] bg-white/70 text-[#1f2328] dark:border-[#39424a] dark:bg-[#222a32] dark:text-[#edf2f7]">Back</Button>
              </Link>
              <Link to="/dashboard/cases">
                <Button size="sm" className="rounded-full gap-2 px-5 bg-[#efc37f] text-[#1f1e1a] hover:bg-[#e7b86e]">
                  Go To Cases <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="px-5 pb-6 md:px-10 md:pb-10">
          <div className="mb-7 max-w-2xl">
            <p className="mb-2 text-xs tracking-[0.22em] text-[#4f5f6d] dark:text-[#9fb0bf]">GUIDED CASE FLOW</p>
            <h1 className="font-heading text-4xl text-[#1A202C] md:text-5xl dark:text-[#edf2f7]">How YourVoice works</h1>
            <p className="mt-3 text-[#4e5861] dark:text-[#b7c2cc]">Follow these steps to submit, protect, and monitor your case from one place.</p>
          </div>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article key={step.title} className="rounded-2xl border border-[#ddd6c6] bg-white p-5 shadow-sm dark:border-[#36404a] dark:bg-[#232c34]">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6eddd] text-[#9b7b42] dark:bg-[#2b3942] dark:text-[#efc37f]">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#4f5f6d] dark:text-[#9fb0bf]">{step.step}</div>
                <h2 className="font-heading text-xl text-[#1A202C] dark:text-[#edf2f7]">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B] dark:text-[#b5c1cb]">{step.description}</p>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
