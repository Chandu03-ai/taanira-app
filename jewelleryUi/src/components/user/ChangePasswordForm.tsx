import React, { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { passwordService } from '../../services/passwordService';
import { useNotificationStore } from '../../store/notificationStore';

const ChangePasswordForm: React.FC = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { addNotification } = useNotificationStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.oldPassword.trim()) {
      setError('Please enter your current password');
      return;
    }

    if (!formData.newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setLoading(true);
      const response = await passwordService.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      if (response.code === 2000 || response.success) {
        setSuccess(true);
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        
        addNotification({
          message: 'Password changed successfully!',
          type: 'success',
          duration: 5000,
        });

        // Reset success state after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.message || 'Failed to change password. Please try again.');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setError('Failed to change password. Please check your current password and try again.');
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
      <div className="bg-white rounded-2xl shadow-sm border border-subtle-beige p-6 sm:p-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-serif font-semibold italic text-rich-brown mb-2">
          Password Changed Successfully!
        </h3>
        <p className="text-mocha font-serif italic">
          Your password has been updated securely.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-subtle-beige p-6 sm:p-8">
      <div className="flex items-center mb-6">
        <Lock className="h-6 w-6 text-rich-brown mr-3" />
        <h3 className="text-xl font-serif font-semibold italic text-rich-brown">
          Change Password
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm font-serif italic">
            {error}
          </div>
        )}

        {/* Current Password */}
        <div className="relative">
          <motion.label
            htmlFor="oldPassword"
            className="absolute left-0 text-rich-brown text-sm sm:text-base font-serif italic font-light pointer-events-none origin-left top-8"
            animate={focusedField === 'oldPassword' || formData.oldPassword ? 'active' : 'inactive'}
            variants={floatingLabelVariants}
          >
            Current Password
          </motion.label>
          <input
            id="oldPassword"
            name="oldPassword"
            type={showPasswords.old ? 'text' : 'password'}
            required
            value={formData.oldPassword}
            onChange={handleChange}
            onFocus={() => setFocusedField('oldPassword')}
            onBlur={() => setFocusedField(null)}
            className="w-full bg-transparent border-b-2 border-rich-brown text-rich-brown placeholder-transparent focus:outline-none focus:ring-0 focus:border-soft-gold pt-8 pb-2 text-sm sm:text-base font-serif transition-all duration-200 ease-in-out"
            placeholder="Enter current password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('old')}
            className="absolute right-0 top-9 sm:top-10 text-rich-brown p-2 rounded-xl hover:bg-subtle-beige transition-all duration-200 ease-in-out"
          >
            {showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
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
            type={showPasswords.new ? 'text' : 'password'}
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
            onClick={() => togglePasswordVisibility('new')}
            className="absolute right-0 top-9 sm:top-10 text-rich-brown p-2 rounded-xl hover:bg-subtle-beige transition-all duration-200 ease-in-out"
          >
            {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Confirm New Password */}
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
            type={showPasswords.confirm ? 'text' : 'password'}
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
            onClick={() => togglePasswordVisibility('confirm')}
            className="absolute right-0 top-9 sm:top-10 text-rich-brown p-2 rounded-xl hover:bg-subtle-beige transition-all duration-200 ease-in-out"
          >
            {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Password Requirements */}
        <div className="bg-subtle-beige rounded-xl p-4">
          <h4 className="text-sm font-serif font-semibold italic text-rich-brown mb-2">
            Password Requirements:
          </h4>
          <ul className="text-xs font-serif italic text-mocha space-y-1">
            <li className={`flex items-center ${formData.newPassword.length >= 6 ? 'text-green-600' : ''}`}>
              <span className="mr-2">{formData.newPassword.length >= 6 ? '✓' : '•'}</span>
              At least 6 characters long
            </li>
            <li className={`flex items-center ${formData.newPassword !== formData.oldPassword && formData.newPassword ? 'text-green-600' : ''}`}>
              <span className="mr-2">{formData.newPassword !== formData.oldPassword && formData.newPassword ? '✓' : '•'}</span>
              Different from current password
            </li>
            <li className={`flex items-center ${formData.newPassword === formData.confirmPassword && formData.confirmPassword ? 'text-green-600' : ''}`}>
              <span className="mr-2">{formData.newPassword === formData.confirmPassword && formData.confirmPassword ? '✓' : '•'}</span>
              Passwords match
            </li>
          </ul>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-theme-secondary text-theme-primary px-6 py-3 rounded-xl font-serif font-semibold italic hover:bg-theme-accent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-0 flex justify-between items-center"
          >
            <span>{loading ? 'Changing Password...' : 'CHANGE PASSWORD'}</span>
            <span className="text-base sm:text-lg">→</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm;