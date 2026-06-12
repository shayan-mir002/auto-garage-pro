import { Link } from 'react-router-dom';
import { Wrench, Phone, Mail, MapPin, Share2, Rss, ExternalLink, Link as LinkIcon, ChevronRight } from 'lucide-react';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Service Plans', path: '/services' },
  { label: 'Product Catalog', path: '/products' },
  { label: 'Book Appointment', path: '/appointments' },
];

const services = [
  'Oil Change & Inspection',
  'Brake Service',
  'Tire Rotation',
  'Engine Tune-Up',
  'Full Detailing',
];

const socials = [
  { Icon: Share2,      href: '#', label: 'Share' },
  { Icon: LinkIcon,    href: '#', label: 'Website' },
  { Icon: Rss,         href: '#', label: 'RSS' },
  { Icon: ExternalLink,href: '#', label: 'More' },
];

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-300/40 mt-auto">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="p-2 rounded-lg bg-accent-gradient shadow-glow-orange">
                <Wrench size={18} className="text-dark-900" />
              </div>
              <div>
                <span className="block text-white font-display font-bold text-lg">AutoGarage Pro</span>
                <span className="block text-accent-orange text-[10px] font-semibold tracking-[0.15em] uppercase">Est. 2009</span>
              </div>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              Your trusted partner for professional car care. Serving the community for 15+ years with honesty, expertise, and precision.
            </p>
            <div className="flex gap-3">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="p-2 rounded-lg bg-dark-700 border border-dark-300/40 text-slate-500 hover:text-white hover:border-brand-700 hover:bg-brand-900/30 transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-accent-orange text-sm transition-colors group"
                  >
                    <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Our Services</h4>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s} className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-orange/60 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-accent-orange mt-0.5 flex-shrink-0" />
                <span className="text-slate-500 text-sm">1428 Engine Road, Mechanic District, CA 90210</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-accent-orange flex-shrink-0" />
                <a href="tel:+1234567890" className="text-slate-500 hover:text-white text-sm transition-colors">+1 (234) 567-890</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-accent-orange flex-shrink-0" />
                <a href="mailto:info@autogarage.pro" className="text-slate-500 hover:text-white text-sm transition-colors">info@autogarage.pro</a>
              </li>
            </ul>
            <div className="mt-5 p-3 rounded-lg bg-dark-700 border border-dark-300/40">
              <p className="text-xs text-slate-500 font-medium">Working Hours</p>
              <p className="text-sm text-slate-300 mt-1">Mon – Sat: 8:00 AM – 6:00 PM</p>
              <p className="text-sm text-slate-500">Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-300/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} AutoGarage Pro. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-slate-600">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <Link to="/admin" className="hover:text-slate-400 transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
