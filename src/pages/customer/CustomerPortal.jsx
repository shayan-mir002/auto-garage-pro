import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  CalendarDays, ShoppingBag, Bell, User,
  LogOut, CheckCircle, Clock, XCircle, Loader2,
  AlertCircle, Package, Star, Edit2, Save,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'appointments', label: 'My Appointments', icon: CalendarDays },
  { id: 'orders',       label: 'My Orders',       icon: ShoppingBag  },
  { id: 'reviews',      label: 'Leave a Review',  icon: Star         },
  { id: 'notifications',label: 'Notifications',   icon: Bell         },
  { id: 'profile',      label: 'Profile',          icon: User         },
];

const STATUS_COLORS = {
  'Pending':          'bg-yellow-900/30 text-yellow-400 border-yellow-700/40',
  'In Progress':      'bg-blue-900/30 text-blue-400 border-blue-700/40',
  'Ready for Pickup': 'bg-green-900/30 text-green-400 border-green-700/40',
  'Completed':        'bg-slate-700/40 text-slate-300 border-slate-600/40',
  'Cancelled':        'bg-red-900/30 text-red-400 border-red-700/40',
};

export default function CustomerPortal() {
  const { session, profile, isCustomer, loading, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders]             = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [completedAppts, setCompletedAppts] = useState([]);
  const [dataLoading, setDataLoading]   = useState(false);

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', preferred_car: '' });

  // Review form state
  const [reviewForm, setReviewForm] = useState({ appointment_id: '', rating: 5, comment: '', service_type: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (profile) setProfileForm({ full_name: profile.full_name || '', phone: profile.phone || '', preferred_car: profile.preferred_car || '' });
  }, [profile]);

  useEffect(() => {
    if (isCustomer && session) fetchAllData();
  }, [isCustomer, session, activeTab]);

  const fetchAllData = async () => {
    setDataLoading(true);
    const email = session.user.email;

    const [apptRes, orderRes, notifRes] = await Promise.all([
      supabase.from('appointments').select('*').or(`user_id.eq.${session.user.id},customer_email.eq.${email}`).order('created_at', { ascending: false }),
      supabase.from('orders').select('*, order_items(*)').eq('user_id', session.user.id).order('created_at', { ascending: false }),
      supabase.from('notifications').select('*').or(`user_id.eq.${session.user.id},customer_email.eq.${email}`).order('created_at', { ascending: false }),
    ]);

    setAppointments(apptRes.data || []);
    setOrders(orderRes.data || []);
    setNotifications(notifRes.data || []);
    setCompletedAppts((apptRes.data || []).filter(a => a.status === 'Completed'));
    setDataLoading(false);
  };

  const markNotificationRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleProfileSave = async () => {
    try {
      await updateProfile(profileForm);
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) { toast.error('Please write a comment.'); return; }
    setSubmittingReview(true);
    try {
      const appt = completedAppts.find(a => a.id === reviewForm.appointment_id);
      await supabase.from('reviews').insert({
        appointment_id: reviewForm.appointment_id || null,
        customer_name: profile?.full_name || session.user.email,
        customer_email: session.user.email,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        service_type: appt?.service_type || reviewForm.service_type,
      });
      toast.success('Review submitted! It will appear after approval.');
      setReviewForm({ appointment_id: '', rating: 5, comment: '', service_type: '' });
    } catch {
      toast.error('Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-brand-400" /></div>;
  if (!isCustomer) return <Navigate to="/login" replace />;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-dark-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              Hello, {profile?.full_name || session.user.email.split('@')[0]} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">{session.user.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-3 space-y-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === id ? 'bg-brand-gradient text-white' : 'text-slate-400 hover:text-white hover:bg-dark-600'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                  {id === 'notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-accent-orange text-dark-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {dataLoading ? (
              <div className="card p-16 flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-brand-400" />
              </div>
            ) : (
              <>
                {/* ─── MY APPOINTMENTS ─── */}
                {activeTab === 'appointments' && (
                  <div className="space-y-4">
                    <h2 className="text-white font-semibold text-lg">My Appointments</h2>
                    {appointments.length === 0 ? (
                      <div className="card p-12 text-center">
                        <CalendarDays size={40} className="text-dark-300 mx-auto mb-3" />
                        <p className="text-slate-400">No appointments yet.</p>
                        <Link to="/appointments" className="btn-accent mt-4 inline-flex">Book Now</Link>
                      </div>
                    ) : appointments.map((a) => (
                      <div key={a.id} className="card p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-semibold">{a.service_type}</p>
                            <p className="text-slate-400 text-sm">{a.car_model}</p>
                          </div>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLORS[a.status] || ''}`}>
                            {a.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                          <span>📅 {a.appointment_date}</span>
                          <span>🕐 {a.time_slot}</span>
                        </div>
                        {/* Status Progress Bar */}
                        <div className="mt-4">
                          {['Pending','In Progress','Ready for Pickup','Completed'].map((s, i) => {
                            const steps = ['Pending','In Progress','Ready for Pickup','Completed'];
                            const currentIdx = steps.indexOf(a.status);
                            const done = i <= currentIdx;
                            return (
                              <div key={s} className="flex items-center gap-2 mb-1">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${done ? 'bg-brand-400' : 'bg-dark-400'}`} />
                                <span className={`text-xs ${done ? 'text-slate-300' : 'text-slate-600'}`}>{s}</span>
                              </div>
                            );
                          })}
                        </div>
                        {a.mechanic_notes && (
                          <div className="mt-3 bg-dark-600 rounded-lg p-3 text-sm text-slate-300">
                            <span className="text-slate-500 text-xs block mb-1">Mechanic Notes:</span>
                            {a.mechanic_notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── MY ORDERS ─── */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <h2 className="text-white font-semibold text-lg">My Orders</h2>
                    {orders.length === 0 ? (
                      <div className="card p-12 text-center">
                        <ShoppingBag size={40} className="text-dark-300 mx-auto mb-3" />
                        <p className="text-slate-400">No orders yet.</p>
                        <Link to="/products" className="btn-accent mt-4 inline-flex">Browse Products</Link>
                      </div>
                    ) : orders.map((o) => (
                      <div key={o.id} className="card p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-semibold">Order #{o.id.slice(0,8).toUpperCase()}</p>
                            <p className="text-slate-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLORS[o.status] || 'bg-slate-700/40 text-slate-300 border-slate-600/40'}`}>
                              {o.status}
                            </span>
                            <p className="text-accent-orange font-bold mt-1">${o.total_amount.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="space-y-1 mt-2">
                          {o.order_items?.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm text-slate-400">
                              <span>{item.product_name} × {item.quantity}</span>
                              <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── LEAVE A REVIEW ─── */}
                {activeTab === 'reviews' && (
                  <div>
                    <h2 className="text-white font-semibold text-lg mb-4">Leave a Review</h2>
                    {completedAppts.length === 0 ? (
                      <div className="card p-12 text-center">
                        <Star size={40} className="text-dark-300 mx-auto mb-3" />
                        <p className="text-slate-400">You need a completed appointment to leave a review.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitReview} className="card p-6 space-y-5">
                        <div>
                          <label className="label">Select Completed Appointment</label>
                          <select
                            className="select"
                            value={reviewForm.appointment_id}
                            onChange={(e) => setReviewForm(f => ({ ...f, appointment_id: e.target.value }))}
                            required
                          >
                            <option value="">-- Choose an appointment --</option>
                            {completedAppts.map((a) => (
                              <option key={a.id} value={a.id}>{a.service_type} — {a.appointment_date}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label">Rating</label>
                          <div className="flex gap-2">
                            {[1,2,3,4,5].map((r) => (
                              <button
                                key={r} type="button"
                                onClick={() => setReviewForm(f => ({ ...f, rating: r }))}
                                className={`text-2xl transition-transform hover:scale-110 ${r <= reviewForm.rating ? 'text-yellow-400' : 'text-dark-400'}`}
                              >★</button>
                            ))}
                            <span className="text-slate-400 text-sm ml-2 self-center">{reviewForm.rating}/5</span>
                          </div>
                        </div>
                        <div>
                          <label className="label">Your Comment</label>
                          <textarea
                            className="input resize-none" rows={4}
                            placeholder="Share your experience..."
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                            required
                          />
                        </div>
                        <button type="submit" disabled={submittingReview} className="btn-accent w-full justify-center py-3">
                          {submittingReview ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Star size={16} /> Submit Review</>}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* ─── NOTIFICATIONS ─── */}
                {activeTab === 'notifications' && (
                  <div className="space-y-3">
                    <h2 className="text-white font-semibold text-lg">Notifications</h2>
                    {notifications.length === 0 ? (
                      <div className="card p-12 text-center">
                        <Bell size={40} className="text-dark-300 mx-auto mb-3" />
                        <p className="text-slate-400">No notifications yet.</p>
                      </div>
                    ) : notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`card p-4 flex items-start gap-4 cursor-pointer transition-all ${!n.is_read ? 'border-brand-700/60' : ''}`}
                        onClick={() => !n.is_read && markNotificationRead(n.id)}
                      >
                        <div className={`p-2 rounded-lg flex-shrink-0 ${n.type === 'success' ? 'bg-green-900/30' : n.type === 'warning' ? 'bg-yellow-900/30' : 'bg-brand-900/30'}`}>
                          {n.type === 'success' ? <CheckCircle size={16} className="text-green-400" /> :
                           n.type === 'warning' ? <AlertCircle size={16} className="text-yellow-400" /> :
                           <Bell size={16} className="text-brand-400" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${n.is_read ? 'text-slate-400' : 'text-white'}`}>{n.title}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{n.message}</p>
                          <p className="text-slate-600 text-xs mt-1">{new Date(n.created_at).toLocaleString()}</p>
                        </div>
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0 mt-1" />}
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── PROFILE ─── */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-white font-semibold text-lg">My Profile</h2>
                      {!editing ? (
                        <button onClick={() => setEditing(true)} className="btn-outline text-sm py-2"><Edit2 size={14} /> Edit</button>
                      ) : (
                        <button onClick={handleProfileSave} className="btn-accent text-sm py-2"><Save size={14} /> Save</button>
                      )}
                    </div>
                    <div className="card p-6 space-y-5">
                      <div>
                        <label className="label">Full Name</label>
                        {editing ? (
                          <input className="input" value={profileForm.full_name} onChange={(e) => setProfileForm(f => ({ ...f, full_name: e.target.value }))} />
                        ) : (
                          <p className="text-white">{profile?.full_name || '—'}</p>
                        )}
                      </div>
                      <div>
                        <label className="label">Email</label>
                        <p className="text-slate-400">{session.user.email}</p>
                      </div>
                      <div>
                        <label className="label">Phone</label>
                        {editing ? (
                          <input className="input" value={profileForm.phone} onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
                        ) : (
                          <p className="text-white">{profile?.phone || '—'}</p>
                        )}
                      </div>
                      <div>
                        <label className="label">Preferred Car</label>
                        {editing ? (
                          <input className="input" value={profileForm.preferred_car} onChange={(e) => setProfileForm(f => ({ ...f, preferred_car: e.target.value }))} placeholder="e.g. Toyota Camry 2022" />
                        ) : (
                          <p className="text-white">{profile?.preferred_car || '—'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
