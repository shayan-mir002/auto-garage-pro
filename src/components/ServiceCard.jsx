import { CheckCircle, Zap, Star } from 'lucide-react';
import { TIER_COLORS } from '../utils/constants';

const icons = { Basic: Zap, Standard: CheckCircle, Premium: Star };

export default function ServiceCard({ service, onBook }) {
  const tier = service.tier;
  const colors = TIER_COLORS[tier] || TIER_COLORS.Basic;
  const Icon = icons[tier] || Zap;

  return (
    <div className={`card flex flex-col border-2 ${colors.border} ${tier === 'Standard' ? 'scale-[1.03]' : ''} transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover`}>
      {tier === 'Standard' && (
        <div className="bg-brand-gradient text-white text-xs font-bold text-center py-1.5 rounded-t-[10px] tracking-wider uppercase">
          Most Popular
        </div>
      )}
      {tier === 'Premium' && (
        <div className="bg-accent-gradient text-dark-900 text-xs font-bold text-center py-1.5 rounded-t-[10px] tracking-wider uppercase">
          Best Value
        </div>
      )}

      <div className="p-7 flex flex-col flex-1">
        {/* Tier badge & icon */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${colors.badge}`}>
              {tier}
            </span>
            <h3 className="text-xl font-display font-bold text-white">{service.name}</h3>
          </div>
          <div className={`p-3 rounded-xl ${tier === 'Premium' ? 'bg-accent-orange/10' : tier === 'Standard' ? 'bg-brand-900/50' : 'bg-dark-600'}`}>
            <Icon size={24} className={tier === 'Premium' ? 'text-accent-orange' : tier === 'Standard' ? 'text-brand-400' : 'text-slate-400'} />
          </div>
        </div>

        {/* Price */}
        <div className="mb-5">
          <span className="text-4xl font-display font-bold text-white">${service.price?.toFixed(2)}</span>
          <span className="text-slate-500 text-sm ml-1">/ service</span>
        </div>

        {/* Description */}
        {service.description && (
          <p className="text-slate-400 text-sm mb-5 leading-relaxed">{service.description}</p>
        )}

        {/* Inclusions */}
        <ul className="space-y-2.5 flex-1 mb-7">
          {(service.inclusions || []).map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <CheckCircle size={15} className={`flex-shrink-0 mt-0.5 ${tier === 'Premium' ? 'text-accent-orange' : 'text-brand-400'}`} />
              <span className="text-slate-300">{item}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={() => onBook && onBook(service)}
          className={tier === 'Premium' ? 'btn-accent w-full justify-center' : tier === 'Standard' ? 'btn-primary w-full justify-center' : 'btn-outline w-full justify-center'}
        >
          Book This Plan
        </button>
      </div>
    </div>
  );
}
