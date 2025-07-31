import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    contact: '',
    password: '',
    confirmPassword: '',
  });

  const [focusedField, setFocusedField] = useState<null | keyof typeof formData>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { register, loading, sendEmailConfirmation } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state
  const from = (location.state as any)?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { email, contact, password, confirmPassword } = formData;

    if (!email.trim() || !contact.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // 👇 Add username as email
    const { confirmPassword: _, ...rest } = formData;
    const registerData = {
      ...rest,
      username: email,
    };

    const success = await register(registerData);

    if (success) {
      // ✅ Send email without blocking navigation
      sendEmailConfirmation(email); // fire-and-forget

      const redirectTo = from === '/register' || from === '/login' ? '/' : from;
      navigate(redirectTo, { replace: true });
    } else {
      setError('Registration failed. Please try again.');
    }
  };



  const floatingLabelVariants = {
    active: { y: -28, scale: 0.8, transition: { duration: 0.2 } },
    inactive: { y: 0, scale: 1, transition: { duration: 0.2 } },
  };

  const renderInput = (
    name: keyof typeof formData,
    label: string,
    type: string = 'text'
  ) => (
    <div className="relative">
      <motion.label
        htmlFor={name}
        className="absolute left-0 text-theme-primary text-sm sm:text-base italic font-light pointer-events-none origin-left top-8 sm:top-9"
        animate={focusedField === name || formData[name] ? 'active' : 'inactive'}
        variants={floatingLabelVariants}
      >
        {label}
      </motion.label>
      <input
        id={name}
        name={name}
        type={type}
        required
        minLength={name === 'contact' ? 10 : undefined}
        maxLength={name === 'contact' ? 10 : undefined}
        value={formData[name]}
        onChange={(e) => {
          const value = e.target.value;
          if (name === 'contact') {
            if (/^\d{0,10}$/.test(value)) {
              handleChange(e);
            }
          } else {
            handleChange(e);
          }
        }}
        onFocus={() => setFocusedField(name)}
        onBlur={() => setFocusedField(null)}
        inputMode={name === 'contact' ? 'numeric' : undefined}
        className="w-full bg-transparent border-b-2 border-theme-primary text-theme-primary placeholder-transparent focus:outline-none focus:ring-0 focus:border-theme-secondary pt-8 sm:pt-10 pb-2 sm:pb-3 text-sm sm:text-base font-serif transition-all duration-200 ease-in-out"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-theme-background flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-theme-primary mb-2">
            Create Account
          </h2>
          <p className="text-sm sm:text-base text-theme-muted font-serif italic">
            Join our jewelry community
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-theme-surface p-6 sm:p-8 lg:p-10">
          <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm sm:text-base font-serif italic">
              {error}
            </div>
          )}

          {renderInput('email', 'Email', 'email')}
          {renderInput('contact', 'Contact (+91)', 'tel')}

          <div className="relative">
            <motion.label
              htmlFor="password"
              className="absolute left-0 text-theme-primary text-sm sm:text-base italic font-light pointer-events-none origin-left top-8 sm:top-9"
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
              className="w-full bg-transparent border-b-2 border-theme-primary text-theme-primary placeholder-transparent focus:outline-none focus:ring-0 focus:border-theme-secondary pt-8 sm:pt-10 pb-2 sm:pb-3 text-sm sm:text-base font-serif transition-all duration-200 ease-in-out"
              placeholder="Password"
            />
            <div
              className="absolute right-0 top-8 sm:top-9 cursor-pointer text-theme-primary p-2 hover:bg-theme-surface rounded-lg transition-colors focus:outline-none focus:ring-0"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
          </div>

          {renderInput('confirmPassword', 'Confirm Password', 'password')}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-theme-secondary text-theme-primary text-sm sm:text-base font-semibold py-3 sm:py-4 rounded-xl flex justify-between items-center px-6 tracking-wider hover:bg-theme-accent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-0"
            >
              <span>{loading ? 'Creating...' : 'CREATE ACCOUNT'}</span>
              <span className="text-lg sm:text-xl">→</span>
            </button>
          </div>

          <div className="text-center mt-4 sm:mt-6">
            <Link 
              to="/login" 
              className="text-xs sm:text-sm uppercase tracking-widest text-theme-primary font-serif font-semibold italic hover:text-theme-muted transition-colors focus:outline-none focus:ring-0"
            >
              Back to Login
            </Link>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;