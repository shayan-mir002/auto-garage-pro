import { useState, useEffect, useRef } from 'react';
import { X, ShoppingCart, Plus, Minus, Trash2, CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { insert } from '../lib/supabase';
import { getImageUrl } from '../utils/constants';
import toast from 'react-hot-toast';

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQty, clearCart, totalItems, totalPrice } = useCart();
  const { session, isCustomer } = useAuth();
  const navigate = useNavigate();
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', phone: '' });
  const [step, setStep] = useState('cart');
  const [submitting, setSubmitting] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (session) setCheckoutForm(f => ({ ...f, email: session.user.email }));
  }, [session]);

  useEffect(() => {
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!session) {
      toast.error('Please log in first to place an order.');
      onClose();
      navigate('/login');
      return;
    }
    if (items.length === 0) return;
    setSubmitting(true);

    const orderItems = items.map((i) => ({
      product_id:   i.id,
      product_name: i.name,
      unit_price:   i.price,
      quantity:     i.qty,
    }));

    const order = await insert('orders', {
      user_id: session?.user?.id || null,
      customer_name:  checkoutForm.name,
      customer_email: checkoutForm.email,
      customer_phone: checkoutForm.phone,
      total_amount:   totalPrice,
      status: 'Pending',
    });

    await insert('order_items',
      orderItems.map((i) => ({ ...i, order_id: order.id }))
    );

    if (session && isCustomer) {
      await insert('notifications', {
        user_id: session.user.id,
        title:   'Order Placed Successfully!',
        message: `Your order of ${totalItems} item(s) totalling $${totalPrice.toFixed(2)} is being processed.`,
        type:    'success',
      });
    }

    clearCart();
    setStep('success');
    setSubmitting(false);
  };

  const handleClose = () => {
    setStep('cart');
    setCheckoutForm({ name: '', email: session?.user?.email || '', phone: '' });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div ref={drawerRef} className="relative w-full max-w-md bg-dark-800 border-l border-dark-300/40 h-full flex flex-col shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-300/40">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-accent-orange" />
            <span className="text-white font-semibold">Cart</span>
            {totalItems > 0 && (
              <span className="bg-accent-orange text-dark-900 text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
            )}
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-700/40 flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Order Placed!</h3>
              <p className="text-slate-400 text-sm mb-6">We'll contact you to confirm your order.</p>
              {isCustomer && <p className="text-brand-400 text-xs mb-4">Check your notifications in the portal for updates.</p>}
              <button onClick={handleClose} className="btn-accent">Continue Shopping</button>
            </div>
          )}

          {step === 'checkout' && (
            <form onSubmit={handleCheckout} className="space-y-4">
              <button type="button" onClick={() => setStep('cart')} className="text-slate-400 hover:text-white text-sm mb-2">← Back to Cart</button>
              <h3 className="text-white font-semibold text-lg">Your Details</h3>
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={checkoutForm.name} onChange={(e) => setCheckoutForm(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={checkoutForm.email} onChange={(e) => setCheckoutForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" required />
              </div>
              <div>
                <label className="label">Phone (optional)</label>
                <input className="input" value={checkoutForm.phone} onChange={(e) => setCheckoutForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
              </div>

              <div className="bg-dark-700 rounded-xl p-4 space-y-2 mt-4">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Order Summary</p>
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between text-sm text-slate-300">
                    <span>{i.name} × {i.qty}</span>
                    <span>${(i.price * i.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-dark-300/40 pt-2 flex justify-between text-white font-bold">
                  <span>Total</span>
                  <span className="text-accent-orange">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-accent w-full justify-center py-3 mt-2">
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <><CreditCard size={16} /> Place Order</>}
              </button>
            </form>
          )}

          {step === 'cart' && (
            items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingCart size={48} className="text-dark-400 mb-4" />
                <p className="text-slate-400 mb-4">Your cart is empty.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="card p-4 flex gap-3">
                    <div className="w-14 h-14 rounded-lg bg-dark-600 overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img src={getImageUrl(item.image_url, item.name)} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-dark-300 text-xs">IMG</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium leading-snug line-clamp-2">{item.name}</p>
                      <p className="text-accent-orange text-sm font-bold mt-0.5">${(item.price * item.qty).toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-1 rounded-md bg-dark-600 hover:bg-dark-500 text-slate-400 hover:text-white transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="text-white text-sm w-5 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-1 rounded-md bg-dark-600 hover:bg-dark-500 text-slate-400 hover:text-white transition-colors">
                          <Plus size={12} />
                        </button>
                        <button onClick={() => removeItem(item.id)} className="p-1 ml-auto rounded-md text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        {step === 'cart' && items.length > 0 && (
          <div className="border-t border-dark-300/40 p-5 space-y-3">
            <div className="flex justify-between text-white font-bold text-lg">
              <span>Total</span>
              <span className="text-accent-orange">${totalPrice.toFixed(2)}</span>
            </div>
            <button onClick={() => { if (!session) { toast.error('Please log in first to place an order.'); onClose(); navigate('/login'); return; } setStep('checkout'); }} className="btn-accent w-full justify-center py-3">
              <CreditCard size={16} /> Proceed to Checkout
            </button>
            <button onClick={clearCart} className="w-full text-slate-600 hover:text-slate-400 text-xs transition-colors">
              Clear cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
