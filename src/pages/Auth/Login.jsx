import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Ensure this path is correct
import axiosInstance from '../../api/axiosInstance'; // Ensure this path is correct

const Login = () => {
  // Toggle state between Login and Signup
  const [isSignup, setIsSignup] = useState(false);

  // Form States
  const [name, setName] = useState(''); // Only for Signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI States
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
        // --- SIGN UP LOGIC ---
        // 1. Call NestJS /auth/signup endpoint
        // Defaulting to WORKER role. To create an OWNER, change it in DB manually or add a dropdown.
        await axiosInstance.post('/auth/signup', {
          name,
          email,
          password,
        });

        setSuccessMsg('Account created successfully! Please login.');
        setIsSignup(false); // Switch back to login view
        setLoading(false);
      } else {
        // --- LOGIN LOGIC ---
        // 1. Call NestJS /auth/login endpoint
        const response = await axiosInstance.post('/auth/login', {
            email,
            password,
        });

                // 2. Extract token and user from backend response (be defensive)
                console.log('Login response:', response?.data);
                const resp = response?.data ?? {};
                const token = resp.access_token || resp.token || resp.accessToken || resp?.data?.access_token || resp?.data?.token;
                const userFromResp = resp.user || resp.data?.user || resp;

                // 3. Update Context with normalized values
                    // 3. Normalize user role to match app expectations and update Context
                    const rawRole = String(userFromResp?.role ?? '').toLowerCase();
                    let normalizedRole = rawRole;
                    if (rawRole === 'owner' || rawRole === 'owner_role' || rawRole === 'ownerrole') normalizedRole = 'admin';
                    if (rawRole === 'admin') normalizedRole = 'admin';
                    if (rawRole === 'worker') normalizedRole = 'worker';

                    const normalizedUser = { ...userFromResp, role: normalizedRole };
                    login(normalizedUser, token);

                    // 4. Navigate based on normalized role
                    if (normalizedRole === 'admin') {
                        setLoading(false);
                        navigate('/admin/dashboard', { replace: true });
                    } else if (normalizedRole === 'worker') {
                        setLoading(false);
                        navigate('/worker/my-profile', { replace: true });
                    } else {
                        // Fallback: navigate to login so user can re-authenticate
                        setLoading(false);
                        navigate('/login', { replace: true });
                    }
      }
      
    } catch (err) {
      console.error('Authentication error:', err);
      // Handle NestJS standard error response
      const message = err.response?.data?.message || 'An unexpected error occurred.';
      // If message is an array (validation errors), join them
      setError(Array.isArray(message) ? message.join(', ') : message);
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setSuccessMsg('');
  };

  // CSS Classes (Tailwind)
  const inputClasses = "w-full px-5 py-3 border border-gray-600 bg-gray-700 text-white rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200 placeholder-gray-400";
  const buttonClasses = "w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed transform hover:scale-[1.01]";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-2";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 font-sans">
        
        <div className="w-full max-w-md bg-gray-800 p-8 sm:p-10 rounded-3xl shadow-2xl border border-gray-700 backdrop-blur-sm">
            
            <div className="text-center mb-8">
                <svg className="w-12 h-12 mx-auto text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <h2 className="text-4xl font-extrabold mt-4 text-white tracking-tight">
                    {isSignup ? 'Create Account' : 'StitchHub Login'}
                </h2>
                <p className="mt-2 text-gray-400">
                    {isSignup ? 'Join the team as a Worker' : 'Access your role-based dashboard'}
                </p>
            </div>

            {/* Messages */}
            {error && (
                <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 shadow-md text-sm">
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="bg-green-900 bg-opacity-30 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-6 shadow-md text-sm">
                    {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Name Input - Only for Signup */}
                {isSignup && (
                    <div className="animate-fade-in-down">
                        <label htmlFor="name" className={labelClasses}>Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClasses}
                            placeholder="e.g. John Doe"
                            required={isSignup}
                        />
                    </div>
                )}

                {/* Email Input */}
                <div>
                    <label htmlFor="email" className={labelClasses}>Email Address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClasses}
                        placeholder="e.g. worker@stitchhub.com"
                        required
                    />
                </div>

                {/* Password Input */}
                <div>
                    <label htmlFor="password" className={labelClasses}>Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClasses}
                        placeholder="Enter your secret key"
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={buttonClasses}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        isSignup ? 'Sign Up' : 'Secure Login'
                    )}
                </button>
            </form>
            
            {/* Toggle Login/Signup */}
            <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                    {isSignup ? "Already have an account?" : "Don't have an account?"}
                    <button 
                        onClick={toggleMode}
                        className="ml-2 text-indigo-400 hover:text-indigo-300 font-medium focus:outline-none transition-colors"
                    >
                        {isSignup ? 'Login here' : 'Sign up here'}
                    </button>
                </p>
            </div>

        </div>
    </div>
  );
};

export default Login;