import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ServiceCard from '../components/ServiceCard';
import { useNavigate } from 'react-router-dom';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });
    if (!error) setServices(data || []);
    setLoading(false);
  };

  const handleBook = (service) => {
    navigate(`/appointments?service=${encodeURIComponent(service.tier)}`);
  };

  // Fallback data if Supabase not yet configured
  const displayServices = services.length > 0 ? services : [
    { id: '1', tier: 'Basic', name: 'Basic Package', price: 49.99, description: 'Essential maintenance for everyday driving.', inclusions: ['Engine Oil Change', 'Oil Filter Replacement', 'Visual Safety Inspection', 'Fluid Top-up', 'Tyre Pressure Check'] },
    { id: '2', tier: 'Standard', name: 'Standard Package', price: 99.99, description: 'Comprehensive care for peace of mind on the road.', inclusions: ['All Basic Services', 'Brake Pad Inspection', 'Brake Fluid Check', 'Tyre Rotation', 'Battery Health Test', 'Air Filter Check'] },
    { id: '3', tier: 'Premium', name: 'Premium Package', price: 199.99, description: 'The complete vehicle overhaul — nothing left unchecked.', inclusions: ['All Standard Services', 'Full Engine Tune-Up', 'Spark Plug Replacement', 'Interior & Exterior Detailing', 'Diagnostics Scan', 'Coolant Flush', 'Transmission Fluid Check', 'Comprehensive Road Test'] },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <span className="section-badge"><Star size={12} /> Service Plans</span>
        <h1 className="section-title">Transparent Pricing,<br />No Surprises</h1>
        <p className="section-subtitle mx-auto">
          Choose the service package that fits your vehicle's needs. All plans include certified mechanics and quality parts.
        </p>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-96 animate-pulse bg-dark-600" />
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {displayServices.map((service) => (
              <ServiceCard key={service.id} service={service} onBook={handleBook} />
            ))}
          </div>
        </div>
      )}

      {/* Comparison note */}
      <div className="max-w-3xl mx-auto px-4 mt-14">
        <div className="card p-6 text-center">
          <h3 className="text-white font-semibold mb-2">Not sure which plan is right?</h3>
          <p className="text-slate-400 text-sm mb-4">Book a Basic plan and our mechanics will advise you on any additional needs during the inspection.</p>
          <Link to="/appointments" className="btn-primary inline-flex">
            Schedule a Free Inspection <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Included in all plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h2 className="text-center text-white font-display font-bold text-2xl mb-8">Included in Every Plan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {['Certified Mechanics', 'Digital Invoice', '90-Day Warranty', 'Free Re-inspect', 'Courtesy Report', 'OEM Parts'].map((item) => (
            <div key={item} className="card p-4 flex flex-col items-center text-center gap-2">
              <CheckCircle size={20} className="text-brand-400" />
              <span className="text-slate-300 text-xs font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
