import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public layout & components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';

// Public pages
import Home from './pages/Home';
import Services from './pages/Services';
import Products from './pages/Products';
import Appointments from './pages/Appointments';

// Customer pages
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerPortal from './pages/customer/CustomerPortal';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAppointments from './pages/admin/ManageAppointments';
import ManageServices from './pages/admin/ManageServices';
import ManageProducts from './pages/admin/ManageProducts';
import ManageTimeSlots from './pages/admin/ManageTimeSlots';
import ManageOrders from './pages/admin/ManageOrders';
import ManageReviews from './pages/admin/ManageReviews';
import ManageMechanics from './pages/admin/ManageMechanics';
import ManageChat from './pages/admin/ManageChat';
import { useAuth } from './context/AuthContext';

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

function RequireAuthHome({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a2035',
                color: '#f1f5f9',
                border: '1px solid #2c3554',
                borderRadius: '10px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#4ade80', secondary: '#0a0e1a' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#0a0e1a' } },
            }}
          />
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/" element={<RequireAuthHome><PublicLayout><Home /></PublicLayout></RequireAuthHome>} />
            <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
            <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
            <Route path="/appointments" element={<PublicLayout><Appointments /></PublicLayout>} />
            
            {/* ── Customer Auth routes ── */}
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/register" element={<CustomerRegister />} />
            <Route path="/portal" element={<PublicLayout><CustomerPortal /></PublicLayout>} />

            {/* ── Admin routes ── */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/appointments" element={<ProtectedRoute><AdminLayout><ManageAppointments /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute><AdminLayout><ManageServices /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute><AdminLayout><ManageProducts /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/timeslots" element={<ProtectedRoute><AdminLayout><ManageTimeSlots /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute><AdminLayout><ManageOrders /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute><AdminLayout><ManageReviews /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/mechanics" element={<ProtectedRoute><AdminLayout><ManageMechanics /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/chat" element={<ProtectedRoute><AdminLayout><ManageChat /></AdminLayout></ProtectedRoute>} />

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
