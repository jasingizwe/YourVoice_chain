import { Link } from 'react-router-dom';
import { FileText, Share2, Upload, UserPlus } from 'lucide-react';
import Brand from '@/components/Brand';
import Footer from '@/components/Footer';
import PublicNavbar from '@/components/PublicNavbar';

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
    <div className="min-h-screen bg-[#f0f7ff] font-sans">

      <PublicNavbar activePath="/guide/how-it-works" />

      {/* HERO */}
      <section className="bg-[#f0f7ff] px-6 py-16 md:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#1a6fbb]">Guided Case Flow</p>
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
                className="rounded-2xl border border-[#e8e2da] bg-[#f0f7ff] p-6 shadow-sm"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#bee3f8]">
                  <step.icon className="h-7 w-7 text-[#1a6fbb]" />
                </div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#1a6fbb]">{step.step}</p>
                <h2 className="text-lg font-bold text-[#1a1a1a]">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#666]">{step.description}</p>
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
