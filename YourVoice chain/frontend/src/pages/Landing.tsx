import { Link } from 'react-router-dom';
import { HeartHandshake, Shield, Users, Phone } from 'lucide-react';
import Brand from '@/components/Brand';
import Footer from '@/components/Footer';
import PublicNavbar from '@/components/PublicNavbar';
import { useAuth } from '@/hooks/useAuth';

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-[#f0f7ff] font-sans">

      <PublicNavbar activePath="/" showAuth />

      {/* HERO */}
      <section className="bg-[#f0f7ff] px-6 py-20 md:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row">
          {/* Left */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold leading-tight text-[#1a1a1a] sm:text-4xl md:text-5xl lg:text-6xl">
              Your voice.<br />
              <span className="text-[#1a6fbb]">Your power.</span>
            </h1>
            <p className="mt-4 text-lg italic text-[#555]">Safe, private, and survivor-first.</p>
            <Link
              to="/guide/how-it-works"
              className="mt-6 inline-flex items-center gap-1 text-[#1a6fbb] font-semibold hover:underline"
            >
              See how it works →
            </Link>
          </div>
          {/* Right — image */}
          <div className="flex-shrink-0">
            <img
              src="/your.jpeg"
              alt="Survivor support"
              className="h-80 w-80 rounded-2xl object-cover md:h-96 md:w-96"
            />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-white px-6 py-16 md:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-[#1a1a1a] md:text-4xl">About YourVoice</h2>
          <p className="mt-4 text-[#555] leading-relaxed">
            YourVoice is a blockchain-powered platform designed to help survivors of gender-based violence
            document cases securely, protect evidence, and share access only with trusted actors,
            without fear of tampering, loss, or institutional misuse.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-[#f0f7ff] px-6 py-16 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-[#e8e2da] bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#bee3f8]">
                <HeartHandshake className="h-7 w-7 text-[#1a6fbb]" />
              </div>
              <h3 className="text-lg font-bold text-[#1a1a1a]">Get Support</h3>
              <p className="mt-2 text-sm text-[#666] leading-relaxed">
                Access guided case steps, safe documentation, and practical follow-up support.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8e2da] bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#bee3f8]">
                <Shield className="h-7 w-7 text-[#1a6fbb]" />
              </div>
              <h3 className="text-lg font-bold text-[#1a1a1a]">Protect Evidence</h3>
              <p className="mt-2 text-sm text-[#666] leading-relaxed">
                Keep records organized with clear timelines and controlled visibility.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8e2da] bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#bee3f8]">
                <Users className="h-7 w-7 text-[#1a6fbb]" />
              </div>
              <h3 className="text-lg font-bold text-[#1a1a1a]">Coordinate Safely</h3>
              <p className="mt-2 text-sm text-[#666] leading-relaxed">
                Share only what is needed with trusted people and institutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GET SUPPORT STRIP */}
      <section className="bg-[#f0f7ff] border-y border-[#bee3f8] px-6 py-14 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#1a6fbb]">You are not alone</p>
            <h2 className="text-3xl font-bold text-[#1a1a1a]">Need support right now?</h2>
            <p className="mt-2 text-[#555]">Reach one of these organisations, they are ready to help.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {/* Isange */}
            <div className="rounded-2xl bg-white border border-[#e8e2da] p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#1a6fbb] mb-1">Immediate Care</p>
              <h3 className="font-bold text-[#1a1a1a] mb-2">Isange One Stop Centre</h3>
              <p className="text-sm text-[#666] mb-4 leading-relaxed">
                Medical care, legal support, forensic exams, and shelter, all in one place, across 48 hospitals.
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#bee3f8] px-4 py-2 text-sm font-bold text-[#1a6fbb]">
                <Phone className="h-3.5 w-3.5" /> Call 3029
              </span>
            </div>
            {/* RIB */}
            <div className="rounded-2xl bg-white border border-[#e8e2da] p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#1a6fbb] mb-1">Report a Case</p>
              <h3 className="font-bold text-[#1a1a1a] mb-2">Rwanda Investigation Bureau</h3>
              <p className="text-sm text-[#666] mb-4 leading-relaxed">
                Specialised GBV units available to receive reports and begin immediate investigation.
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#bee3f8] px-4 py-2 text-sm font-bold text-[#1a6fbb]">
                <Phone className="h-3.5 w-3.5" /> Call 116 or 3512
              </span>
            </div>
            {/* Haguruka */}
            <div className="rounded-2xl bg-white border border-[#e8e2da] p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#1a6fbb] mb-1">Legal Aid</p>
              <h3 className="font-bold text-[#1a1a1a] mb-2">Haguruka</h3>
              <p className="text-sm text-[#666] mb-4 leading-relaxed">
                Legal aid, justice support, and psychosocial services for GBV survivors across Rwanda.
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#bee3f8] px-4 py-2 text-sm font-bold text-[#1a6fbb]">
                <Phone className="h-3.5 w-3.5" /> +250 788 300 834
              </span>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/resources"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#1a6fbb] hover:underline"
            >
              View all support organisations →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}
