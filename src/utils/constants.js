// ─── Fixed time slots (8am – 5pm hourly) ───────────────────────────────────
export const DEFAULT_TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00',
];

export const formatTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

// ─── Service tiers ─────────────────────────────────────────────────────────
export const SERVICE_TIERS = ['Basic', 'Standard', 'Premium'];

export const TIER_COLORS = {
  Basic: { border: 'border-slate-600', badge: 'bg-slate-700 text-slate-300', glow: '' },
  Standard: { border: 'border-brand-700', badge: 'bg-brand-900 text-brand-300', glow: 'shadow-glow-blue' },
  Premium: { border: 'border-accent-orange', badge: 'bg-amber-900/40 text-accent-orange', glow: 'shadow-glow-orange' },
};

// ─── Product categories ────────────────────────────────────────────────────
export const PRODUCT_CATEGORIES = [
  'All', 'Filters', 'Brakes', 'Electrical', 'Fluids',
  'Engine', 'Transmission', 'Accessories',
];

export const PRODUCTS_PER_PAGE = 6;

// ─── Navigation links ──────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Products', path: '/products' },
  { label: 'Book Now', path: '/appointments' },
];

// ─── Stats ─────────────────────────────────────────────────────────────────
export const STATS = [
  { value: '15+', label: 'Years Experience' },
  { value: '8,000+', label: 'Cars Serviced' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '50+', label: 'Expert Mechanics' },
];

// ─── Seed products (18 items) ──────────────────────────────────────────────
export const SEED_PRODUCTS = [
  { name: 'High-Performance Engine Oil Filter', category: 'Filters', price: 12.99, image_url: 'n1.png', description: 'Premium engine oil filter ensuring clean oil flow and extended engine life. Compatible with most sedans and SUVs.' },
  { name: 'HEPA Cabin Air Filter', category: 'Filters', price: 18.50, image_url: 'n2.png', description: 'High-efficiency cabin air filter removes dust, pollen, and pollutants for a cleaner in-cabin air experience.' },
  { name: 'Heavy-Duty Air Intake Filter', category: 'Filters', price: 24.99, image_url: 'n3.png', description: 'Washable and reusable air intake filter for improved airflow and engine efficiency.' },
  { name: 'Ceramic Brake Pads (Front Set)', category: 'Brakes', price: 49.99, image_url: 'n4.png', description: 'Low-dust ceramic brake pads offering quiet, smooth braking performance for front axle. Sold as a full set.' },
  { name: 'Slotted Brake Disc Rotor', category: 'Brakes', price: 67.00, image_url: 'n5.png', description: 'Slotted disc rotor for superior heat dissipation and consistent stopping power.' },
  { name: 'Brake Caliper Grease Kit', category: 'Brakes', price: 8.99, image_url: 'https://images.unsplash.com/photo-1635073908681-797e88939600?auto=format&fit=crop&q=80&w=400&h=300', description: 'High-temp caliper grease kit to prevent brake squeal and ensure smooth caliper movement.' },
  { name: 'AGM Car Battery 60Ah', category: 'Electrical', price: 129.00, image_url: 'https://images.unsplash.com/photo-1620843437920-94f786d77395?auto=format&fit=crop&q=80&w=400&h=300', description: 'Absorbent Glass Mat (AGM) battery providing reliable cold-start performance and long service life.' },
  { name: 'Iridium Spark Plugs (Set of 4)', category: 'Electrical', price: 38.50, image_url: 'https://images.unsplash.com/photo-1616712134411-6b6ae89bc3ba?auto=format&fit=crop&q=80&w=400&h=300', description: 'Long-life iridium spark plugs for improved combustion efficiency and better fuel economy.' },
  { name: 'LED H4 Headlight Bulb Kit', category: 'Electrical', price: 44.99, image_url: 'https://images.unsplash.com/photo-1549830505-896f10c6609b?auto=format&fit=crop&q=80&w=400&h=300', description: '6000K white LED H4 headlight kit with plug-and-play installation. 3× brighter than stock halogens.' },
  { name: 'Full Synthetic Motor Oil 5W-30 (5L)', category: 'Fluids', price: 34.99, image_url: 'https://images.unsplash.com/photo-1635815174113-91599a2f1dad?auto=format&fit=crop&q=80&w=400&h=300', description: 'Premium full synthetic engine oil providing superior protection at all temperatures. Meets ACEA C3 standards.' },
  { name: 'Long-Life Engine Coolant (4L)', category: 'Fluids', price: 19.99, image_url: 'https://images.unsplash.com/photo-1631215172605-7f4153b3df0f?auto=format&fit=crop&q=80&w=400&h=300', description: 'Ready-to-use OAT coolant for aluminium engines. Protection down to −40°C.' },
  { name: 'ATF Automatic Transmission Fluid', category: 'Transmission', price: 22.50, image_url: 'https://images.unsplash.com/photo-1631215172605-7f4153b3df0f?auto=format&fit=crop&q=80&w=400&h=300', description: 'Multi-vehicle ATF compatible with most automatic gearboxes. Prevents wear and ensures smooth shifting.' },
  { name: 'Power Steering Fluid (1L)', category: 'Fluids', price: 9.99, image_url: 'https://images.unsplash.com/photo-1631215172605-7f4153b3df0f?auto=format&fit=crop&q=80&w=400&h=300', description: 'Universal power steering fluid compatible with most hydraulic steering systems.' },
  { name: 'Timing Belt Kit with Water Pump', category: 'Engine', price: 89.00, image_url: 'https://images.unsplash.com/photo-1590615365410-67172c535dec?auto=format&fit=crop&q=80&w=400&h=300', description: 'Complete timing belt replacement kit including tensioner, idler pulley, and water pump.' },
  { name: 'Serpentine Drive Belt', category: 'Engine', price: 27.99, image_url: 'https://images.unsplash.com/photo-1590615365410-67172c535dec?auto=format&fit=crop&q=80&w=400&h=300', description: 'OEM-spec ribbed serpentine belt for alternator, A/C compressor, and power steering pump drive.' },
  { name: 'Silicone Radiator Hose Kit', category: 'Engine', price: 55.00, image_url: 'https://images.unsplash.com/photo-1631215172605-7f4153b3df0f?auto=format&fit=crop&q=80&w=400&h=300', description: 'High-temp silicone radiator hoses replacing rubber originals for longer lasting cooling performance.' },
  { name: 'Digital Tire Pressure Gauge', category: 'Accessories', price: 14.99, image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=400&h=300', description: 'Accurate digital gauge reading 0–150 PSI. Backlit LCD display with quick-release valve.' },
  { name: 'Portable 2000A Jump Starter', category: 'Accessories', price: 79.99, image_url: 'https://images.unsplash.com/photo-1594002492147-36e65a7f2930?auto=format&fit=crop&q=80&w=400&h=300', description: 'Compact lithium jump starter for vehicles up to 8L petrol / 6L diesel. Includes USB charging ports.' },
];
