import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/autogarage';

app.use(cors());
app.use(express.json());

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ─── Mongoose Schemas ─────────────────────────────────────────────────────

const productSchema = new mongoose.Schema({
  name: String, category: String, description: String,
  price: Number, image_url: String, is_active: { type: Boolean, default: true },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { strict: false });

const servicePlanSchema = new mongoose.Schema({
  tier: String, name: String, description: String,
  inclusions: [String], price: Number,
  is_active: { type: Boolean, default: true },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { strict: false });

const timeSlotSchema = new mongoose.Schema({
  slot_time: String,
  is_active: { type: Boolean, default: true },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { strict: false });

const appointmentSchema = new mongoose.Schema({
  user_id: String, customer_name: String, customer_email: String,
  car_model: String, service_type: String, appointment_date: String,
  time_slot: String, status: { type: String, default: 'Pending' },
  mechanic_id: String, mechanic_notes: String, notes: String,
  created_at: { type: String, default: () => new Date().toISOString() },
}, { strict: false });

const orderSchema = new mongoose.Schema({
  user_id: String, customer_name: String, customer_email: String,
  customer_phone: String, status: { type: String, default: 'Pending' },
  total_amount: Number,
  created_at: { type: String, default: () => new Date().toISOString() },
}, { strict: false });

const orderItemSchema = new mongoose.Schema({
  order_id: String, product_id: String, product_name: String,
  unit_price: Number, quantity: Number,
  created_at: { type: String, default: () => new Date().toISOString() },
}, { strict: false });

const notificationSchema = new mongoose.Schema({
  user_id: String, customer_email: String, title: String,
  message: String, type: { type: String, default: 'info' },
  is_read: { type: Boolean, default: false },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { strict: false });

const inquirySchema = new mongoose.Schema({
  product_id: String, customer_name: String, customer_email: String,
  customer_phone: String, message: String,
  status: { type: String, default: 'New' },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { strict: false });

const reviewSchema = new mongoose.Schema({
  appointment_id: String, customer_name: String, customer_email: String,
  rating: Number, comment: String, service_type: String,
  is_approved: { type: Boolean, default: false },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { strict: false });

const mechanicSchema = new mongoose.Schema({
  name: String, specialty: String, phone: String,
  is_available: { type: Boolean, default: true },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { strict: false });

const chatMessageSchema = new mongoose.Schema({
  session_id: String, customer_name: String, sender: String,
  message: String, is_read: { type: Boolean, default: false },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { strict: false });

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true }, password: String,
  full_name: String, phone: String, preferred_car: String,
  created_at: { type: String, default: () => new Date().toISOString() },
}, { strict: false });

// ─── Models ────────────────────────────────────────────────────────────────

const models = {
  products: mongoose.model('Product', productSchema),
  service_plans: mongoose.model('ServicePlan', servicePlanSchema),
  time_slots: mongoose.model('TimeSlot', timeSlotSchema),
  appointments: mongoose.model('Appointment', appointmentSchema),
  orders: mongoose.model('Order', orderSchema),
  order_items: mongoose.model('OrderItem', orderItemSchema),
  notifications: mongoose.model('Notification', notificationSchema),
  inquiries: mongoose.model('Inquiry', inquirySchema),
  reviews: mongoose.model('Review', reviewSchema),
  mechanics: mongoose.model('Mechanic', mechanicSchema),
  chat_messages: mongoose.model('ChatMessage', chatMessageSchema),
  users: mongoose.model('User', userSchema),
};

function getModel(name) {
  return models[name] || null;
}

function mapDoc(doc) {
  const { _id, __v, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

// ─── Generic CRUD Routes ──────────────────────────────────────────────────

app.get('/api/data/:table', async (req, res) => {
  try {
    const Model = getModel(req.params.table);
    if (!Model) return res.status(400).json({ error: `Unknown table: ${req.params.table}` });
    const { orderBy } = req.query;
    let q = Model.find();
    if (orderBy) {
      const [field, dir] = orderBy.split('.');
      q = q.sort({ [field]: dir === 'asc' ? 1 : -1 });
    }
    const docs = await q.lean();
    res.json(docs.map(mapDoc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/data/:table/:id', async (req, res) => {
  try {
    const Model = getModel(req.params.table);
    if (!Model) return res.status(400).json({ error: `Unknown table: ${req.params.table}` });
    let doc;
    try { doc = await Model.findById(req.params.id).lean(); } catch { doc = null; }
    if (!doc) return res.json(null);
    res.json(mapDoc(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/data/:table', async (req, res) => {
  try {
    const Model = getModel(req.params.table);
    if (!Model) return res.status(400).json({ error: `Unknown table: ${req.params.table}` });
    const doc = await Model.create(req.body);
    res.json(mapDoc(doc.toObject()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/data/:table/:id', async (req, res) => {
  try {
    const Model = getModel(req.params.table);
    if (!Model) return res.status(400).json({ error: `Unknown table: ${req.params.table}` });
    let doc;
    try { doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean(); } catch { doc = null; }
    if (!doc) return res.json(null);
    res.json(mapDoc(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/data/:table/:id', async (req, res) => {
  try {
    const Model = getModel(req.params.table);
    if (!Model) return res.status(400).json({ error: `Unknown table: ${req.params.table}` });
    try { await Model.findByIdAndDelete(req.params.id); } catch { /* ignore invalid ids */ }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/data/:table/seed', async (req, res) => {
  try {
    const Model = getModel(req.params.table);
    if (!Model) return res.status(400).json({ error: `Unknown table: ${req.params.table}` });
    const count = await Model.countDocuments();
    if (count === 0 && req.body.records?.length) {
      const docs = await Model.insertMany(req.body.records);
      return res.json({ seeded: true, count: docs.length, records: docs.map(mapDoc) });
    }
    res.json({ seeded: false, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Auth Routes ───────────────────────────────────────────────────────────

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    const existing = await models.users.findOne({ email });
    if (existing) return res.status(409).json({ error: 'A user with this email already exists.' });
    const user = await models.users.create({ email, password, full_name: full_name || '', phone: '', preferred_car: '' });
    const sessionUser = { id: user._id.toString(), email: user.email };
    res.json({ user: sessionUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await models.users.findOne({ email, password }).lean();
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
    const sessionUser = { id: user._id.toString(), email: user.email };
    res.json({ user: sessionUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/profile/:userId', async (req, res) => {
  try {
    let user;
    try { user = await models.users.findById(req.params.userId).lean(); } catch { user = null; }
    if (!user) return res.json(null);
    res.json(mapDoc(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/auth/profile/:userId', async (req, res) => {
  try {
    try { await models.users.findByIdAndUpdate(req.params.userId, req.body); } catch { /* ignore */ }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await models.users.find().select('-password -__v').lean();
    res.json(users.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── 404 catch-all ─────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Seed Data ─────────────────────────────────────────────────────────────

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

const FALLBACK_SERVICES = [
  { tier: 'Basic', name: 'Basic Package', price: 49.99, description: 'Essential maintenance for everyday driving.', inclusions: ['Engine Oil Change', 'Oil Filter Replacement', 'Visual Safety Inspection', 'Fluid Top-up', 'Tyre Pressure Check'] },
  { tier: 'Standard', name: 'Standard Package', price: 99.99, description: 'Comprehensive care for peace of mind on the road.', inclusions: ['All Basic Services', 'Brake Pad Inspection', 'Brake Fluid Check', 'Tyre Rotation', 'Battery Health Test', 'Air Filter Check'] },
  { tier: 'Premium', name: 'Premium Package', price: 199.99, description: 'The complete vehicle overhaul - nothing left unchecked.', inclusions: ['All Standard Services', 'Full Engine Tune-Up', 'Spark Plug Replacement', 'Interior & Exterior Detailing', 'Diagnostics Scan', 'Coolant Flush', 'Transmission Fluid Check', 'Comprehensive Road Test'] },
];

const DEFAULT_TIME_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

const SEED_MECHANICS = [
  { name: 'John Smith', specialty: 'Engine', is_available: true },
  { name: 'Mike Johnson', specialty: 'Brakes', is_available: true },
  { name: 'Sarah Lee', specialty: 'Electrical', is_available: true },
  { name: 'Ahmed Hassan', specialty: 'AC & HVAC', is_available: true },
  { name: 'Carlos Rivera', specialty: 'Transmission', is_available: true },
];

async function seedDatabase() {
  const seedIfEmpty = async (Model, records, label) => {
    const count = await Model.countDocuments();
    if (count === 0) {
      await Model.insertMany(records);
      console.log(`  Seeded ${records.length} ${label}`);
    } else {
      console.log(`  ${label}: ${count} records exist, skipping`);
    }
  };

  console.log('Seeding database...');
  await seedIfEmpty(models.products, SEED_PRODUCTS.map(p => ({ ...p, is_active: true })), 'products');
  await seedIfEmpty(models.service_plans, FALLBACK_SERVICES.map(s => ({ ...s, is_active: true })), 'service_plans');
  await seedIfEmpty(models.time_slots, DEFAULT_TIME_SLOTS.map(t => ({ slot_time: t, is_active: true })), 'time_slots');
  await seedIfEmpty(models.mechanics, SEED_MECHANICS, 'mechanics');

  for (const table of ['appointments', 'orders', 'order_items', 'notifications', 'inquiries', 'reviews', 'chat_messages']) {
    const count = await models[table].countDocuments();
    if (count === 0) console.log(`  ${table}: empty, ready`);
  }

  const adminExists = await models.users.findOne({ email: 'admin@shop.com' });
  if (!adminExists) {
    await models.users.create({
      email: 'admin@shop.com', password: 'admin123',
      full_name: 'Administrator', phone: '', preferred_car: '',
    });
    console.log('  Seeded admin user (admin@shop.com / admin123)');
  } else {
    console.log('  Admin user exists, skipping');
  }
  console.log('Database seeding complete!');
}

// ─── Start Server ──────────────────────────────────────────────────────────

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
