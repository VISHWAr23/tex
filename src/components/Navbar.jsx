import { useAuth } from '../context/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAdmin, isWorker } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/daily-work', label: 'Daily Work' },
    { path: '/admin/attendance', label: 'Attendance' },
    { path: '/admin/workers', label: 'Workers' },
    { path: '/admin/exports', label: 'Exports' },
    { path: '/admin/finance', label: 'Finance' },
    { path: '/admin/financial-analytics', label: 'Analytics' },
    { path: '/admin/home-expenses', label: 'Home Expenses' },
    { path: '/admin/reports', label: 'Reports' },
  ];

  const workerLinks = [
    { path: '/worker/my-profile', label: 'My Profile' },
    { path: '/worker/my-work', label: 'My Work' },
    { path: '/worker/my-salary', label: 'My Salary' },
  ];

  const links = isAdmin ? adminLinks : isWorker ? workerLinks : [];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 sticky top-0 z-40">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-surface-100 transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-surface-900">StitchHub</span>
          </div>

          {/* Date Display - Desktop */}
          <div className="hidden md:block">
            <span className="text-sm text-surface-500">{formatDate()}</span>
          </div>
        </div>

        {/* Right Side - User Info */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="p-2 hover:bg-surface-100 transition-colors relative">
            <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-rose"></span>
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-surface-200"></div>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-2 py-1.5 hover:bg-surface-100 transition-colors"
            >
              <div className="w-8 h-8 bg-surface-900 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-surface-900">{user?.name || 'User'}</p>
                <p className="text-xs text-surface-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              <svg
                className={`w-4 h-4 text-surface-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-surface-200 shadow-medium py-1 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-surface-100">
                    <p className="text-sm font-medium text-surface-900">{user?.name}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-accent-rose hover:bg-red-50 transition-colors flex items-center gap-3"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-surface-950/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Sidebar */}
          <div className="absolute left-0 top-0 w-72 h-full bg-white shadow-strong overflow-y-auto animate-slide-left">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-surface-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-brand-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-bold text-surface-900">StitchHub</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 hover:bg-surface-100 transition-colors"
              >
                <svg className="w-5 h-5 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Info */}
            <div className="p-5 border-b border-surface-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-900 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium text-surface-900">{user?.name || 'User'}</p>
                  <p className="text-sm text-surface-500 capitalize">{user?.role?.toLowerCase()}</p>
                </div>
              </div>
            </div>

            {/* Navigation Label */}
            <div className="px-5 py-4">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Navigation
              </span>
            </div>

            {/* Navigation */}
            <nav className="px-3 space-y-0.5">
              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 border-l-2 border-brand-600'
                        : 'text-surface-600 hover:bg-surface-50'
                    }`
                  }
                >
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="p-4 mt-auto border-t border-surface-200">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface-900 text-white font-medium hover:bg-surface-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;