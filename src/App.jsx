import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth
import Login from './pages/Auth/Login';

// Admin Pages
import Dashboard from './pages/Admin/Dashboard';
import Workers from './pages/Admin/Workers';
import Materials from './pages/Admin/Materials';
import Finance from './pages/Admin/Finance';
import HomeExpenses from './pages/Admin/HomeExpenses';
import Reports from './pages/Admin/Reports';

// Worker Pages
import MyProfile from './pages/Worker/MyProfile';
import MyWork from './pages/Worker/MyWork';
import MySalary from './pages/Worker/MySalary';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={
          user
            ? user.role === 'admin'
              ? <Navigate to="/admin/dashboard" replace />
              : user.role === 'worker'
                ? <Navigate to="/worker/my-profile" replace />
                : <Login />
            : <Login />
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/workers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Workers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/materials"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Materials />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/finance"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Finance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/home-expenses"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <HomeExpenses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Worker Routes */}
      <Route
        path="/worker/my-profile"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <MyProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/my-work"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <MyWork />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/my-salary"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <MySalary />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;