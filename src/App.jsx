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
import DailyWork from './pages/Admin/DailyWork';
import Attendance from './pages/Admin/Attendance';

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
            ? user.role === 'admin' || user.role === 'OWNER'
              ? <Navigate to="/admin/dashboard" replace />
              : user.role === 'worker' || user.role === 'WORKER'
                ? <Navigate to="/worker/my-work" replace />
                : <Login />
            : <Login />
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin', 'OWNER']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/daily-work"
        element={
          <ProtectedRoute allowedRoles={['admin', 'OWNER']}>
            <DailyWork />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute allowedRoles={['admin', 'OWNER']}>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/workers"
        element={
          <ProtectedRoute allowedRoles={['admin', 'OWNER']}>
            <Workers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/materials"
        element={
          <ProtectedRoute allowedRoles={['admin', 'OWNER']}>
            <Materials />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/finance"
        element={
          <ProtectedRoute allowedRoles={['admin', 'OWNER']}>
            <Finance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/home-expenses"
        element={
          <ProtectedRoute allowedRoles={['admin', 'OWNER']}>
            <HomeExpenses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['admin', 'OWNER']}>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Worker Routes */}
      <Route
        path="/worker/my-profile"
        element={
          <ProtectedRoute allowedRoles={['worker', 'WORKER']}>
            <MyProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/my-work"
        element={
          <ProtectedRoute allowedRoles={['worker', 'WORKER']}>
            <MyWork />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/my-salary"
        element={
          <ProtectedRoute allowedRoles={['worker', 'WORKER']}>
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