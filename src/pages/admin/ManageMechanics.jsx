import { useState, useEffect } from 'react';
import { Wrench, Plus, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';
import { getAll, insert, update, remove } from '../../lib/supabase';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', specialization: '', phone: '', is_available: true };

export default function ManageMechanics() {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);

  useEffect(() => { fetchMechanics(); }, []);

  const fetchMechanics = async () => {
    setLoading(true);
    const data = await getAll('mechanics');
    data.sort((a, b) => a.name.localeCompare(b.name));
    setMechanics(data);
    setLoading(false);
  };

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [e.target.name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await update('mechanics', editId, form);
        toast.success('Mechanic updated!');
      } else {
        await insert('mechanics', form);
        toast.success('Mechanic added!');
      }
      fetchMechanics();
      setForm(EMPTY_FORM);
      setShowForm(false);
      setEditId(null);
    } catch {
      toast.error('Failed to save mechanic.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (m) => {
    setForm({ name: m.name, specialization: m.specialization || '', phone: m.phone || '', is_available: m.is_available });
    setEditId(m.id);
    setShowForm(true);
  };

  const deleteMechanic = async (id) => {
    if (!confirm('Delete this mechanic?')) return;
    await remove('mechanics', id);
    setMechanics((prev) => prev.filter((m) => m.id !== id));
    toast.success('Mechanic deleted.');
  };

  const toggleAvailable = async (id, val) => {
    await update('mechanics', id, { is_available: val });
    setMechanics((prev) => prev.map((m) => m.id === id ? { ...m, is_available: val } : m));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <Wrench size={20} className="text-brand-400" /> Manage Mechanics
        </h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }} className="btn-accent text-sm py-2">
          <Plus size={16} /> Add Mechanic
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-white font-semibold">{editId ? 'Edit Mechanic' : 'Add New Mechanic'}</h2>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="text-slate-500 hover:text-white"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="Full Name" required />
            </div>
            <div>
              <label className="label">Specialization</label>
              <input name="specialization" value={form.specialization} onChange={handleChange} className="input" placeholder="e.g. Engine & Brakes" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="input" placeholder="+1-555-0100" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
              <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange} className="w-4 h-4 accent-brand-500" />
              Available
            </label>
            <button type="submit" disabled={saving} className="btn-accent text-sm py-2 ml-auto">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save</>}
            </button>
          </div>
        </form>
      )}

      {/* Mechanics list */}
      {loading ? (
        <div className="card p-16 flex items-center justify-center"><Loader2 size={28} className="animate-spin text-brand-400" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mechanics.map((m) => (
            <div key={m.id} className="card p-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{m.name}</p>
                  <p className="text-slate-500 text-xs">{m.specialization || 'General'}</p>
                  <p className="text-slate-600 text-xs">{m.phone || 'No phone'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAvailable(m.id, !m.is_available)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${m.is_available ? 'bg-green-900/30 text-green-400 border-green-700/40' : 'bg-red-900/30 text-red-400 border-red-700/40'}`}
                >
                  {m.is_available ? 'Available' : 'Busy'}
                </button>
                <button onClick={() => startEdit(m)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-600 transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => deleteMechanic(m.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
