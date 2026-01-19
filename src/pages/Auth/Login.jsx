import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isSignup) {
        await axiosInstance.post('/auth/signup', { name, email, password });
        setSuccessMsg('Account created successfully! Please login.');
        setIsSignup(false);
        setLoading(false);
      } else {
        const response = await axiosInstance.post('/auth/login', { email, password });
        const resp = response?.data ?? {};
        const token = resp.access_token || resp.token || resp.accessToken || resp?.data?.access_token || resp?.data?.token;
        const userFromResp = resp.user || resp.data?.user || resp;

        const rawRole = String(userFromResp?.role ?? '').toLowerCase();
        let normalizedRole = rawRole;
        if (rawRole === 'owner' || rawRole === 'owner_role' || rawRole === 'ownerrole') normalizedRole = 'admin';
        if (rawRole === 'admin') normalizedRole = 'admin';
        if (rawRole === 'worker') normalizedRole = 'worker';

        const normalizedUser = { ...userFromResp, role: normalizedRole };
        login(normalizedUser, token);

        if (normalizedRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (normalizedRole === 'worker') {
          navigate('/worker/my-profile', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
        setLoading(false);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'An unexpected error occurred.';
      setError(Array.isArray(message) ? message.join(', ') : message);
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-brand-500 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-brand-500 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/logo&name.jpeg" 
              alt="RKV TEX Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>
          <p className="text-blue-200/80 text-sm">Workforce Management System</p>
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-blue-200/70 text-sm">
              {isSignup ? 'Get started with your account' : 'Sign in to continue'}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="animate-fade-in">
                <label htmlFor="name" className="block text-sm font-medium text-blue-100 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-blue-200/50 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 transition-all backdrop-blur-sm"
                  placeholder="John Doe"
                  required={isSignup}
                  style={{ borderRadius: '0.75rem' }}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-blue-200/50 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 transition-all backdrop-blur-sm"
                placeholder="you@company.com"
                required
                style={{ borderRadius: '0.75rem' }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-blue-200/50 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 transition-all backdrop-blur-sm"
                placeholder="••••••••"
                required
                style={{ borderRadius: '0.75rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold py-3.5 rounded-xl hover:from-brand-700 hover:to-brand-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 mt-6"
              style={{ borderRadius: '0.75rem' }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ borderRadius: '9999px' }}></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isSignup ? 'Create Account' : 'Sign In'}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-200/70 text-sm">
              {isSignup ? "Already have an account?" : "Don't have an account?"}
              <button 
                onClick={toggleMode}
                className="ml-2 text-brand-300 hover:text-brand-200 font-semibold focus:outline-none transition-colors"
              >
                {isSignup ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-200/50 text-xs mt-6">
          © 2026 StitchHub. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;