import { Link } from 'react-router-dom';
import Brand from '@/components/Brand';

export default function Footer() {
  return (
    <footer className="bg-[#1a2d3d] px-6 py-6 md:px-16">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[2fr_1fr] items-start">
        <div>
          <Brand linkTo="/" className="opacity-90" />
          <p className="mt-1.5 text-xs text-[#b0cfe0] leading-relaxed">
            A survivor-centred platform for secure GBV case documentation and management.
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold text-white uppercase tracking-wide">Quick Links</p>
          <ul className="space-y-1.5 text-xs text-[#b0cfe0]">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/guide/features" className="hover:text-white transition-colors">Features</Link></li>
            <li><Link to="/guide/how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
            <li><Link to="/resources" className="hover:text-white transition-colors">Resources</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms &amp; Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-5 max-w-6xl border-t border-[#2a4a62] pt-4 flex flex-col items-center gap-1.5 md:flex-row md:justify-between">
        <p className="text-xs text-[#b0cfe0]">© 2026 YourVoice. All rights reserved.</p>
        <div className="flex items-center gap-3 text-xs text-[#b0cfe0]">
          <Link to="/terms" className="hover:text-white transition-colors">EULA</Link>
          <span className="text-[#2a4a62]">·</span>
          <Link to="/terms" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span className="text-[#2a4a62]">·</span>
          <a href="mailto:yourvoice@gmail.com" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
