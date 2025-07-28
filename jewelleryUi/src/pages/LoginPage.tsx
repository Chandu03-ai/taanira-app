import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
        navigate(user?.role === 'Admin' ? '/admin' : '/');
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
    <div className="min-h-screen flex flex-col bg-subtle-beige font-serif">
      {/* Main Content */}
      <div className="flex-grow flex items-center mt-20 sm:mt-24 lg:mt-32 justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xs mt-20 sm:max-w-sm lg:max-w-md">
          <h2 className="text-3xl sm:text-4xl font-serif italic font-semibold text-rich-brown text-center mb-8 sm:mb-10">Login</h2>

          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm font-serif italic mb-4"> {/* Added mb-4 for extra space */}
                {error}
              </div>
            )}

            {/* Username Field (Email) */}
            <div className="relative">
              <motion.label
                htmlFor="username"
                className="absolute left-0 text-rich-brown text-sm sm:text-base font-serif italic font-light pointer-events-none origin-left top-8" // Adjusted top-8
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
                className="w-full bg-transparent border-b-2 border-rich-brown text-rich-brown placeholder-transparent focus:outline-none focus:border-soft-gold pt-8 pb-2 text-sm sm:text-base font-serif transition-all duration-200 ease-in-out" // Adjusted pt-8
                placeholder="Email"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <motion.label
                htmlFor="password"
                className="absolute left-0 text-rich-brown text-sm sm:text-base font-serif italic font-light pointer-events-none origin-left top-8" // Adjusted top-8
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
                className="w-full bg-transparent border-b-2 border-rich-brown text-rich-brown placeholder-transparent focus:outline-none focus:border-soft-gold pt-8 pb-2 text-sm sm:text-base font-serif transition-all duration-200 ease-in-out" // Adjusted pt-8
                placeholder="Password"
              />
              <div
                className="absolute right-0 top-9 sm:top-10 cursor-pointer text-rich-brown p-2 rounded-xl hover:bg-subtle-beige transition-all duration-200 ease-in-out" // Adjusted top-9/10 to align with new input padding
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />}
              </div>
            </div>

            <div className="text-right text-xs sm:text-sm uppercase tracking-widest text-rich-brown font-serif font-semibold italic mt-2">
              <Link to="/forgot-password">Forgot your password?</Link>
            </div>

            <div className="pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-between items-center"
              >
                <span>{loading ? 'Signing in...' : 'SIGN IN'}</span>
                <span className="text-base sm:text-lg">→</span>
              </button>
            </div>

            <div className="text-center mt-3 sm:mt-4 text-xs sm:text-sm uppercase tracking-widest text-rich-brown font-serif font-semibold italic">
              <Link to="/register">Create Account</Link>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Section (Subscribe message) */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 text-center mt-[120px] sm:mt-[120px] lg:mt-[120px] bg-subtle-beige">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif italic font-semibold text-rich-brown mb-4 sm:mb-6">{SITE_CONFIG.shortName}</h2>
          <p className="text-base sm:text-lg font-serif font-light italic text-rich-brown mb-4 sm:mb-6">
            Get exclusive updates on new collections and special offers.
          </p>
          <p className="text-xs sm:text-sm font-serif font-semibold italic text-mocha max-w-lg mx-auto leading-relaxed px-4">
            {SITE_CONFIG.name} may use your email address to send updates and offers.
            You can always unsubscribe from marketing messages. Learn more via our Privacy Policy.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-mocha/30 text-center text-xs text-rich-brown py-4 sm:py-6 px-4 bg-subtle-beige font-serif">
        <Footer />
      </footer>
    </div>
  );
};

export default LoginPage;