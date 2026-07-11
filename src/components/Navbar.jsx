import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wrench, Menu, X, Phone, ChevronRight, ShoppingCart, Bell, User, LogOut, LayoutDashboard } from 'lucide-react';
import { NAV_LINKS } from '../utils/constants';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const [open, setOpen]           = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [cartOpen, setCartOpen]   = useState(false);
  const { pathname } = useLocation();
  const { totalItems } = useCart();
  const { isCustomer, isAdmin, session, profile, logout, loading } = useAuth();
  const navigate = useNavigate();
  const loggingOut = useRef(false);

  // Navigate after auth state has fully updated during logout
  useEffect(() => {
    if (loggingOut.current && !session && !loading) {
      loggingOut.current = false;
      navigate('/', { replace: true });
    }
  }, [session, loading, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const handleLogout = () => {
    loggingOut.current = true;
    logout();
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-800`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 group-hover:scale-105 transition-transform">
                <Wrench size={20} className="text-orange-500" />
              </div>
              <div className="leading-tight">
                <span className="block text-white font-display font-black text-xl tracking-tight">AutoGarage</span>
                <span className="block text-orange-500 text-[11px] font-bold tracking-[0.15em] uppercase -mt-1">Pro</span>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(({ label, path }) => {
                const active = pathname === path;
                return (
                  <Link key={path} to={path}
                    className={`text-sm font-semibold transition-all duration-200 ${
                      active ? 'text-orange-500' : 'text-slate-300 hover:text-orange-400'
                    }`}>
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-4">
              {/* Cart icon */}
              <button onClick={() => setCartOpen(true)} className="relative p-2 rounded-lg text-slate-300 hover:text-orange-400 hover:bg-slate-800 transition-colors">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

              {/* Auth area */}
              {session ? (
                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <Link to="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-orange-400 hover:bg-slate-800 text-sm font-semibold transition-colors">
                      <LayoutDashboard size={16} />
                      <span>Dashboard</span>
                    </Link>
                  ) : (
                    <Link to="/portal" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-orange-400 hover:bg-slate-800 text-sm font-semibold transition-colors">
                      <User size={16} />
                      <span>{profile?.full_name || session?.user?.email?.split('@')[0] || 'Portal'}</span>
                    </Link>
                  )}
                  <button onClick={handleLogout} className="p-2 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title="Sign Out">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-1.5 text-slate-300 hover:text-orange-400 font-semibold text-sm transition-colors px-3 py-2 rounded-lg hover:bg-slate-800">
                  <User size={16} /> Login
                </Link>
              )}

              <Link to="/appointments" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-2.5 px-6 rounded-md shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/40">
                Book Appointment
              </Link>
            </div>

            {/* Mobile: Cart + Hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <button onClick={() => setCartOpen(true)} className="relative p-2 rounded-lg text-slate-300 hover:text-orange-400 transition-colors">
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">{totalItems}</span>
                )}
              </button>
              <button className="p-2 rounded-lg text-slate-300 hover:text-orange-400 hover:bg-slate-800 transition-colors" onClick={() => setOpen(!open)}>
                {open ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-dark-800/98 backdrop-blur-md border-t border-dark-300/40 animate-slide-up">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(({ label, path }) => (
                <Link key={path} to={path}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === path ? 'text-white bg-brand-800/60' : 'text-slate-400 hover:text-white hover:bg-dark-600/60'
                  }`}>
                  {label}<ChevronRight size={14} />
                </Link>
              ))}
              {session ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin/dashboard" className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-dark-600/60">
                      Dashboard<ChevronRight size={14} />
                    </Link>
                  ) : (
                    <Link to="/portal" className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-dark-600/60">
                      {profile?.full_name || session?.user?.email?.split('@')[0] || 'My Portal'}<ChevronRight size={14} />
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-dark-600/60">
                  Login<ChevronRight size={14} />
                </Link>
              )}
              <div className="pt-2">
                <Link to="/appointments" className="btn-accent w-full justify-center text-sm">Book Appointment</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
