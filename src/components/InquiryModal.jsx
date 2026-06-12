import { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function InquiryModal({ product, onClose }) {
  const [form, setForm] = useState({ customer_name: '', customer_email: '', customer_phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.customer_email) {
      toast.error('Please fill in your name and email.');
      return;
    }
    setSubmitting(true);
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);
    
    try {
      const { error } = await supabase.from('inquiries').insert({
        product_id: isUUID ? product.id : null,
        ...form,
      });
      if (error) throw error;
      toast.success('Inquiry sent! We\'ll get back to you soon.');
      onClose();
    } catch (err) {
      toast.error('Failed to send inquiry. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-dark-300">
          <div>
            <h2 className="text-lg font-display font-bold text-white">Request to Buy</h2>
            <p className="text-sm text-slate-400 mt-0.5">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Your Name <span className="text-red-400">*</span></label>
            <input name="customer_name" value={form.customer_name} onChange={handleChange}
              className="input" placeholder="John Smith" required />
          </div>
          <div>
            <label className="label">Email Address <span className="text-red-400">*</span></label>
            <input name="customer_email" type="email" value={form.customer_email} onChange={handleChange}
              className="input" placeholder="john@example.com" required />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input name="customer_phone" type="tel" value={form.customer_phone} onChange={handleChange}
              className="input" placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea name="message" value={form.message} onChange={handleChange}
              className="input resize-none" rows={3}
              placeholder="Any additional information about your inquiry..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center border border-dark-300">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-accent flex-1 justify-center">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {submitting ? 'Sending...' : 'Send Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
