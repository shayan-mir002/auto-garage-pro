-- ============================================================
--  AutoGarage Pro — Complete Supabase Schema (Updated)
--  Run this ENTIRE file in your Supabase SQL Editor
-- ============================================================

-- ── 1. Service Plans ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_plans (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tier        TEXT NOT NULL CHECK (tier IN ('Basic', 'Standard', 'Premium')),
  name        TEXT NOT NULL,
  description TEXT,
  inclusions  TEXT[] NOT NULL DEFAULT '{}',
  price       DECIMAL(10,2) NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Products ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  image_url   TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Mechanics ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mechanics (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT NOT NULL,
  specialization TEXT,
  phone          TEXT,
  is_available   BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. Appointments ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  car_model        TEXT NOT NULL,
  service_type     TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot        TEXT NOT NULL,
  status           TEXT DEFAULT 'Pending'
                   CHECK (status IN ('Pending','In Progress','Ready for Pickup','Completed','Cancelled')),
  mechanic_id      UUID REFERENCES mechanics(id) ON DELETE SET NULL,
  mechanic_notes   TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_appointment_slot UNIQUE (appointment_date, time_slot)
);

-- ── 5. Inquiries ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  customer_phone  TEXT,
  message         TEXT,
  status          TEXT DEFAULT 'New' CHECK (status IN ('New', 'Reviewed')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. Time Slots ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS time_slots (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_time  TEXT NOT NULL UNIQUE,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. Customer Profiles ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name     TEXT,
  phone         TEXT,
  preferred_car TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. Reviews ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  rating          INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  service_type    TEXT,
  is_approved     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. Orders (Cart Checkout) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  customer_phone  TEXT,
  status          TEXT DEFAULT 'Pending'
                  CHECK (status IN ('Pending','Processing','Shipped','Delivered','Cancelled')),
  total_amount    DECIMAL(10,2) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. Order Items ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id     UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id   UUID,
  product_name TEXT NOT NULL,
  unit_price   DECIMAL(10,2) NOT NULL,
  quantity     INT  NOT NULL DEFAULT 1
);

-- ── 11. Notifications ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_email TEXT,
  title          TEXT NOT NULL,
  message        TEXT NOT NULL,
  type           TEXT DEFAULT 'info'
                 CHECK (type IN ('info','success','warning','error')),
  is_read        BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 12. Chat Messages ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id    TEXT NOT NULL,
  customer_name TEXT,
  sender        TEXT NOT NULL CHECK (sender IN ('customer','admin')),
  message       TEXT NOT NULL,
  is_read       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  Seeding Default Data
-- ============================================================

INSERT INTO time_slots (slot_time, is_active) VALUES
  ('08:00', true), ('09:00', true), ('10:00', true),
  ('11:00', true), ('12:00', true), ('13:00', true),
  ('14:00', true), ('15:00', true), ('16:00', true),
  ('17:00', true)
ON CONFLICT (slot_time) DO NOTHING;

INSERT INTO service_plans (id, tier, name, description, inclusions, price) VALUES
(
  'b0000000-0000-0000-0000-000000000001',
  'Basic', 'Basic Package',
  'Essential maintenance for everyday driving.',
  ARRAY['Engine Oil Change','Oil Filter Replacement','Visual Safety Inspection','Fluid Top-up','Tyre Pressure Check'],
  49.99
),
(
  'b0000000-0000-0000-0000-000000000002',
  'Standard', 'Standard Package',
  'Comprehensive care for peace of mind on the road.',
  ARRAY['All Basic Services','Brake Pad Inspection','Brake Fluid Check','Tyre Rotation','Battery Health Test','Air Filter Check'],
  99.99
),
(
  'b0000000-0000-0000-0000-000000000003',
  'Premium', 'Premium Package',
  'The complete vehicle overhaul — nothing left unchecked.',
  ARRAY['All Standard Services','Full Engine Tune-Up','Spark Plug Replacement','Interior & Exterior Detailing','Diagnostics Scan','Coolant Flush','Transmission Fluid Check','Comprehensive Road Test'],
  199.99
)
ON CONFLICT (id) DO NOTHING;

-- Sample mechanics
INSERT INTO mechanics (name, specialization, phone) VALUES
  ('John Carter',  'Engine & Transmission', '+1-555-0101'),
  ('Maria Santos', 'Brakes & Suspension',   '+1-555-0102'),
  ('Alex Kim',     'Electrical Systems',    '+1-555-0103'),
  ('David Osei',   'General Repairs',       '+1-555-0104')
ON CONFLICT DO NOTHING;

-- ============================================================
--  Row Level Security
-- ============================================================

ALTER TABLE service_plans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanics       ENABLE ROW LEVEL SECURITY;

-- service_plans
DROP POLICY IF EXISTS "Public read service_plans"  ON service_plans;
DROP POLICY IF EXISTS "Admin write service_plans"  ON service_plans;
CREATE POLICY "Public read service_plans"  ON service_plans FOR SELECT USING (true);
CREATE POLICY "Admin write service_plans"  ON service_plans FOR ALL    USING (auth.role() = 'authenticated');

-- products
DROP POLICY IF EXISTS "Public read products"  ON products;
DROP POLICY IF EXISTS "Admin write products"  ON products;
CREATE POLICY "Public read products"  ON products FOR SELECT USING (true);
CREATE POLICY "Admin write products"  ON products FOR ALL    USING (auth.role() = 'authenticated');

-- appointments
DROP POLICY IF EXISTS "Public insert appointments"  ON appointments;
DROP POLICY IF EXISTS "Public read appointments"    ON appointments;
DROP POLICY IF EXISTS "Admin manage appointments"   ON appointments;
CREATE POLICY "Public insert appointments"  ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read appointments"    ON appointments FOR SELECT USING (true);
CREATE POLICY "Admin manage appointments"   ON appointments FOR ALL    USING (auth.role() = 'authenticated');

-- inquiries
DROP POLICY IF EXISTS "Public insert inquiries"  ON inquiries;
DROP POLICY IF EXISTS "Admin manage inquiries"   ON inquiries;
CREATE POLICY "Public insert inquiries"  ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage inquiries"   ON inquiries FOR ALL    USING (auth.role() = 'authenticated');

-- time_slots
DROP POLICY IF EXISTS "Public read time_slots"  ON time_slots;
DROP POLICY IF EXISTS "Admin write time_slots"  ON time_slots;
CREATE POLICY "Public read time_slots"  ON time_slots FOR SELECT USING (true);
CREATE POLICY "Admin write time_slots"  ON time_slots FOR ALL    USING (auth.role() = 'authenticated');

-- profiles
DROP POLICY IF EXISTS "User reads own profile"    ON profiles;
DROP POLICY IF EXISTS "User updates own profile"  ON profiles;
DROP POLICY IF EXISTS "User inserts own profile"  ON profiles;
DROP POLICY IF EXISTS "Admin reads all profiles"  ON profiles;
CREATE POLICY "User reads own profile"    ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User updates own profile"  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "User inserts own profile"  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin reads all profiles"  ON profiles FOR ALL    USING (auth.role() = 'authenticated');

-- reviews
DROP POLICY IF EXISTS "Public read approved reviews"  ON reviews;
DROP POLICY IF EXISTS "Public insert reviews"         ON reviews;
DROP POLICY IF EXISTS "Admin manage reviews"          ON reviews;
CREATE POLICY "Public read approved reviews"  ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Public insert reviews"         ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage reviews"          ON reviews FOR ALL    USING (auth.role() = 'authenticated');

-- orders
DROP POLICY IF EXISTS "Public insert orders"  ON orders;
DROP POLICY IF EXISTS "User reads own orders" ON orders;
DROP POLICY IF EXISTS "Admin manage orders"   ON orders;
CREATE POLICY "Public insert orders"  ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "User reads own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated');
CREATE POLICY "Admin manage orders"   ON orders FOR ALL    USING (auth.role() = 'authenticated');

-- order_items
DROP POLICY IF EXISTS "Public insert order_items"  ON order_items;
DROP POLICY IF EXISTS "Public read order_items"    ON order_items;
DROP POLICY IF EXISTS "Admin manage order_items"   ON order_items;
CREATE POLICY "Public insert order_items"  ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read order_items"    ON order_items FOR SELECT USING (true);
CREATE POLICY "Admin manage order_items"   ON order_items FOR ALL    USING (auth.role() = 'authenticated');

-- notifications
DROP POLICY IF EXISTS "User reads own notifications"    ON notifications;
DROP POLICY IF EXISTS "Public insert notifications"     ON notifications;
DROP POLICY IF EXISTS "User updates own notifications"  ON notifications;
DROP POLICY IF EXISTS "Admin manage notifications"      ON notifications;
CREATE POLICY "User reads own notifications"    ON notifications FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated');
CREATE POLICY "Public insert notifications"     ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "User updates own notifications"  ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin manage notifications"      ON notifications FOR ALL    USING (auth.role() = 'authenticated');

-- chat_messages
DROP POLICY IF EXISTS "Public insert chat"  ON chat_messages;
DROP POLICY IF EXISTS "Public read chat"    ON chat_messages;
DROP POLICY IF EXISTS "Admin manage chat"   ON chat_messages;
CREATE POLICY "Public insert chat"  ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read chat"    ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Admin manage chat"   ON chat_messages FOR ALL    USING (auth.role() = 'authenticated');

-- mechanics
DROP POLICY IF EXISTS "Public read mechanics"  ON mechanics;
DROP POLICY IF EXISTS "Admin manage mechanics" ON mechanics;
CREATE POLICY "Public read mechanics"  ON mechanics FOR SELECT USING (true);
CREATE POLICY "Admin manage mechanics" ON mechanics FOR ALL    USING (auth.role() = 'authenticated');
