import { useAuth } from '../context/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAdmin, isWorker } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">📍 StitchHub</h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {isAdmin && (
                <>
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md transition ${
                        isActive ? 'bg-blue-700' : 'hover:bg-blue-500'
                      }`
                    }
                  >
                    📊 Dashboard
                  </NavLink>
                  <NavLink
                    to="/admin/workers"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md transition ${
                        isActive ? 'bg-blue-700' : 'hover:bg-blue-500'
                      }`
                    }
                  >
                    👥 Workers
                  </NavLink>
                  <NavLink
                    to="/admin/work-history"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md transition ${
                        isActive ? 'bg-blue-700' : 'hover:bg-blue-500'
                      }`
                    }
                  >
                    📋 Work History
                  </NavLink>
                  <NavLink
                    to="/admin/attendance"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md transition ${
                        isActive ? 'bg-blue-700' : 'hover:bg-blue-500'
                      }`
                    }
                  >
                    ✓ Attendance
                  </NavLink>
                  <NavLink
                    to="/admin/materials"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md transition ${
                        isActive ? 'bg-blue-700' : 'hover:bg-blue-500'
                      }`
                    }
                  >
                    📦 Materials
                  </NavLink>
                  <NavLink
                    to="/admin/finance"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md transition ${
                        isActive ? 'bg-blue-700' : 'hover:bg-blue-500'
                      }`
                    }
                  >
                    💰 Finance
                  </NavLink>
                </>
              )}
              {isWorker && (
                <>
                  <NavLink
                    to="/worker/daily-work"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md transition ${
                        isActive ? 'bg-blue-700' : 'hover:bg-blue-500'
                      }`
                    }
                  >
                    📝 Daily Work
                  </NavLink>
                  <NavLink
                    to="/worker/work-history"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md transition ${
                        isActive ? 'bg-blue-700' : 'hover:bg-blue-500'
                      }`
                    }
                  >
                    📊 History
                  </NavLink>
                  <NavLink
                    to="/worker/attendance"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md transition ${
                        isActive ? 'bg-blue-700' : 'hover:bg-blue-500'
                      }`
                    }
                  >
                    ✓ Attendance
                  </NavLink>
                  <NavLink
                    to="/worker/my-profile"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md transition ${
                        isActive ? 'bg-blue-700' : 'hover:bg-blue-500'
                      }`
                    }
                  >
                    👤 Profile
                  </NavLink>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-md hover:bg-blue-500"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Open menu"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <span className="hidden sm:inline text-sm">
                👋 <span className="font-semibold">{user?.name || 'User'}</span>
              </span>
              <span className="hidden sm:inline text-xs bg-blue-700 px-2 py-1 rounded">
                {user?.role?.toUpperCase()}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate('/login', { replace: true });
                }}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute left-0 top-0 w-64 h-full bg-gray-800 text-white p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Menu</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-md hover:bg-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav className="space-y-2">
              {isAdmin && (
                <>
                  <NavLink
                    to="/admin/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded hover:bg-gray-700"
                  >
                    📊 Dashboard
                  </NavLink>
                  <NavLink
                    to="/admin/workers"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded hover:bg-gray-700"
                  >
                    👥 Workers
                  </NavLink>
                  <NavLink
                    to="/admin/work-history"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded hover:bg-gray-700"
                  >
                    📋 Work History
                  </NavLink>
                  <NavLink
                    to="/admin/attendance"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded hover:bg-gray-700"
                  >
                    ✓ Attendance
                  </NavLink>
                  <NavLink
                    to="/admin/materials"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded hover:bg-gray-700"
                  >
                    📦 Materials
                  </NavLink>
                  <NavLink
                    to="/admin/finance"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded hover:bg-gray-700"
                  >
                    💰 Finance
                  </NavLink>
                </>
              )}
              {isWorker && (
                <>
                  <NavLink
                    to="/worker/daily-work"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded hover:bg-gray-700"
                  >
                    📝 Daily Work
                  </NavLink>
                  <NavLink
                    to="/worker/work-history"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded hover:bg-gray-700"
                  >
                    📊 History
                  </NavLink>
                  <NavLink
                    to="/worker/attendance"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded hover:bg-gray-700"
                  >
                    ✓ Attendance
                  </NavLink>
                  <NavLink
                    to="/worker/my-profile"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded hover:bg-gray-700"
                  >
                    👤 Profile
                  </NavLink>
                </>
              )}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                  navigate('/login', { replace: true });
                }}
                className="w-full text-left px-4 py-3 rounded hover:bg-red-700 bg-red-600 mt-4"
              >
                Logout
              </button>
            </nav>
          </div>
          <div className="w-full h-full" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
};

export default Navbar;