import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { SITE_CONFIG } from '../constants/siteConfig';
import Footer from '../components/common/Footer';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);

  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const baseFocusClasses = "focus:outline-none focus:ring-0";

  // Get the intended destination from location state
  const from = (location.state as any)?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const res = await login(formData);
      if (res.success) {
        const { user } = useAuthStore.getState();
        
        // Determine redirect destination
        let redirectTo = from;
        
        // If user is admin and trying to access a non-admin route, redirect to admin
        if (user?.role === 'Admin' && !from.startsWith('/admin')) {
          redirectTo = '/admin';
        }
        // If user is regular user trying to access admin route, redirect to home
        else if (user?.role !== 'Admin' && from.startsWith('/admin')) {
          redirectTo = '/';
        }
        // If coming from login page itself, redirect based on role
        else if (from === '/login') {
          redirectTo = user?.role === 'Admin' ? '/admin' : '/';
        }
        
        navigate(redirectTo, { replace: true });
      } else {
        if (res.reason === 'INVALID_CREDENTIALS') {
          setError('Invalid username or password');
        } else {
          setError('Login failed. Please try again.');
        }

        (async () => {
          // await sendEmailConfirmation(email);
        })();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    }
  };

  const floatingLabelVariants = {
    active: { y: -28, scale: 0.8, transition: { duration: 0.2 } }, // Adjusted from -24
    inactive: { y: 0, scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-theme-background font-serif">
      {/* Main Content */}
      <div className="flex-grow flex items-center sm:mt-24 lg:mt-5 justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
          <h2 className="text-3xl sm:text-4xl font-serif italic font-semibold text-theme-primary text-center mb-8 sm:mb-10">Login</h2>

          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm font-serif italic mb-4">
                {error}
              </div>
            )}

            {/* Username Field (Email) */}
            <div className="relative">
              <motion.label
                htmlFor="username"
                className="absolute left-0 text-theme-primary text-sm sm:text-base font-serif italic font-light pointer-events-none origin-left top-8"
                animate={focusedField === 'username' || formData.username ? 'active' : 'inactive'}
                variants={floatingLabelVariants}
              >
                Email Or Username
              </motion.label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                // Crucial: Increased pt (padding-top) for space
                className="w-full bg-transparent border-b-2 border-theme-primary text-theme-primary placeholder-transparent focus:outline-none focus:ring-0 focus:border-theme-secondary pt-8 pb-2 text-sm sm:text-base font-serif transition-all duration-200 ease-in-out"
                placeholder="Email"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <motion.label
                htmlFor="password"
                className="absolute left-0 text-theme-primary text-sm sm:text-base font-serif italic font-light pointer-events-none origin-left top-8"
                animate={focusedField === 'password' || formData.password ? 'active' : 'inactive'}
                variants={floatingLabelVariants}
              >
                Password
              </motion.label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                // Crucial: Increased pt (padding-top) for space
                className="w-full bg-transparent border-b-2 border-theme-primary text-theme-primary placeholder-transparent focus:outline-none focus:ring-0 focus:border-theme-secondary pt-8 pb-2 text-sm sm:text-base font-serif transition-all duration-200 ease-in-out"
                placeholder="Password"
              />
              <div
                className={`absolute right-0 top-9 sm:top-10 cursor-pointer text-theme-primary p-2 rounded-xl hover:bg-theme-surface transition-all duration-200 ease-in-out ${baseFocusClasses}`}
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />}
              </div>
            </div>

            <div className="text-right text-xs sm:text-sm uppercase tracking-widest text-theme-primary font-serif font-semibold italic mt-2">
              <Link to="/forgot-password" className="hover:text-theme-muted transition-colors focus:outline-none focus:ring-0">Forgot your password?</Link>
            </div>

            <div className="pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-theme-secondary text-theme-primary px-6 py-3 rounded-xl font-serif font-semibold italic hover:bg-theme-accent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-0 flex justify-between items-center"
              >
                <span>{loading ? 'Signing in...' : 'SIGN IN'}</span>
                <span className="text-base sm:text-lg">→</span>
              </button>
            </div>

            <div className="text-center mt-3 sm:mt-4 text-xs sm:text-sm uppercase tracking-widest text-theme-primary font-serif font-semibold italic">
              <Link to="/register" className="focus:outline-none focus:ring-0">Create Account</Link>
            </div>
          </form>
        </div>
      </div>


    </div>
  );
};

export default LoginPage;