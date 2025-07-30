import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { passwordService } from '../services/passwordService';

const VerifyResetPage: React.FC = () => {
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const message = location.state?.message || ''; // 👈 get message

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.token.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (!formData.newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await passwordService.updatePassword({
        email,
        token: formData.token,
        newPassword: formData.newPassword,
      });

      if (response.code === 2000 || response.success) {
        setSuccess(true);
        // Navigate to login after 3 seconds
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Password reset successfully! Please log in with your new password.'
            }
          });
        }, 3000);
      } else {
        setError(response.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Update password error:', error);
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const floatingLabelVariants = {
    active: { y: -28, scale: 0.8, transition: { duration: 0.2 } },
    inactive: { y: 0, scale: 1, transition: { duration: 0.2 } },
  };

  if (success) {
    return (
      <div className="min-h-screen bg-subtle-beige flex items-center justify-center px-4 sm:px-6 lg:px-8 font-serif">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-semibold italic text-rich-brown mb-2">
              Password Reset Successfully!
            </h2>
            <p className="text-rich-brown font-serif italic mb-6">
              Your password has been updated. You can now log in with your new password.
            </p>
            <div className="text-xs text-mocha/70 font-serif italic">
              Redirecting to login page...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-subtle-beige flex items-center justify-center px-4 sm:px-6 lg:px-8 font-serif">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            to="/forgot-password"
            className="inline-flex items-center text-rich-brown hover:text-mocha transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-serif italic">Back</span>
          </Link>
          <h2 className="text-3xl sm:text-4xl font-serif italic font-semibold text-rich-brown">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-mocha font-serif italic">
            Enter the verification code sent to <strong>{email}</strong> and your new password.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm font-serif italic mb-6">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm font-serif italic">
                {error}
              </div>
            )}

            {/* Verification Code */}
            <div className="relative">
              <motion.label
                htmlFor="token"
                className="absolute left-0 text-rich-brown text-sm sm:text-base font-serif italic font-light pointer-events-none origin-left top-8"
                animate={focusedField === 'token' || formData.token ? 'active' : 'inactive'}
                variants={floatingLabelVariants}
              >
                Verification Code
              </motion.label>
              <input
                id="token"
                name="token"
                type="text"
                required
                value={formData.token}
                onChange={handleChange}
                onFocus={() => setFocusedField('token')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-transparent border-b-2 border-rich-brown text-rich-brown placeholder-transparent focus:outline-none focus:ring-0 focus:border-soft-gold pt-8 pb-2 text-sm sm:text-base font-serif transition-all duration-200 ease-in-out"
                placeholder="Enter verification code"
              />
            </div>

            {/* New Password */}
            <div className="relative">
              <motion.label
                htmlFor="newPassword"
                className="absolute left-0 text-rich-brown text-sm sm:text-base font-serif italic font-light pointer-events-none origin-left top-8"
                animate={focusedField === 'newPassword' || formData.newPassword ? 'active' : 'inactive'}
                variants={floatingLabelVariants}
              >
                New Password
              </motion.label>
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.newPassword}
                onChange={handleChange}
                onFocus={() => setFocusedField('newPassword')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-transparent border-b-2 border-rich-brown text-rich-brown placeholder-transparent focus:outline-none focus:ring-0 focus:border-soft-gold pt-8 pb-2 text-sm sm:text-base font-serif transition-all duration-200 ease-in-out"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-9 sm:top-10 text-rich-brown p-2 rounded-xl hover:bg-subtle-beige transition-all duration-200 ease-in-out"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <motion.label
                htmlFor="confirmPassword"
                className="absolute left-0 text-rich-brown text-sm sm:text-base font-serif italic font-light pointer-events-none origin-left top-8"
                animate={focusedField === 'confirmPassword' || formData.confirmPassword ? 'active' : 'inactive'}
                variants={floatingLabelVariants}
              >
                Confirm New Password
              </motion.label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-transparent border-b-2 border-rich-brown text-rich-brown placeholder-transparent focus:outline-none focus:ring-0 focus:border-soft-gold pt-8 pb-2 text-sm sm:text-base font-serif transition-all duration-200 ease-in-out"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 top-9 sm:top-10 text-rich-brown p-2 rounded-xl hover:bg-subtle-beige transition-all duration-200 ease-in-out"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-theme-secondary text-theme-primary px-6 py-3 rounded-xl font-serif font-semibold italic hover:bg-theme-accent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-0 flex justify-between items-center"
              >
                <span>{loading ? 'Resetting...' : 'RESET PASSWORD'}</span>
                <span className="text-base sm:text-lg">→</span>
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-mocha font-serif italic">
              Didn't receive the code?{' '}
              <Link to="/forgot-password" className="text-rich-brown hover:text-mocha font-semibold">
                Send again
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetPage;