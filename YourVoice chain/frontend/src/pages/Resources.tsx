import { Link } from 'react-router-dom';
import { Phone, Mail, Globe, AlertCircle, Scale, Building2 } from 'lucide-react';
import Brand from '@/components/Brand';
import Footer from '@/components/Footer';
import PublicNavbar from '@/components/PublicNavbar';

const immediateOrgs = [
  {
    name: 'Isange One Stop Centres (IOSC)',
    description:
      'Located in Kacyiru Police Hospital and 48 other hospitals across Rwanda. Offers medical care, forensic examinations, legal support, psychosocial services, and safe shelter, all in one place.',
    phone: '3029',
    phoneLabel: 'Toll-Free Hotline',
    email: 'info@rutongohospital.gov.rw',
  },
  {
    name: 'Rwanda Investigation Bureau (RIB)',
    description:
      'Specialised units for GBV and child abuse. Contact them immediately to report cases and begin a formal investigation.',
    phone: '116 / 3512',
    phoneLabel: 'Hotlines',
    email: 'info@rib.gov.rw',
  },
  {
    name: 'Police Emergency Services',
    description:
      'For immediate danger, call the national police emergency line.',
    phone: '112',
    phoneLabel: 'Emergency',
    email: null,
  },
];

const ngoOrgs = [
  {
    name: 'Haguruka',
    description:
      'A Rwandan NGO providing legal aid, access to justice, and psychosocial support to GBV victims, with a strong focus on women\'s rights advocacy.',
    phone: '+250 788 300 834 / +250 788 381 183',
    phoneLabel: 'Contact',
    email: 'info@haguruka.org.rw',
    website: null,
  },
  {
    name: 'Rwanda Women\'s Network (RWN)',
    description:
      'Operates 24 safe spaces across 12 districts for counselling, emotional healing, and community reintegration of survivors.',
    phone: '+250 788 334 257',
    phoneLabel: 'Contact',
    tollFree: '3435',
    email: 'info@rwandawomennetwork.org',
    website: null,
  },
  {
    name: 'RWAMREC (Rwanda Men Resource Centre)',
    description:
      'Engages men and boys to take an active role in preventing and stopping GBV in their communities.',
    phone: null,
    phoneLabel: null,
    email: null,
    website: null,
  },
];

const govOrgs = [
  {
    name: 'Gender Monitoring Office (GMO)',
    description:
      'Government body responsible for monitoring GBV response across Rwanda and receiving complaints about failures in the system.',
    phone: '5798',
    phoneLabel: 'Hotline',
    email: 'info@gmo.gov.rw',
    website: null,
  },
  {
    name: 'Ministry of Gender and Family Promotion (MIGEPROF)',
    description:
      'The lead ministry for formulating and coordinating national policies on GBV prevention and response.',
    phone: '9059',
    phoneLabel: 'Hotline',
    email: null,
    website: null,
  },
  {
    name: 'MAJ, Access to Justice Bureau',
    description:
      'Available in every district, MAJ provides free legal services and guidance to citizens, including GBV survivors seeking justice.',
    phone: null,
    phoneLabel: null,
    email: null,
    website: 'https://ganubutabera.minijust.gov.rw/',
  },
];

function OrgCard({
  name,
  description,
  phone,
  phoneLabel,
  tollFree,
  email,
  website,
}: {
  name: string;
  description: string;
  phone?: string | null;
  phoneLabel?: string | null;
  tollFree?: string;
  email?: string | null;
  website?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e2da] bg-white p-6 shadow-sm flex flex-col gap-3">
      <h3 className="text-base font-bold text-[#1a1a1a] leading-snug">{name}</h3>
      <p className="text-sm text-[#666] leading-relaxed flex-1">{description}</p>
      <div className="flex flex-col gap-1.5 mt-1">
        {phone && (
          <span className="flex items-center gap-2 text-sm text-[#1a1a1a]">
            <Phone className="h-3.5 w-3.5 text-[#1a6fbb] shrink-0" />
            <span className="text-[#888] mr-1">{phoneLabel}:</span>
            <strong>{phone}</strong>
          </span>
        )}
        {tollFree && (
          <span className="flex items-center gap-2 text-sm text-[#1a1a1a]">
            <Phone className="h-3.5 w-3.5 text-[#1a6fbb] shrink-0" />
            <span className="text-[#888] mr-1">Toll-Free:</span>
            <strong>{tollFree}</strong>
          </span>
        )}
        {email && (
          <span className="flex items-center gap-2 text-sm text-[#1a1a1a]">
            <Mail className="h-3.5 w-3.5 text-[#1a6fbb] shrink-0" />
            <a href={`mailto:${email}`} className="hover:text-[#1a6fbb] transition-colors break-all">
              {email}
            </a>
          </span>
        )}
        {website && (
          <span className="flex items-center gap-2 text-sm text-[#1a1a1a]">
            <Globe className="h-3.5 w-3.5 text-[#1a6fbb] shrink-0" />
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1a6fbb] transition-colors break-all"
            >
              {website}
            </a>
          </span>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  label,
  title,
}: {
  icon: React.ElementType;
  label: string;
  title: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#bee3f8]">
        <Icon className="h-5 w-5 text-[#1a6fbb]" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1a6fbb]">{label}</p>
        <h2 className="text-xl font-bold text-[#1a1a1a]">{title}</h2>
      </div>
    </div>
  );
}

export default function Resources() {
  return (
    <div className="min-h-screen bg-[#f0f7ff] font-sans">

      <PublicNavbar activePath="/resources" />

      {/* HERO */}
      <section className="bg-[#f0f7ff] px-6 py-16 md:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#1a6fbb]">Support Directory</p>
          <h1 className="text-4xl font-bold text-[#1a1a1a] md:text-5xl">Support & Resources</h1>
          <p className="mt-3 max-w-xl text-[#555]">
            You are not alone. These organisations are here to help, whether you need immediate care,
            legal support, or someone to talk to.
          </p>
        </div>
      </section>

      {/* EMERGENCY BANNER */}
      <div className="bg-[#1a6fbb] px-6 py-4 md:px-16">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <AlertCircle className="h-5 w-5 text-white shrink-0" />
          <p className="text-sm font-semibold text-white">
            If you are in immediate danger, call <span className="underline">112</span> (Police Emergency) or{' '}
            <span className="underline">3029</span> (Isange One Stop Centre) right now.
          </p>
        </div>
      </div>

      {/* SECTION 1 — Immediate Care */}
      <section className="bg-white px-6 py-14 md:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            icon={AlertCircle}
            label="Immediate Care"
            title="Primary Specialised Services"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {immediateOrgs.map(org => (
              <OrgCard key={org.name} {...org} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2 — NGOs */}
      <section className="bg-[#f0f7ff] px-6 py-14 md:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            icon={Scale}
            label="NGOs"
            title="Legal Aid & Psychosocial Support"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {ngoOrgs.map(org => (
              <OrgCard key={org.name} {...org} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — Government */}
      <section className="bg-white px-6 py-14 md:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            icon={Building2}
            label="Government"
            title="Key Government Authorities"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {govOrgs.map(org => (
              <OrgCard key={org.name} {...org} />
            ))}
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}
