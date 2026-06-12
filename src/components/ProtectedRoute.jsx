import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protects admin routes
export default function ProtectedRoute({ children }) {
  const { session, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}
