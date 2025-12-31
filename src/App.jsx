import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';

// Auth
import Login from './pages/Auth/Login';

// Admin Pages
import Dashboard from './pages/Admin/Dashboard';
import Workers from './pages/Admin/Workers';
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

      {/* Admin Routes with Layout */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin', 'OWNER']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/daily-work" element={<DailyWork />} />
        <Route path="/admin/attendance" element={<Attendance />} />
        <Route path="/admin/workers" element={<Workers />} />
        <Route path="/admin/finance" element={<Finance />} />
        <Route path="/admin/home-expenses" element={<HomeExpenses />} />
        <Route path="/admin/reports" element={<Reports />} />
      </Route>

      {/* Worker Routes with Layout */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['worker', 'WORKER']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/worker/my-profile" element={<MyProfile />} />
        <Route path="/worker/my-work" element={<MyWork />} />
        <Route path="/worker/my-salary" element={<MySalary />} />
      </Route>

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;