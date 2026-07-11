import { useState, useEffect } from 'react';
import { Star, Check, Trash2, Loader2 } from 'lucide-react';
import { getAll, update, remove } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getAll('reviews');
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReviews(data);
    } catch (err) {
      console.error('[ManageReviews] Error fetching reviews:', err);
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (id) => {
    await update('reviews', id, { is_approved: true });
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, is_approved: true } : r));
    toast.success('Review approved!');
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    await remove('reviews', id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success('Review deleted.');
  };

  const filtered = reviews.filter((r) => {
    if (filter === 'pending')  return !r.is_approved;
    if (filter === 'approved') return r.is_approved;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <Star size={20} className="text-yellow-400" /> Manage Reviews
        </h1>
        <div className="flex gap-2">
          {['all','pending','approved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? 'bg-brand-gradient text-white' : 'bg-dark-600 text-slate-400 hover:text-white border border-dark-300'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'pending' && `(${reviews.filter(r => !r.is_approved).length})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card p-16 flex items-center justify-center"><Loader2 size={28} className="animate-spin text-brand-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Star size={40} className="text-dark-300 mx-auto mb-3" />
          <p className="text-slate-400">No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.id} className={`card p-5 ${!r.is_approved ? 'border-yellow-700/30' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">{r.customer_name}</span>
                    {!r.is_approved && (
                      <span className="bg-yellow-900/30 text-yellow-400 border border-yellow-700/40 text-xs px-2 py-0.5 rounded-full">Pending</span>
                    )}
                    {r.is_approved && (
                      <span className="bg-green-900/30 text-green-400 border border-green-700/40 text-xs px-2 py-0.5 rounded-full">Approved</span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mb-2">{r.customer_email} · {r.service_type}</p>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={s <= r.rating ? 'text-yellow-400' : 'text-dark-400'}>★</span>
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">"{r.comment}"</p>
                  <p className="text-slate-600 text-xs mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {!r.is_approved && (
                    <button onClick={() => approveReview(r.id)} className="p-2 rounded-lg bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-colors" title="Approve">
                      <Check size={16} />
                    </button>
                  )}
                  <button onClick={() => deleteReview(r.id)} className="p-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
