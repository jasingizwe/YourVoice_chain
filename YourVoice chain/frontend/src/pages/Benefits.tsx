import { Link } from 'react-router-dom';
import { Database, Eye, FileText, Lock, Smartphone, Users } from 'lucide-react';
import Brand from '@/components/Brand';

const features = [
  {
    icon: Lock,
    title: 'Full Survivor Control',
    description: 'You decide who can see your data and can revoke access at any time.',
  },
  {
    icon: Database,
    title: 'Secure Evidence Storage',
    description: 'Evidence is stored securely and linked with verifiable records.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Only verified and authorized actors can access granted records.',
  },
  {
    icon: Eye,
    title: 'Privacy by Design',
    description: 'Sensitive personal data is protected while integrity logs stay auditable.',
  },
  {
    icon: FileText,
    title: 'Easy Documentation',
    description: 'Simple forms make it easier to create and maintain case records.',
  },
  {
    icon: Smartphone,
    title: 'Works Across Devices',
    description: 'Use the platform on phone, tablet, or desktop with the same flow.',
  },
];

export default function Benefits() {
  return (
    <div className="min-h-screen bg-[#faf8f3] font-sans">

      {/* NAVBAR */}
      <header className="bg-[#f9c8d4] px-6 py-4 md:px-16">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Brand size="md" showText={false} />
          <nav className="flex items-center gap-8 text-sm font-medium text-[#1a1a1a]">
            <Link to="/" className="hover:text-[#c0394b] transition-colors">Home</Link>
            <Link to="/guide/features" className="font-semibold text-[#c0394b]">Features</Link>
            <Link to="/guide/how-it-works" className="hover:text-[#c0394b] transition-colors">How it works</Link>
            <Link to="/resources" className="hover:text-[#c0394b] transition-colors">Resources</Link>
            <Link to="/dashboard/cases" className="hover:text-[#c0394b] transition-colors">Cases</Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-[#faf8f3] px-6 py-16 md:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#c0394b]">Core Platform Features</p>
          <h1 className="text-4xl font-bold text-[#1a1a1a] md:text-5xl">Everything built around survivor safety</h1>
          <p className="mt-3 max-w-xl text-[#555]">
            Key features that support secure case reporting, controlled sharing, and accountable follow-up.
          </p>
        </div>
      </section>

      {/* ABOUT STRIP */}
      <section className="bg-white px-6 py-12 md:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Why these features matter</h2>
          <p className="mt-3 text-[#555] leading-relaxed">
            Survivors deserve tools that respect their autonomy. Every feature in YourVoice was designed
            to keep sensitive information private, verifiable, and fully under the survivor's control.
          </p>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="bg-[#faf8f3] px-6 py-12 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-[#e8e2da] bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f9c8d4]">
                  <feature.icon className="h-7 w-7 text-[#c0394b]" />
                </div>
                <h2 className="text-lg font-bold text-[#1a1a1a]">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#666]">{feature.description}</p>
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
