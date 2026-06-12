import { useState, useEffect } from 'react';
import { ShoppingBag, Package, Check, X, Eye, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_COLORS = {
  Pending:    'badge-pending',
  Processing: 'bg-blue-900/30 text-blue-400 border border-blue-700/40 px-2.5 py-0.5 rounded-full text-xs font-semibold',
  Shipped:    'bg-purple-900/30 text-purple-400 border border-purple-700/40 px-2.5 py-0.5 rounded-full text-xs font-semibold',
  Delivered:  'badge-completed',
  Cancelled:  'badge-cancelled',
};

export default function ManageOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null); // expanded order id

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (orderId, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) { toast.error('Failed to update status'); return; }
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success(`Order marked as ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <ShoppingBag size={20} className="text-accent-orange" /> Manage Orders
        </h1>
        <span className="text-slate-500 text-sm">{orders.length} total orders</span>
      </div>

      {loading ? (
        <div className="card p-16 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-brand-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-16 text-center">
          <Package size={40} className="text-dark-300 mx-auto mb-3" />
          <p className="text-slate-400">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="card">
              {/* Order header */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-white font-semibold">
                    #{order.id.slice(0,8).toUpperCase()} — {order.customer_name}
                  </p>
                  <p className="text-slate-500 text-xs">{order.customer_email} · {order.customer_phone || 'No phone'}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-accent-orange font-bold">${order.total_amount?.toFixed(2)}</span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="select py-1.5 text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-600 transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>

              {/* Expanded items */}
              {expanded === order.id && (
                <div className="border-t border-dark-300/40 px-4 py-3">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Order Items</p>
                  <div className="space-y-1.5">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-slate-300">
                        <span>{item.product_name} <span className="text-slate-500">× {item.quantity}</span></span>
                        <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-dark-300/40 pt-2 flex justify-between text-white font-semibold text-sm">
                      <span>Total</span>
                      <span className="text-accent-orange">${order.total_amount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
