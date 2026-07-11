import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check, MessageSquare } from 'lucide-react';
import { getAll, insert, update, remove } from '../../lib/supabase';
import { PRODUCT_CATEGORIES, SEED_PRODUCTS, getImageUrl } from '../../utils/constants';
import toast from 'react-hot-toast';

const emptyForm = { name: '', category: 'Filters', description: '', price: '', image_url: '' };

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('products');
  const [seeding, setSeeding] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [productsData, inquiriesData] = await Promise.all([
      getAll('products'),
      getAll('inquiries'),
    ]);
    productsData.sort((a, b) => a.name.localeCompare(b.name));
    inquiriesData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setProducts(productsData);
    setInquiries(inquiriesData.map((i) => ({ ...i, products: productsData.find((p) => p.id === i.product_id) })));
    setLoading(false);
  };

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, category: p.category, description: p.description || '', price: p.price, image_url: p.image_url || '' });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Name and price are required.'); return; }
    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      price: parseFloat(form.price),
      image_url: form.image_url,
      is_active: true,
    };
    if (editId) {
      await update('products', editId, payload);
      toast.success('Product updated.');
    } else {
      await insert('products', payload);
      toast.success('Product created.');
    }
    setShowForm(false);
    setSaving(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!id) {
      toast.error('Cannot delete: Missing product ID.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    await remove('products', id);
    toast.success('Product deleted successfully.');
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSeedProducts = async () => {
    if (!window.confirm(`Seed ${SEED_PRODUCTS.length} default products?`)) return;
    setSeeding(true);
    for (const p of SEED_PRODUCTS) {
      await insert('products', { ...p, is_active: true });
    }
    toast.success(`${SEED_PRODUCTS.length} products seeded!`);
    setSeeding(false);
    fetchData();
  };

  const handleClearProducts = async () => {
    if (!window.confirm('WARNING: This will delete ALL products. Continue?')) return;
    setLoading(true);
    const all = await getAll('products');
    for (const p of all) {
      await remove('products', p.id);
    }
    toast.success('Catalog cleared.');
    setLoading(false);
    fetchData();
  };

  const updateInquiryStatus = async (id, status) => {
    await update('inquiries', id, { status });
    setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
    toast.success('Inquiry updated.');
  };

  const newInquiryCount = inquiries.filter((i) => i.status === 'New').length;
  const categories = PRODUCT_CATEGORIES.filter((c) => c !== 'All');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-display font-bold text-xl">Products &amp; Inquiries</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {products.length} products · {newInquiryCount} new inquiries
          </p>
        </div>
        <div className="flex gap-2">
          {products.length === 0 ? (
            <button onClick={handleSeedProducts} disabled={seeding} className="btn-outline text-sm py-2">
              {seeding && <Loader2 size={14} className="animate-spin" />}
              Seed 18 Products
            </button>
          ) : (
            <button onClick={handleClearProducts} className="btn-ghost text-red-400 border border-red-500/20 text-sm py-2 px-3">
              <Trash2 size={14} /> Clear Catalog
            </button>
          )}
          <button onClick={openAdd} className="btn-accent text-sm py-2">
            <Plus size={15} /> Add Product
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-800 rounded-xl w-fit">
        {['products', 'inquiries'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-brand-gradient text-white' : 'text-slate-400 hover:text-white'
              }`}
          >
            {t}
            {t === 'inquiries' && newInquiryCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-accent-orange text-dark-900 text-[10px] font-bold rounded-full">
                {newInquiryCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Inline form */}
      {showForm && tab === 'products' && (
        <div className="card p-6 border-brand-700/30">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">{editId ? 'Edit' : 'New'} Product</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Product Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="e.g. Oil Filter" required />
              </div>
              <div>
                <label className="label">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="select">
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Price ($)</label>
                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} className="input" placeholder="29.99" required />
              </div>
              <div>
                <label className="label">Image URL</label>
                <input name="image_url" value={form.image_url} onChange={handleChange} className="input" placeholder="https://picsum.photos/seed/xxx/400/300" />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="input resize-none" rows={3} placeholder="Product description..." />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost border border-dark-300 flex-1 justify-center">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products table */}
      {tab === 'products' && (
        <div className="card overflow-hidden">
          <div className="table-wrapper rounded-xl">
            <table className="data-table">
              <thead>
                <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={5}><div className="h-4 bg-dark-600 rounded animate-pulse" /></td></tr>
                  ))
                  : products.length === 0
                    ? <tr><td colSpan={5} className="text-center text-slate-500 py-10">No products yet. Click "Seed 18 Products" to get started.</td></tr>
                    : products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <img src={getImageUrl(p.image_url, p.name)} alt={p.name} className="w-14 h-10 object-cover rounded-lg bg-dark-600"
                            onError={(e) => { e.target.style.opacity = '0.3'; }} />
                        </td>
                        <td className="text-white font-medium max-w-[200px] truncate">{p.name}</td>
                        <td><span className="px-2 py-0.5 rounded text-xs bg-dark-600 text-slate-400">{p.category}</span></td>
                        <td className="font-mono">${p.price?.toFixed(2)}</td>
                        <td>
                          <div className="flex gap-1.5">
                            <button onClick={() => openEdit(p)} className="p-1.5 rounded-md text-brand-400 hover:bg-brand-400/10 transition-colors"><Pencil size={13} /></button>
                            <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-md text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inquiries table */}
      {tab === 'inquiries' && (
        <div className="card overflow-hidden">
          <div className="table-wrapper rounded-xl">
            <table className="data-table">
              <thead>
                <tr><th>Product</th><th>Customer</th><th>Contact</th><th>Message</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {inquiries.length === 0
                  ? <tr><td colSpan={6} className="text-center text-slate-500 py-10">No inquiries yet.</td></tr>
                  : inquiries.map((i) => (
                    <tr key={i.id}>
                      <td className="text-white text-xs max-w-[120px] truncate">{i.products?.name || '—'}</td>
                      <td className="text-white font-medium">{i.customer_name}</td>
                      <td className="text-xs">
                        <div>{i.customer_email}</div>
                        <div className="text-slate-500">{i.customer_phone}</div>
                      </td>
                      <td className="max-w-[160px] truncate text-xs text-slate-400">{i.message || '—'}</td>
                      <td><span className={i.status === 'New' ? 'badge-new' : 'badge-reviewed'}>{i.status}</span></td>
                      <td>
                        <button
                          onClick={() => updateInquiryStatus(i.id, i.status === 'New' ? 'Reviewed' : 'New')}
                          className="p-1.5 rounded-md text-brand-400 hover:bg-brand-400/10 transition-colors"
                          title="Toggle status"
                        >
                          <MessageSquare size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
