// MongoDB-backed data store via API — replaces localStorage

const API_BASE = '/api/data';

async function safeJson(res) {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export async function getAll(name, orderBy) {
  const params = orderBy ? `?orderBy=${encodeURIComponent(orderBy)}` : '';
  const res = await fetch(`${API_BASE}/${name}${params}`);
  if (!res.ok) throw new Error(`Failed to fetch ${name}`);
  return (await safeJson(res)) || [];
}

export async function getById(name, id) {
  const res = await fetch(`${API_BASE}/${name}/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch ${name}/${id}`);
  return safeJson(res);
}

export async function query(name, fn) {
  const rows = await getAll(name);
  return rows.filter(fn);
}

export async function insert(name, data) {
  const record = { ...data, created_at: new Date().toISOString() };
  const res = await fetch(`${API_BASE}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error(`Failed to insert into ${name}`);
  return safeJson(res);
}

export async function update(name, id, changes) {
  const res = await fetch(`${API_BASE}/${name}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
  if (!res.ok) throw new Error(`Failed to update ${name}/${id}`);
  return safeJson(res);
}

export async function remove(name, id) {
  const res = await fetch(`${API_BASE}/${name}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete ${name}/${id}`);
  return safeJson(res);
}

export async function ensureTable(name, seedData) {
  const res = await fetch(`${API_BASE}/${name}/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records: seedData.map(item => ({ ...item, created_at: new Date().toISOString() })) }),
  });
  if (!res.ok) throw new Error(`Failed to seed ${name}`);
  return safeJson(res);
}
