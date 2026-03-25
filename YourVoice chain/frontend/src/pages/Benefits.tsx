import { Link } from 'react-router-dom';
import { Database, Eye, FileText, Lock, Smartphone, Users } from 'lucide-react';
import Brand from '@/components/Brand';
import Footer from '@/components/Footer';
import PublicNavbar from '@/components/PublicNavbar';

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
    <div className="min-h-screen bg-[#f0f7ff] font-sans">

      <PublicNavbar activePath="/guide/features" />

      {/* HERO */}
      <section className="bg-[#f0f7ff] px-6 py-16 md:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#1a6fbb]">Core Platform Features</p>
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
      <section className="bg-[#f0f7ff] px-6 py-12 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-[#e8e2da] bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#bee3f8]">
                  <feature.icon className="h-7 w-7 text-[#1a6fbb]" />
                </div>
                <h2 className="text-lg font-bold text-[#1a1a1a]">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#666]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}
