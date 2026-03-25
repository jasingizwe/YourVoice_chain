import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Brand from '@/components/Brand';

type Tab = 'eula' | 'privacy';

export default function TermsPage() {
  const [tab, setTab] = useState<Tab>('eula');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex-1 flex justify-center">
            <Brand size="sm" showText />
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Tab switcher */}
        <div className="flex flex-col sm:flex-row rounded-xl border border-border bg-card p-1 mb-8 w-full sm:w-fit mx-auto gap-1 sm:gap-0">
          <button
            onClick={() => setTab('eula')}
            className={`flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
              tab === 'eula'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            End User License Agreement
          </button>
          <button
            onClick={() => setTab('privacy')}
            className={`flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
              tab === 'privacy'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Privacy Policy
          </button>
        </div>

        {/* Document */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-8 shadow-sm">
          {tab === 'eula' ? <EulaContent /> : <PrivacyContent />}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Questions? Contact us at{' '}
          <a href="mailto:yourvoice@gmail.com" className="text-primary hover:underline">
            yourvoice@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-semibold text-foreground mb-2">
        {number}. {title}
      </h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function DocHeader({ title, effectiveDate }: { title: string; effectiveDate: string }) {
  return (
    <div className="mb-8 pb-6 border-b border-border">
      <h1 className="text-2xl font-bold text-foreground mb-1">{title}</h1>
      <p className="text-xs text-muted-foreground">
        Effective Date: {effectiveDate} &nbsp;·&nbsp; Last Updated: {effectiveDate}
      </p>
    </div>
  );
}

function EulaContent() {
  return (
    <div>
      <DocHeader title="End User License Agreement" effectiveDate="25th March, 2026" />

      <Section number={1} title="Acceptance of Terms">
        <p>
          By accessing or using YourVoice, you agree to be bound by this End User License Agreement.
          If you do not agree, do not use the Platform.
        </p>
      </Section>

      <Section number={2} title="Description of Service">
        <p>
          YourVoice is a confidential digital reporting and case management platform designed to support
          survivors of gender-based violence and other forms of harm. The Platform allows users to submit
          reports, track case progress, and connect with support resources.
        </p>
      </Section>

      <Section number={3} title="Eligibility">
        <p>
          You must be at least 18 years old to use this Platform. Users under 18 may only access the
          Platform with the involvement of a trusted adult or authorized guardian.
        </p>
      </Section>

      <Section number={4} title="License Grant">
        <p>
          YourVoice grants you a limited, non-exclusive, non-transferable, revocable license to access
          and use the Platform solely for its intended purpose of reporting and case management.
        </p>
      </Section>

      <Section number={5} title="Prohibited Uses">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use the Platform to submit false or malicious reports</li>
          <li>Attempt to access another user's account or case data</li>
          <li>Reverse engineer, copy, or distribute any part of the Platform</li>
          <li>Use the Platform for any unlawful purpose</li>
        </ul>
      </Section>

      <Section number={6} title="Account Responsibility">
        <p>
          You are responsible for maintaining the confidentiality of your login credentials. Notify us
          immediately if you suspect unauthorized access to your account.
        </p>
      </Section>

      <Section number={7} title="Intellectual Property">
        <p>
          All content, design, and functionality of YourVoice remains the intellectual property of the
          YourVoice team. You may not reproduce or redistribute any part of the Platform without written
          permission.
        </p>
      </Section>

      <Section number={8} title="Disclaimer of Warranties">
        <p>
          The Platform is provided "as is." YourVoice does not guarantee uninterrupted access or that
          the Platform will be free from errors. We are not liable for any decisions made based on
          information provided through the Platform.
        </p>
      </Section>

      <Section number={9} title="Limitation of Liability">
        <p>
          To the fullest extent permitted by law, YourVoice shall not be liable for any indirect,
          incidental, or consequential damages arising from your use of the Platform.
        </p>
      </Section>

      <Section number={10} title="Termination">
        <p>
          YourVoice reserves the right to suspend or terminate access for any user who violates this
          agreement or misuses the Platform.
        </p>
      </Section>

      <Section number={11} title="Changes to This Agreement">
        <p>
          We may update this EULA from time to time. Continued use of the Platform after changes are
          posted constitutes acceptance of the revised terms.
        </p>
      </Section>

      <Section number={12} title="Contact">
        <p>
          For questions about this agreement, contact us at:{' '}
          <a href="mailto:yourvoice@gmail.com" className="text-primary hover:underline">
            yourvoice@gmail.com
          </a>
        </p>
      </Section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div>
      <DocHeader title="Privacy Policy" effectiveDate="25th March, 2026" />

      <Section number={1} title="Introduction">
        <p>
          YourVoice is committed to protecting your privacy and the confidentiality of your personal
          information. This Privacy Policy explains what data we collect, how we use it, and your rights
          regarding that data.
        </p>
      </Section>

      <Section number={2} title="Information We Collect">
        <p className="font-medium text-foreground">Information you provide:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Name (or anonymous identifier if you choose)</li>
          <li>Email address</li>
          <li>Case details and supporting documents you submit</li>
          <li>Communications with case managers or admins</li>
        </ul>
        <p className="font-medium text-foreground mt-3">Information collected automatically:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Login timestamps and session data</li>
          <li>Device type and browser information</li>
          <li>IP address (used only for security purposes)</li>
        </ul>
      </Section>

      <Section number={3} title="How We Use Your Information">
        <p>We use your data to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Process and manage your submitted cases</li>
          <li>Communicate with you about case updates</li>
          <li>Maintain platform security and prevent misuse</li>
          <li>Improve the Platform's functionality</li>
          <li>Comply with legal obligations where required</li>
        </ul>
      </Section>

      <Section number={4} title="Anonymity and Confidentiality">
        <p>
          You have the option to submit reports anonymously. When anonymous reporting is selected, we do
          not link your identity to your case. All case data is stored securely and is only accessible
          to authorized personnel.
        </p>
      </Section>

      <Section number={5} title="Data Sharing">
        <p>
          We do not sell, rent, or trade your personal information. We may share data only in the
          following circumstances:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>With authorized case managers handling your report</li>
          <li>With law enforcement or legal authorities only if required by law</li>
          <li>
            With third-party service providers who help operate the Platform, under strict
            confidentiality agreements
          </li>
        </ul>
      </Section>

      <Section number={6} title="Data Storage and Security">
        <p>
          Your data is stored using industry-standard encryption. We implement technical and
          organizational measures to protect your information from unauthorized access, loss, or
          disclosure.
        </p>
      </Section>

      <Section number={7} title="Data Retention">
        <p>
          We retain your data only as long as necessary for the purpose it was collected, or as required
          by applicable law. You may request deletion of your data at any time (see Section 9).
        </p>
      </Section>

      <Section number={8} title="Cookies">
        <p>
          The Platform uses essential cookies to manage your session and keep you logged in. We do not
          use tracking or advertising cookies.
        </p>
      </Section>

      <Section number={9} title="Your Rights">
        <p>Depending on your jurisdiction, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Withdraw consent at any time</li>
          <li>Lodge a complaint with a relevant data protection authority</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at:{' '}
          <a href="mailto:yourvoice@gmail.com" className="text-primary hover:underline">
            yourvoice@gmail.com
          </a>
        </p>
      </Section>

      <Section number={10} title="Children's Privacy">
        <p>
          YourVoice is not intended for users under 18 without adult supervision. We do not knowingly
          collect personal data from minors without appropriate consent.
        </p>
      </Section>

      <Section number={11} title="Changes to This Policy">
        <p>
          We may update this Privacy Policy periodically. We will notify users of significant changes
          via the Platform or by email.
        </p>
      </Section>

      <Section number={12} title="Contact Us">
        <p>If you have any questions or concerns about this Privacy Policy, please contact:</p>
        <p className="mt-1">
          YourVoice Team
          <br />
          Email:{' '}
          <a href="mailto:yourvoice@gmail.com" className="text-primary hover:underline">
            yourvoice@gmail.com
          </a>
        </p>
      </Section>
    </div>
  );
}
