import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ShoppingBag, Clock, MessageSquare, TrendingUp, ChevronRight, Star, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#f97316', '#22c55e', '#a855f7', '#eab308'];

export default function AdminDashboard() {
  const [stats, setStats]           = useState({ today: 0, pending: 0, inquiries: 0, totalProducts: 0, newOrders: 0, pendingReviews: 0 });
  const [recentAppts, setRecentAppts] = useState([]);
  const [serviceChart, setServiceChart] = useState([]);
  const [statusChart, setStatusChart]   = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const today = new Date().toISOString().split('T')[0];

    const [todayRes, pendingRes, inquiryRes, productRes, recentRes, ordersRes, reviewsRes, allAppts] = await Promise.all([
      supabase.from('appointments').select('id', { count: 'exact' }).eq('appointment_date', today),
      supabase.from('appointments').select('id', { count: 'exact' }).eq('status', 'Pending'),
      supabase.from('inquiries').select('id', { count: 'exact' }).eq('status', 'New'),
      supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('appointments').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'Pending'),
      supabase.from('reviews').select('id', { count: 'exact' }).eq('is_approved', false),
      supabase.from('appointments').select('service_type, status'),
    ]);

    setStats({
      today:          todayRes.count    || 0,
      pending:        pendingRes.count  || 0,
      inquiries:      inquiryRes.count  || 0,
      totalProducts:  productRes.count  || 0,
      newOrders:      ordersRes.count   || 0,
      pendingReviews: reviewsRes.count  || 0,
    });
    setRecentAppts(recentRes.data || []);

    // Build service popularity chart
    const appts = allAppts.data || [];
    const serviceCounts = {};
    appts.forEach((a) => {
      serviceCounts[a.service_type] = (serviceCounts[a.service_type] || 0) + 1;
    });
    setServiceChart(
      Object.entries(serviceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name: name.replace(' Package', ''), count }))
    );

    // Build status distribution pie
    const statusCounts = {};
    appts.forEach((a) => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });
    setStatusChart(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

    setLoading(false);
  };

  const statCards = [
    { label: "Today's Appointments", value: stats.today,         icon: CalendarDays, color: 'text-brand-400',    bg: 'bg-brand-900/30',   link: '/admin/appointments' },
    { label: 'Pending Appointments', value: stats.pending,       icon: Clock,        color: 'text-yellow-400',  bg: 'bg-yellow-900/20',  link: '/admin/appointments' },
    { label: 'New Inquiries',        value: stats.inquiries,     icon: MessageSquare,color: 'text-accent-orange',bg: 'bg-orange-900/20', link: '/admin/products' },
    { label: 'Active Products',      value: stats.totalProducts, icon: ShoppingBag,  color: 'text-green-400',   bg: 'bg-green-900/20',   link: '/admin/products' },
    { label: 'Pending Orders',       value: stats.newOrders,     icon: Package,      color: 'text-purple-400',  bg: 'bg-purple-900/20',  link: '/admin/orders' },
    { label: 'Reviews to Approve',   value: stats.pendingReviews,icon: Star,         color: 'text-yellow-400',  bg: 'bg-yellow-900/20',  link: '/admin/reviews' },
  ];

  const statusBadge = (s) => {
    const map = { Pending: 'badge-pending', Completed: 'badge-completed', Cancelled: 'badge-cancelled', 'In Progress': 'bg-blue-900/30 text-blue-400 border border-blue-700/40 px-2.5 py-0.5 rounded-full text-xs font-semibold' };
    return <span className={map[s] || 'badge-new'}>{s}</span>;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-dark-700 border border-dark-300/40 rounded-lg px-3 py-2 text-sm text-white shadow-lg">
        {payload[0].name}: <span className="font-bold text-accent-orange">{payload[0].value}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, link }) => (
          <Link key={label} to={link} className="card p-4 hover:border-dark-200/50 transition-all group">
            <div className={`p-2 rounded-xl ${bg} w-fit mb-2`}>
              <Icon size={18} className={color} />
            </div>
            <div className="text-2xl font-display font-black text-white mb-0.5">
              {loading ? <span className="animate-pulse bg-dark-500 rounded w-6 h-6 inline-block" /> : value}
            </div>
            <p className="text-slate-500 text-xs leading-tight">{label}</p>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Popularity Bar Chart */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4 text-sm">Top Services Booked</h2>
          {loading || serviceChart.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={serviceChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="url(#blueGrad)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Pie Chart */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4 text-sm">Appointment Status Distribution</h2>
          {loading || statusChart.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35}>
                  {statusChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-300/40">
          <h2 className="text-white font-semibold">Recent Appointments</h2>
          <Link to="/admin/appointments" className="text-brand-400 text-xs hover:text-brand-300 flex items-center gap-1">
            View All <ChevronRight size={12} />
          </Link>
        </div>
        <div className="table-wrapper rounded-none rounded-b-xl">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th><th>Vehicle</th><th>Service</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}><td colSpan={5}><div className="h-4 bg-dark-600 rounded animate-pulse" /></td></tr>
                ))
              ) : recentAppts.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-500 py-8">No appointments yet.</td></tr>
              ) : recentAppts.map((a) => (
                <tr key={a.id}>
                  <td className="text-white font-medium">{a.customer_name}</td>
                  <td>{a.car_model}</td>
                  <td>{a.service_type}</td>
                  <td>{a.appointment_date}</td>
                  <td>{statusBadge(a.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Appointments', path: '/admin/appointments', icon: CalendarDays },
          { label: 'Orders',       path: '/admin/orders',       icon: Package      },
          { label: 'Reviews',      path: '/admin/reviews',      icon: Star         },
          { label: 'Chat',         path: '/admin/chat',         icon: MessageSquare},
        ].map(({ label, path, icon: Icon }) => (
          <Link key={path} to={path} className="card p-4 flex items-center gap-3 hover:border-brand-700/40 transition-all group">
            <Icon size={16} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
            <span className="text-slate-400 text-xs font-medium group-hover:text-white transition-colors">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
