import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DB_NAME = 'autogarage';

let cachedClient = null;
let cachedDb = null;
let seeded = false;

async function connectDB() {
  if (cachedDb) return cachedDb;
  if (!MONGO_URI) throw new Error('MONGODB_URI environment variable is not set');
  cachedClient = new MongoClient(MONGO_URI);
  await cachedClient.connect();
  cachedDb = cachedClient.db(DB_NAME);
  return cachedDb;
}

const COLLECTIONS = [
  'products', 'service_plans', 'time_slots', 'appointments', 'orders',
  'order_items', 'notifications', 'inquiries', 'reviews', 'mechanics',
  'chat_messages', 'users',
];

function mapDoc(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

// ─── Seed Data ──────────────────────────────────────────────────────────
const SEED_PRODUCTS = [
  { name: 'High-Performance Engine Oil Filter', category: 'Filters', price: 12.99, image_url: '/n1.png', description: 'Premium engine oil filter ensuring clean oil flow and extended engine life. Compatible with most sedans and SUVs.' },
  { name: 'HEPA Cabin Air Filter', category: 'Filters', price: 18.50, image_url: '/n2.png', description: 'High-efficiency cabin air filter removes dust, pollen, and pollutants for a cleaner in-cabin air experience.' },
  { name: 'Heavy-Duty Air Intake Filter', category: 'Filters', price: 24.99, image_url: '/n3.png', description: 'Washable and reusable air intake filter for improved airflow and engine efficiency.' },
  { name: 'Ceramic Brake Pads (Front Set)', category: 'Brakes', price: 49.99, image_url: '/n4.png', description: 'Low-dust ceramic brake pads offering quiet, smooth braking performance for front axle. Sold as a full set.' },
  { name: 'Slotted Brake Disc Rotor', category: 'Brakes', price: 67.00, image_url: '/n5.png', description: 'Slotted disc rotor for superior heat dissipation and consistent stopping power.' },
  { name: 'Brake Caliper Grease Kit', category: 'Brakes', price: 8.99, image_url: '/Brake Caliper.png', description: 'High-temp caliper grease kit to prevent brake squeal and ensure smooth caliper movement.' },
  { name: 'AGM Car Battery 60Ah', category: 'Electrical', price: 129.00, image_url: '/AG.png', description: 'Absorbent Glass Mat (AGM) battery providing reliable cold-start performance and long service life.' },
  { name: 'Iridium Spark Plugs (Set of 4)', category: 'Electrical', price: 38.50, image_url: '/Iridium spark.png', description: 'Long-life iridium spark plugs for improved combustion efficiency and better fuel economy.' },
  { name: 'LED H4 Headlight Bulb Kit', category: 'Electrical', price: 44.99, image_url: '/LED H4.png', description: '6000K white LED H4 headlight kit with plug-and-play installation. 3x brighter than stock halogens.' },
  { name: 'Full Synthetic Motor Oil 5W-30 (5L)', category: 'Fluids', price: 34.99, image_url: '/Motor Oil.png', description: 'Premium full synthetic engine oil providing superior protection at all temperatures. Meets ACEA C3 standards.' },
  { name: 'Long-Life Engine Coolant (4L)', category: 'Fluids', price: 19.99, image_url: '/Coolant.png', description: 'Ready-to-use OAT coolant for aluminium engines. Protection down to -40C.' },
  { name: 'ATF Automatic Transmission Fluid', category: 'Transmission', price: 22.50, image_url: '/ATF.png', description: 'Multi-vehicle ATF compatible with most automatic gearboxes. Prevents wear and ensures smooth shifting.' },
  { name: 'Power Steering Fluid (1L)', category: 'Fluids', price: 9.99, image_url: '/Coolant.png', description: 'Universal power steering fluid compatible with most hydraulic steering systems.' },
  { name: 'Timing Belt Kit with Water Pump', category: 'Engine', price: 89.00, image_url: '/Timing kit.jpg', description: 'Complete timing belt replacement kit including tensioner, idler pulley, and water pump.' },
  { name: 'Serpentine Drive Belt', category: 'Engine', price: 27.99, image_url: '/Drive belt.png', description: 'OEM-spec ribbed serpentine belt for alternator, A/C compressor, and power steering pump drive.' },
  { name: 'Silicone Radiator Hose Kit', category: 'Engine', price: 55.00, image_url: '/Radiator kit.png', description: 'High-temp silicone radiator hoses replacing rubber originals for longer lasting cooling performance.' },
  { name: 'Digital Tire Pressure Gauge', category: 'Accessories', price: 14.99, image_url: '/Gauge.png', description: 'Accurate digital gauge reading 0-150 PSI. Backlit LCD display with quick-release valve.' },
  { name: 'Portable 2000A Jump Starter', category: 'Accessories', price: 79.99, image_url: '/AG.png', description: 'Compact lithium jump starter for vehicles up to 8L petrol / 6L diesel. Includes USB charging ports.' },
];

const SEED_SERVICES = [
  { tier: 'Basic', name: 'Basic Package', price: 49.99, description: 'Essential maintenance for everyday driving.', inclusions: ['Engine Oil Change', 'Oil Filter Replacement', 'Visual Safety Inspection', 'Fluid Top-up', 'Tyre Pressure Check'], is_active: true },
  { tier: 'Standard', name: 'Standard Package', price: 99.99, description: 'Comprehensive care for peace of mind on the road.', inclusions: ['All Basic Services', 'Brake Pad Inspection', 'Brake Fluid Check', 'Tyre Rotation', 'Battery Health Test', 'Air Filter Check'], is_active: true },
  { tier: 'Premium', name: 'Premium Package', price: 199.99, description: 'The complete vehicle overhaul - nothing left unchecked.', inclusions: ['All Standard Services', 'Full Engine Tune-Up', 'Spark Plug Replacement', 'Interior & Exterior Detailing', 'Diagnostics Scan', 'Coolant Flush', 'Transmission Fluid Check', 'Comprehensive Road Test'], is_active: true },
];

const SEED_TIME_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

const SEED_MECHANICS = [
  { name: 'John Smith', specialty: 'Engine', is_available: true },
  { name: 'Mike Johnson', specialty: 'Brakes', is_available: true },
  { name: 'Sarah Lee', specialty: 'Electrical', is_available: true },
  { name: 'Ahmed Hassan', specialty: 'AC & HVAC', is_available: true },
  { name: 'Carlos Rivera', specialty: 'Transmission', is_available: true },
];

async function seedDatabase(db) {
  if (seeded) return;
  const now = new Date().toISOString();

  const productsCol = db.collection('products');
  if ((await productsCol.countDocuments()) === 0) {
    await productsCol.insertMany(SEED_PRODUCTS.map(p => ({ ...p, is_active: true, created_at: now })));
  }

  const servicesCol = db.collection('service_plans');
  if ((await servicesCol.countDocuments()) === 0) {
    await servicesCol.insertMany(SEED_SERVICES.map(s => ({ ...s, created_at: now })));
  }

  const slotsCol = db.collection('time_slots');
  if ((await slotsCol.countDocuments()) === 0) {
    await slotsCol.insertMany(SEED_TIME_SLOTS.map(t => ({ slot_time: t, is_active: true, created_at: now })));
  }

  const mechCol = db.collection('mechanics');
  if ((await mechCol.countDocuments()) === 0) {
    await mechCol.insertMany(SEED_MECHANICS.map(m => ({ ...m, created_at: now })));
  }

  const usersCol = db.collection('users');
  if (!(await usersCol.findOne({ email: 'admin@shop.com' }))) {
    await usersCol.insertOne({ email: 'admin@shop.com', password: 'admin123', full_name: 'Administrator', phone: '', preferred_car: '', created_at: now });
  }

  seeded = true;
}

// ─── Parse body helper ─────────────────────────────────────────────────
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

// ─── Router ────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  try {
    const db = await connectDB();
    await seedDatabase(db);

    const { method, url } = req;
    const pathname = url.split('?')[0];
    const query = Object.fromEntries(new URL(url, 'http://localhost').searchParams);

    // Health check
    if (pathname === '/api/health') {
      return send(res, 200, { status: 'ok' });
    }

    // Auth routes
    if (pathname === '/api/auth/signup' && method === 'POST') {
      const body = await parseBody(req);
      const existing = await db.collection('users').findOne({ email: body.email });
      if (existing) return send(res, 409, { error: 'A user with this email already exists.' });
      const now = new Date().toISOString();
      const result = await db.collection('users').insertOne({ email: body.email, password: body.password, full_name: body.full_name || '', phone: '', preferred_car: '', created_at: now });
      return send(res, 200, { user: { id: result.insertedId.toString(), email: body.email } });
    }

    if (pathname === '/api/auth/signin' && method === 'POST') {
      const body = await parseBody(req);
      const user = await db.collection('users').findOne({ email: body.email, password: body.password });
      if (!user) return send(res, 401, { error: 'Invalid email or password.' });
      return send(res, 200, { user: { id: user._id.toString(), email: user.email } });
    }

    const profileMatch = pathname.match(/^\/api\/auth\/profile\/(.+)$/);
    if (profileMatch && method === 'GET') {
      let user;
      try { user = await db.collection('users').findOne({ _id: new ObjectId(profileMatch[1]) }); } catch { user = null; }
      if (!user) return send(res, 200, null);
      return send(res, 200, mapDoc(user));
    }

    if (profileMatch && method === 'PUT') {
      const body = await parseBody(req);
      try { await db.collection('users').updateOne({ _id: new ObjectId(profileMatch[1]) }, { $set: body }); } catch {}
      return send(res, 200, { ok: true });
    }

    if (pathname === '/api/auth/users' && method === 'GET') {
      const users = await db.collection('users').find().project({ password: 0, __v: 0 }).toArray();
      return send(res, 200, users.map(mapDoc));
    }

    // Seed route
    const seedMatch = pathname.match(/^\/api\/data\/(.+)\/seed$/);
    if (seedMatch && method === 'POST') {
      const col = seedMatch[1];
      if (!COLLECTIONS.includes(col)) return send(res, 400, { error: `Unknown table: ${col}` });
      const body = await parseBody(req);
      const count = await db.collection(col).countDocuments();
      if (count === 0 && body.records?.length) {
        const result = await db.collection(col).insertMany(body.records);
        const docs = Object.values(result.insertedId).map(id => ({ id: id.toString() }));
        return send(res, 200, { seeded: true, count: docs.length });
      }
      return send(res, 200, { seeded: false, count });
    }

    // GET /api/data/:table
    const listMatch = pathname.match(/^\/api\/data\/([^/]+)$/);
    if (listMatch && method === 'GET') {
      const col = listMatch[1];
      if (!COLLECTIONS.includes(col)) return send(res, 400, { error: `Unknown table: ${col}` });
      let sort = {};
      if (query.orderBy) {
        const [field, dir] = query.orderBy.split('.');
        sort[field] = dir === 'asc' ? 1 : -1;
      }
      const docs = await db.collection(col).find().sort(sort).toArray();
      return send(res, 200, docs.map(mapDoc));
    }

    // GET /api/data/:table/:id
    const getMatch = pathname.match(/^\/api\/data\/([^/]+)\/([^/]+)$/);
    if (getMatch && method === 'GET') {
      const col = getMatch[1];
      const id = getMatch[2];
      if (!COLLECTIONS.includes(col)) return send(res, 400, { error: `Unknown table: ${col}` });
      let doc;
      try { doc = await db.collection(col).findOne({ _id: new ObjectId(id) }); } catch { doc = null; }
      return send(res, 200, mapDoc(doc));
    }

    // POST /api/data/:table
    if (listMatch && method === 'POST') {
      const col = listMatch[1];
      if (!COLLECTIONS.includes(col)) return send(res, 400, { error: `Unknown table: ${col}` });
      const body = await parseBody(req);
      body.created_at = body.created_at || new Date().toISOString();
      const result = await db.collection(col).insertOne(body);
      const { _id, ...rest } = body;
      return send(res, 200, { id: result.insertedId.toString(), ...rest });
    }

    // PUT /api/data/:table/:id
    const putMatch = pathname.match(/^\/api\/data\/([^/]+)\/([^/]+)$/);
    if (putMatch && method === 'PUT') {
      const col = putMatch[1];
      const id = putMatch[2];
      if (!COLLECTIONS.includes(col)) return send(res, 400, { error: `Unknown table: ${col}` });
      const body = await parseBody(req);
      let result;
      try { result = await db.collection(col).findOneAndUpdate({ _id: new ObjectId(id) }, { $set: body }, { returnDocument: 'after' }); } catch { result = null; }
      return send(res, 200, result ? mapDoc(result) : null);
    }

    // DELETE /api/data/:table/:id
    if (putMatch && method === 'DELETE') {
      const col = putMatch[1];
      const id = putMatch[2];
      if (!COLLECTIONS.includes(col)) return send(res, 400, { error: `Unknown table: ${col}` });
      try { await db.collection(col).deleteOne({ _id: new ObjectId(id) }); } catch {}
      return send(res, 200, { ok: true });
    }

    return send(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error('API error:', err);
    cachedDb = null;
    return send(res, 500, { error: err.message || 'Internal server error' });
  }
}

function send(res, status, data) {
  res.status(status).json(data);
}
