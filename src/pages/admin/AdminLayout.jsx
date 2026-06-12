import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Wrench, ShoppingBag, Clock,
  LogOut, Menu, ChevronRight, Wrench as WrenchIcon,
  Package, Star, MessageCircle, Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard',    path: '/admin/dashboard',    icon: LayoutDashboard },
  { label: 'Appointments', path: '/admin/appointments', icon: CalendarDays    },
  { label: 'Service Plans',path: '/admin/services',     icon: Wrench          },
  { label: 'Products',     path: '/admin/products',     icon: ShoppingBag     },
  { label: 'Orders',       path: '/admin/orders',       icon: Package         },
  { label: 'Time Slots',   path: '/admin/timeslots',    icon: Clock           },
  { label: 'Mechanics',    path: '/admin/mechanics',    icon: Users           },
  { label: 'Reviews',      path: '/admin/reviews',      icon: Star            },
  { label: 'Live Chat',    path: '/admin/chat',         icon: MessageCircle   },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const currentTitle = navItems.find((n) => n.path === pathname)?.label || 'Admin';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-dark-300/40">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-lg bg-accent-gradient">
            <WrenchIcon size={18} className="text-dark-900" />
          </div>
          <div>
            <span className="block text-white font-display font-bold">AutoGarage</span>
            <span className="block text-accent-orange text-[9px] font-bold tracking-[0.15em] uppercase">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active ? 'bg-brand-gradient text-white shadow-glow-blue' : 'text-slate-400 hover:text-white hover:bg-dark-600'
              }`}
            >
              <Icon size={17} />
              {label}
              {active && <ChevronRight size={13} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-dark-300/40">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-white hover:bg-red-600/20 transition-all"
        >
          <LogOut size={17} />
          Sign Out
        </button>
        <p className="text-slate-600 text-xs px-3 mt-3">Logged in as <span className="text-slate-400">admin</span></p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-dark-800 border-r border-dark-300/40 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-64 bg-dark-800 border-r border-dark-300/40 animate-slide-up">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="bg-dark-800/80 backdrop-blur-sm border-b border-dark-300/40 px-4 sm:px-6 h-14 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-600"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-white font-semibold text-sm">{currentTitle}</h1>
          </div>
          <Link to="/" className="text-slate-500 hover:text-white text-xs transition-colors">
            View Site →
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
