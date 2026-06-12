import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, Shield, Clock, Star, ChevronRight, Zap, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { STATS } from '../utils/constants';
import { supabase } from '../lib/supabase';

const features = [
  { Icon: Shield, title: 'Quality Guaranteed', desc: 'Every service backed by our 90-day workmanship warranty.' },
  { Icon: Clock, title: 'Quick Turnaround', desc: 'Most services completed same-day. Your time matters to us.' },
  { Icon: Wrench, title: 'Expert Mechanics', desc: 'ASE-certified technicians with 10+ years average experience.' },
  { Icon: Award, title: 'OEM Parts Only', desc: 'We use only genuine or OEM-equivalent parts on your vehicle.' },
];

export default function Home() {
  const { session, profile } = useAuth();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fallback to hardcoded if no real reviews
      if (data && data.length > 0) {
        setReviews(data);
      } else {
        setReviews([
          { customer_name: 'Sarah Mitchell', service_type: 'Premium Package', rating: 5, comment: 'Outstanding service! My car came back running smoother than ever. Transparent pricing and no hidden fees.' },
          { customer_name: 'James Okafor', service_type: 'Standard Package', rating: 5, comment: 'Booked online, dropped off my car, and it was ready in 3 hours. These guys are genuinely professional.' },
          { customer_name: 'Linda Cruz', service_type: 'Basic Package', rating: 5, comment: 'Best mechanic shop in the area. They explained everything clearly and the pricing was very fair.' },
        ]);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: 'url("/BMW.png")' }}
      >
        {/* Dark overlay to ensure text is readable over the image */}
        <div className="absolute inset-0 bg-slate-900/60" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24">

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-black text-white leading-tight mb-6 animate-slide-up tracking-tight drop-shadow-md">
            Your Car Deserves <br /> Expert Care
          </h1>

          <p className="text-slate-100 text-lg md:text-2xl font-medium max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in drop-shadow-sm">
            Professional automotive services from certified mechanics. Fast bookings, transparent pricing, and quality workmanship — all in one place.
          </p>

          <div className="flex flex-col items-center justify-center animate-slide-up">
            <Link
              to="/appointments"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded shadow-lg transition-colors uppercase tracking-wide mb-5"
            >
              Schedule Your Service Now
            </Link>

            <Link
              to="/services"
              className="text-white text-base font-semibold underline underline-offset-4 hover:text-orange-400 transition-colors drop-shadow-sm"
            >
              Explore Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────────── */}
      <section className="py-20 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-badge"><Star size={12} /> Why AutoGarage Pro</span>
            <h2 className="section-title">Built Around Your Vehicle's Safety</h2>
            <p className="section-subtitle mx-auto">We combine expert knowledge with cutting-edge diagnostics to deliver automotive care that lasts.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="card p-6 group hover:border-brand-700/40 transition-all duration-300 hover:-translate-y-1">
                <div className="p-3 rounded-xl bg-brand-900/40 border border-brand-800/30 w-fit mb-4 group-hover:bg-brand-800/40 transition-colors">
                  <Icon size={22} className="text-brand-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Access Cards ────────────────────────────────── */}
      <section className="py-20 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-badge"><Wrench size={12} /> Get Started</span>
            <h2 className="section-title">What Can We Help With?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Book a Service', desc: 'Schedule your appointment online in under 2 minutes. Choose your date, time, and service type.', path: '/appointments', cta: 'Book Now', accent: true },
              { title: 'Service Plans', desc: 'Explore our Basic, Standard, and Premium packages. Transparent pricing with no surprises.', path: '/services', cta: 'View Plans', accent: false },
              { title: 'Parts Catalog', desc: 'Browse 18+ quality car parts and accessories. Add to cart and order directly.', path: '/products', cta: 'Browse Parts', accent: false },
            ].map(({ title, desc, path, cta, accent }) => (
              <Link key={title} to={path} className="card-hover p-8 flex flex-col">
                <h3 className="text-xl font-display font-bold text-white mb-3">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-6">{desc}</p>
                <span className={accent ? 'btn-accent self-start' : 'btn-outline self-start'}>
                  {cta} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-20 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-badge"><Star size={12} /> Testimonials</span>
            <h2 className="section-title">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <div key={i} className="card p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} size={14} className={idx < review.rating ? "text-accent-500 fill-accent-500" : "text-dark-400"} />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-bold">
                    {review.customer_name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{review.customer_name}</p>
                    <p className="text-slate-500 text-xs">{review.service_type || 'Verified Customer'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="py-16 bg-brand-gradient">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4">Ready to Get Your Car Fixed?</h2>
          <p className="text-blue-200 mb-8">Book online in 2 minutes. We'll take care of the rest.</p>
          <Link to="/appointments" className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-dark-900 bg-accent-gradient hover:scale-105 transition-transform shadow-glow-orange">
            Schedule Your Visit <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
