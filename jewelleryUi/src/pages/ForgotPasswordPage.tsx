import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { passwordService } from '../services/passwordService';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, ] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await passwordService.resetPassword(email);

      if (response.code === 1009 || response.code === 1007) {
        navigate('/verify-reset', {
          state: {
            email,
            message: response.message, 
          },
        });
      } else {
        setError(response.message || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Failed to send reset email. Please try again.');
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
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-semibold italic text-rich-brown mb-2">
                Email Sent Successfully!
              </h2>
              <p className="text-rich-brown font-serif italic">
                We've sent a password reset code to <strong>{email}</strong>
              </p>
            </div>
            <p className="text-sm text-mocha font-serif italic mb-6">
              Please check your email and follow the instructions to reset your password.
            </p>
            <div className="text-xs text-mocha/70 font-serif italic">
              Redirecting to verification page...
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
            to="/login"
            className="inline-flex items-center text-rich-brown hover:text-mocha transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-serif italic">Back to Login</span>
          </Link>
          <h2 className="text-3xl sm:text-4xl font-serif italic font-semibold text-rich-brown">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-mocha font-serif italic">
            Enter your email address and we'll send you a code to reset your password.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm font-serif italic">
                {error}
              </div>
            )}

            <div className="relative">
              <motion.label
                htmlFor="email"
                className="absolute left-0 text-rich-brown text-sm sm:text-base font-serif italic font-light pointer-events-none origin-left top-8"
                animate={email ? 'active' : 'inactive'}
                variants={floatingLabelVariants}
              >
                Email Address
              </motion.label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b-2 border-rich-brown text-rich-brown placeholder-transparent focus:outline-none focus:ring-0 focus:border-soft-gold pt-8 pb-2 text-sm sm:text-base font-serif transition-all duration-200 ease-in-out"
                placeholder="Enter your email"
              />
              <Mail className="absolute right-0 top-8 h-5 w-5 text-rich-brown/60" />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-theme-secondary text-theme-primary px-6 py-3 rounded-xl font-serif font-semibold italic hover:bg-theme-accent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-0 flex justify-between items-center"
              >
                <span>{loading ? 'Sending...' : 'SEND RESET CODE'}</span>
                <span className="text-base sm:text-lg">→</span>
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-mocha font-serif italic">
              Remember your password?{' '}
              <Link to="/login" className="text-rich-brown hover:text-mocha font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;