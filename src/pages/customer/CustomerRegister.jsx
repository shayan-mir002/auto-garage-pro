import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, Mail, Lock, User, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ChatWidget from '../../components/ChatWidget';

export default function CustomerRegister() {
  const { customerRegister } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.'); return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.'); return;
    }
    setLoading(true);
    try {
      await customerRegister(form.email, form.password, form.fullName);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-accent-gradient shadow-glow-orange mb-4">
            <Wrench size={28} className="text-dark-900" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join AutoGarage Pro for a better experience</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="label"><User size={13} className="inline mr-1.5" />Full Name</label>
            <input
              name="fullName" value={form.fullName} onChange={handleChange}
              className="input" placeholder="John Smith" required
            />
          </div>
          <div>
            <label className="label"><Mail size={13} className="inline mr-1.5" />Email</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              className="input" placeholder="you@email.com" required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label"><Lock size={13} className="inline mr-1.5" />Password</label>
              <input
                name="password" type="password" value={form.password} onChange={handleChange}
                className="input" placeholder="••••••••" required
              />
            </div>
            <div>
              <label className="label">Confirm</label>
              <input
                name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                className="input" placeholder="••••••••" required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-accent w-full justify-center py-3">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><UserPlus size={16} /> Create Account</>}
          </button>

          <p className="text-center text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
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
