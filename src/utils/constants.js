// ─── Fallback service plans (used when DB is unreachable) ──────────────────
export const FALLBACK_SERVICES = [
  { id: '1', tier: 'Basic', name: 'Basic Package', price: 49.99, description: 'Essential maintenance for everyday driving.', inclusions: ['Engine Oil Change', 'Oil Filter Replacement', 'Visual Safety Inspection', 'Fluid Top-up', 'Tyre Pressure Check'] },
  { id: '2', tier: 'Standard', name: 'Standard Package', price: 99.99, description: 'Comprehensive care for peace of mind on the road.', inclusions: ['All Basic Services', 'Brake Pad Inspection', 'Brake Fluid Check', 'Tyre Rotation', 'Battery Health Test', 'Air Filter Check'] },
  { id: '3', tier: 'Premium', name: 'Premium Package', price: 199.99, description: 'The complete vehicle overhaul — nothing left unchecked.', inclusions: ['All Standard Services', 'Full Engine Tune-Up', 'Spark Plug Replacement', 'Interior & Exterior Detailing', 'Diagnostics Scan', 'Coolant Flush', 'Transmission Fluid Check', 'Comprehensive Road Test'] },
];

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

// ─── Product name → local image mapping ────────────────────────────────────
// This maps product names (lowercased) to local images in /public.
// Used as a fallback when DB has stale external URLs.
const PRODUCT_IMAGE_MAP = {
  'high-performance engine oil filter': '/n1.png',
  'hepa cabin air filter': '/n2.png',
  'heavy-duty air intake filter': '/n3.png',
  'ceramic brake pads (front set)': '/n4.png',
  'slotted brake disc rotor': '/n5.png',
  'brake caliper grease kit': '/Brake Caliper.png',
  'agm car battery 60ah': '/AG.png',
  'iridium spark plugs (set of 4)': '/Iridium spark.png',
  'led h4 headlight bulb kit': '/LED H4.png',
  'full synthetic motor oil 5w-30 (5l)': '/Motor Oil.png',
  'long-life engine coolant (4l)': '/Coolant.png',
  'atf automatic transmission fluid': '/ATF.png',
  'power steering fluid (1l)': '/Coolant.png',
  'timing belt kit with water pump': '/Timing kit.jpg',
  'serpentine drive belt': '/Drive belt.png',
  'silicone radiator hose kit': '/Radiator kit.png',
  'digital tire pressure gauge': '/Gauge.png',
  'portable 2000a jump starter': '/AG.png',
};

// ─── Seed products (18 items matched with public folder images) ─────────────
export const SEED_PRODUCTS = [
  { name: 'High-Performance Engine Oil Filter', category: 'Filters', price: 12.99, image_url: '/n1.png', description: 'Premium engine oil filter ensuring clean oil flow and extended engine life. Compatible with most sedans and SUVs.' },
  { name: 'HEPA Cabin Air Filter', category: 'Filters', price: 18.50, image_url: '/n2.png', description: 'High-efficiency cabin air filter removes dust, pollen, and pollutants for a cleaner in-cabin air experience.' },
  { name: 'Heavy-Duty Air Intake Filter', category: 'Filters', price: 24.99, image_url: '/n3.png', description: 'Washable and reusable air intake filter for improved airflow and engine efficiency.' },
  { name: 'Ceramic Brake Pads (Front Set)', category: 'Brakes', price: 49.99, image_url: '/n4.png', description: 'Low-dust ceramic brake pads offering quiet, smooth braking performance for front axle. Sold as a full set.' },
  { name: 'Slotted Brake Disc Rotor', category: 'Brakes', price: 67.00, image_url: '/n5.png', description: 'Slotted disc rotor for superior heat dissipation and consistent stopping power.' },
  { name: 'Brake Caliper Grease Kit', category: 'Brakes', price: 8.99, image_url: '/Brake Caliper.png', description: 'High-temp caliper grease kit to prevent brake squeal and ensure smooth caliper movement.' },
  { name: 'AGM Car Battery 60Ah', category: 'Electrical', price: 129.00, image_url: '/AG.png', description: 'Absorbent Glass Mat (AGM) battery providing reliable cold-start performance and long service life.' },
  { name: 'Iridium Spark Plugs (Set of 4)', category: 'Electrical', price: 38.50, image_url: '/Iridium spark.png', description: 'Long-life iridium spark plugs for improved combustion efficiency and better fuel economy.' },
  { name: 'LED H4 Headlight Bulb Kit', category: 'Electrical', price: 44.99, image_url: '/LED H4.png', description: '6000K white LED H4 headlight kit with plug-and-play installation. 3× brighter than stock halogens.' },
  { name: 'Full Synthetic Motor Oil 5W-30 (5L)', category: 'Fluids', price: 34.99, image_url: '/Motor Oil.png', description: 'Premium full synthetic engine oil providing superior protection at all temperatures. Meets ACEA C3 standards.' },
  { name: 'Long-Life Engine Coolant (4L)', category: 'Fluids', price: 19.99, image_url: '/Coolant.png', description: 'Ready-to-use OAT coolant for aluminium engines. Protection down to −40°C.' },
  { name: 'ATF Automatic Transmission Fluid', category: 'Transmission', price: 22.50, image_url: '/ATF.png', description: 'Multi-vehicle ATF compatible with most automatic gearboxes. Prevents wear and ensures smooth shifting.' },
  { name: 'Power Steering Fluid (1L)', category: 'Fluids', price: 9.99, image_url: '/Coolant.png', description: 'Universal power steering fluid compatible with most hydraulic steering systems.' },
  { name: 'Timing Belt Kit with Water Pump', category: 'Engine', price: 89.00, image_url: '/Timing kit.jpg', description: 'Complete timing belt replacement kit including tensioner, idler pulley, and water pump.' },
  { name: 'Serpentine Drive Belt', category: 'Engine', price: 27.99, image_url: '/Drive belt.png', description: 'OEM-spec ribbed serpentine belt for alternator, A/C compressor, and power steering pump drive.' },
  { name: 'Silicone Radiator Hose Kit', category: 'Engine', price: 55.00, image_url: '/Radiator kit.png', description: 'High-temp silicone radiator hoses replacing rubber originals for longer lasting cooling performance.' },
  { name: 'Digital Tire Pressure Gauge', category: 'Accessories', price: 14.99, image_url: '/Gauge.png', description: 'Accurate digital gauge reading 0–150 PSI. Backlit LCD display with quick-release valve.' },
  { name: 'Portable 2000A Jump Starter', category: 'Accessories', price: 79.99, image_url: '/AG.png', description: 'Compact lithium jump starter for vehicles up to 8L petrol / 6L diesel. Includes USB charging ports.' },
];

/**
 * Smart image URL resolver.
 * 1. If the product name matches a known local image, use that (most reliable).
 * 2. If the URL is already a valid local path (starts with /), use it.
 * 3. If the URL is a relative filename (e.g. "n1.png"), prepend /.
 * 4. External URLs (https://) are used as-is — browser will handle 404s.
 * 5. If the URL is empty/null, return empty string.
 */
export const getImageUrl = (url, productName) => {
  // Try name-based lookup first (most reliable — always uses local file)
  if (productName) {
    const localImg = PRODUCT_IMAGE_MAP[productName.toLowerCase()];
    if (localImg) return localImg;
  }
  // Fallback to URL-based logic
  if (!url) return '';
  if (url.startsWith('/') || url.startsWith('data:')) return url;
  // If it's a bare filename like "n1.png", prepend /
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `/${url}`;
  }
  // External URL — return as-is
  return url;
};
