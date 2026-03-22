import { Link } from 'react-router-dom';
import { FileText, Share2, Upload, UserPlus } from 'lucide-react';
import Brand from '@/components/Brand';

const steps = [
  {
    icon: UserPlus,
    step: 'Step 1',
    title: 'Log In or Create Account',
    description: 'Use your account to access the secure workflow.',
  },
  {
    icon: Upload,
    step: 'Step 2',
    title: 'Submit Case Evidence',
    description: 'Add case details and upload evidence files in one place.',
  },
  {
    icon: Share2,
    step: 'Step 3',
    title: 'Grant Access',
    description: 'Choose exactly which trusted actors can view records.',
  },
  {
    icon: FileText,
    step: 'Step 4',
    title: 'Track Progress',
    description: 'Review updates, status changes, and activity history on your cases.',
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-[#faf8f3] font-sans">

      {/* NAVBAR */}
      <header className="bg-[#f9c8d4] px-6 py-4 md:px-16">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Brand size="md" showText={false} />
          <nav className="flex items-center gap-8 text-sm font-medium text-[#1a1a1a]">
            <Link to="/" className="hover:text-[#c0394b] transition-colors">Home</Link>
            <Link to="/guide/features" className="hover:text-[#c0394b] transition-colors">Features</Link>
            <Link to="/guide/how-it-works" className="font-semibold text-[#c0394b]">How it works</Link>
            <Link to="/resources" className="hover:text-[#c0394b] transition-colors">Resources</Link>
            <Link to="/dashboard/cases" className="hover:text-[#c0394b] transition-colors">Cases</Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-[#faf8f3] px-6 py-16 md:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#c0394b]">Guided Case Flow</p>
          <h1 className="text-4xl font-bold text-[#1a1a1a] md:text-5xl">How YourVoice works</h1>
          <p className="mt-3 max-w-xl text-[#555]">
            Follow these steps to submit, protect, and monitor your case from one place.
          </p>
        </div>
      </section>

      {/* STEPS */}
      <section className="bg-white px-6 py-12 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-[#e8e2da] bg-[#faf8f3] p-6 shadow-sm"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f9c8d4]">
                  <step.icon className="h-7 w-7 text-[#c0394b]" />
                </div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#c0394b]">{step.step}</p>
                <h2 className="text-lg font-bold text-[#1a1a1a]">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#666]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#111] px-6 py-12 md:px-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[2fr_1fr]">
          <div>
            <Brand linkTo="/" className="opacity-90" />
            <p className="mt-2 text-sm text-[#aaa] leading-relaxed">
              A survivor-centred platform for secure GBV case documentation and management.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-white">Quick Links</p>
            <ul className="space-y-2 text-sm text-[#aaa]">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/guide/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/guide/how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
              <li><Link to="/resources" className="hover:text-white transition-colors">Resources</Link></li>
            </ul>
          </div>
        </div>
      </footer>

    </div>
  );
}
