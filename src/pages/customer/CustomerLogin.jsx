import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ChatWidget from '../../components/ChatWidget';

export default function CustomerLogin() {
  const { customerLogin, isCustomer, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isCustomer) {
      navigate('/', { replace: true });
    }
  }, [isCustomer, authLoading, navigate]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await customerLogin(form.email, form.password);
      if (form.email === 'admin@shop.com') {
        toast.success('Welcome back, Admin!');
        navigate('/admin/dashboard', { replace: true });
      } else {
        const userName = form.email.split('@')[0];
        toast.success(`Welcome back, ${userName}!`);
        navigate('/', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-accent-gradient shadow-glow-orange mb-4">
            <Wrench size={28} className="text-dark-900" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Sign In</h1>
          <p className="text-slate-400 text-sm mt-1">Access your appointments, orders & admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="label"><Mail size={13} className="inline mr-1.5" />Email</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              className="input" placeholder="you@email.com" required
            />
          </div>
          <div>
            <label className="label"><Lock size={13} className="inline mr-1.5" />Password</label>
            <input
              name="password" type="password" value={form.password} onChange={handleChange}
              className="input" placeholder="••••••••" required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-accent w-full justify-center py-3">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : <><LogIn size={16} /> Sign In</>}
          </button>

          <p className="text-center text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">Register here</Link>
          </p>
          <p className="text-center">
            <Link to="/" className="text-slate-600 hover:text-slate-400 text-xs">← Back to Home</Link>
          </p>
        </form>
      </div>
      <ChatWidget />
    </div>
  );
}
