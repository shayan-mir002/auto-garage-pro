import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check } from 'lucide-react';
import { getAll, insert, update, remove } from '../../lib/supabase';
import toast from 'react-hot-toast';

const emptyForm = { tier: 'Basic', name: '', description: '', price: '', inclusions: '' };

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    setLoading(true);
    const data = await getAll('service_plans');
    data.sort((a, b) => a.price - b.price);
    setServices(data);
    setLoading(false);
  };

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (s) => {
    setForm({ tier: s.tier, name: s.name, description: s.description || '', price: s.price, inclusions: (s.inclusions || []).join('\n') });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Name and price are required.'); return; }
    setSaving(true);
    const payload = {
      tier: form.tier,
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      inclusions: form.inclusions.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    if (editId) {
      await update('service_plans', editId, payload);
      toast.success('Service plan updated.');
    } else {
      await insert('service_plans', { ...payload, is_active: true });
      toast.success('Service plan created.');
    }
    setShowForm(false);
    setSaving(false);
    fetchServices();
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm('Restore the 3 standard service packages?')) return;
    setSaving(true);
    const defaults = [
      { tier: 'Basic', name: 'Basic Package', price: 49.99, description: 'Essential maintenance for everyday driving.', inclusions: ['Engine Oil Change','Oil Filter Replacement','Visual Safety Inspection','Fluid Top-up','Tyre Pressure Check'], is_active: true },
      { tier: 'Standard', name: 'Standard Package', price: 99.99, description: 'Comprehensive care for peace of mind on the road.', inclusions: ['All Basic Services','Brake Pad Inspection','Brake Fluid Check','Tyre Rotation','Battery Health Test','Air Filter Check'], is_active: true },
      { tier: 'Premium', name: 'Premium Package', price: 199.99, description: 'The complete vehicle overhaul — nothing left unchecked.', inclusions: ['All Standard Services','Full Engine Tune-Up','Spark Plug Replacement','Interior & Exterior Detailing','Diagnostics Scan','Coolant Flush','Transmission Fluid Check','Comprehensive Road Test'], is_active: true }
    ];
    for (const d of defaults) {
      await insert('service_plans', d);
    }
    toast.success('Standard plans restored!');
    setSaving(false);
    fetchServices();
  };

  const handleClearAll = async () => {
    if (!window.confirm('DANGER: This will delete ALL service plans. Continue?')) return;
    setLoading(true);
    const all = await getAll('service_plans');
    for (const s of all) {
      await remove('service_plans', s.id);
    }
    toast.success('All services cleared.');
    setLoading(false);
    fetchServices();
  };

  const handleDelete = async (id) => {
    if (!id) return;
    await remove('service_plans', id);
    toast.success('Deleted successfully.');
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleActive = async (s) => {
    await update('service_plans', s.id, { is_active: !s.is_active });
    setServices((prev) => prev.map((p) => p.id === s.id ? { ...p, is_active: !p.is_active } : p));
  };

  const tierColors = { Basic: 'text-slate-400', Standard: 'text-brand-400', Premium: 'text-accent-orange' };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-display font-bold text-xl">Service Plans</h2>
          <p className="text-slate-500 text-sm mt-0.5">{services.length} packages active</p>
        </div>
        <div className="flex gap-2">
          {services.length === 0 ? (
            <button onClick={handleSeedDefaults} className="btn-outline text-sm py-2">
              Seed Default Plans
            </button>
          ) : (
            <button onClick={handleClearAll} className="btn-ghost text-red-400 border border-red-500/20 text-sm py-2 px-3">
              <Trash2 size={14} /> Clear All
            </button>
          )}
          <button onClick={openAdd} className="btn-accent text-sm py-2">
            <Plus size={15} /> Add Plan
          </button>
        </div>
      </div>

      {/* Form panel */}
      {showForm && (
        <div className="card p-6 border-brand-700/30">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">{editId ? 'Edit' : 'New'} Service Plan</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Tier</label>
                <select name="tier" value={form.tier} onChange={handleChange} className="select">
                  <option>Basic</option><option>Standard</option><option>Premium</option>
                </select>
              </div>
              <div>
                <label className="label">Plan Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="e.g. Basic Package" required />
              </div>
              <div>
                <label className="label">Price ($)</label>
                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} className="input" placeholder="49.99" required />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <input name="description" value={form.description} onChange={handleChange} className="input" placeholder="Short description..." />
            </div>
            <div>
              <label className="label">Inclusions <span className="text-slate-500 font-normal">(one per line)</span></label>
              <textarea name="inclusions" value={form.inclusions} onChange={handleChange}
                className="input resize-none" rows={5} placeholder={"Oil Change\nOil Filter\nInspection"} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost border border-dark-300 flex-1 justify-center">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {saving ? 'Saving...' : 'Save Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-wrapper rounded-xl">
          <table className="data-table">
            <thead><tr><th>Tier</th><th>Name</th><th>Price</th><th>Inclusions</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="h-4 bg-dark-600 rounded animate-pulse" /></td></tr>)
              ) : services.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-slate-500 py-10">No service plans yet. Click "Add Plan" to create one.</td></tr>
              ) : (
                services.map((s) => (
                  <tr key={s.id}>
                    <td><span className={`font-semibold ${tierColors[s.tier]}`}>{s.tier}</span></td>
                    <td className="text-white font-medium">{s.name}</td>
                    <td className="font-mono">${s.price?.toFixed(2)}</td>
                    <td className="max-w-xs"><span className="text-xs text-slate-500">{(s.inclusions || []).slice(0, 3).join(', ')}{s.inclusions?.length > 3 ? '...' : ''}</span></td>
                    <td>
                      <button onClick={() => toggleActive(s)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${s.is_active ? 'bg-green-500/15 text-green-400 border-green-500/20' : 'bg-dark-600 text-slate-500 border-dark-300'}`}>
                        {s.is_active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEdit(s)} 
                          className="px-2 py-1.5 rounded bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 text-xs font-bold transition-all"
                        >
                          EDIT
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id)} 
                          className="px-2 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all"
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
