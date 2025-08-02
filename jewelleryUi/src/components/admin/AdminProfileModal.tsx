import React, { useState, useEffect } from 'react';
import { X, User, Mail, Crown, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ChangePasswordForm from '../user/ChangePasswordForm';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminProfileModal: React.FC<AdminProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const baseFocusClasses = "focus:outline-none focus:ring-0";

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-theme-primary/20 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8"
      onClick={handleBackdropClick}
    >
      <div className="bg-theme-light rounded-xl sm:rounded-2xl shadow-2xl border border-theme-surface w-full max-w-sm sm:max-w-md lg:max-w-2xl mx-4 sm:mx-6 max-h-[95vh] sm:max-h-[90vh] transform transition-all flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-theme-surface flex-shrink-0 bg-theme-surface">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-theme-accent rounded-lg">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-theme-primary" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-serif font-semibold italic text-theme-primary">
              Admin Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`text-theme-muted hover:text-theme-primary transition-all duration-200 ease-in-out p-2 sm:p-3 rounded-xl hover:bg-theme-surface ${baseFocusClasses}`}
            title="Close profile"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-theme-surface bg-theme-light flex-shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-serif font-semibold italic transition-all duration-200 ${baseFocusClasses} ${
              activeTab === 'profile'
                ? 'text-theme-primary border-b-2 border-theme-secondary bg-theme-accent/20'
                : 'text-theme-muted hover:text-theme-primary hover:bg-theme-surface'
            }`}
          >
            <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-serif font-semibold italic transition-all duration-200 ${baseFocusClasses} ${
              activeTab === 'password'
                ? 'text-theme-primary border-b-2 border-theme-secondary bg-theme-accent/20'
                : 'text-theme-muted hover:text-theme-primary hover:bg-theme-surface'
            }`}
          >
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Security
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 font-serif text-theme-primary overflow-y-auto flex-grow">
          {activeTab === 'profile' ? (
            <div className="space-y-6">
              {/* Admin Badge */}
              <div className="bg-gradient-to-r from-theme-secondary to-theme-accent rounded-xl p-4 sm:p-6 text-center">
                <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-theme-primary mx-auto mb-3" />
                <h3 className="text-lg sm:text-xl font-serif font-semibold italic text-theme-primary mb-2">
                  Administrator Access
                </h3>
                <p className="text-sm sm:text-base font-serif italic text-theme-primary/80">
                  You have full administrative privileges
                </p>
              </div>

              {/* Profile Information */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-theme-surface rounded-xl p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <User className="h-5 w-5 text-theme-primary" />
                    <h4 className="text-base sm:text-lg font-serif font-semibold italic text-theme-primary">
                      Account Information
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-serif italic text-theme-muted mb-1">
                        Username
                      </label>
                      <p className="text-sm sm:text-base font-serif text-theme-primary bg-theme-light px-3 py-2 rounded-lg border border-theme-surface">
                        {user.username}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-serif italic text-theme-muted mb-1">
                        Email Address
                      </label>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-theme-muted" />
                        <p className="text-sm sm:text-base font-serif text-theme-primary bg-theme-light px-3 py-2 rounded-lg border border-theme-surface flex-1">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-serif italic text-theme-muted mb-1">
                        Contact Number
                      </label>
                      <p className="text-sm sm:text-base font-serif text-theme-primary bg-theme-light px-3 py-2 rounded-lg border border-theme-surface">
                        {user.contact}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-serif italic text-theme-muted mb-1">
                        Role
                      </label>
                      <div className="flex items-center space-x-2">
                        <Crown className="h-4 w-4 text-theme-secondary" />
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-serif font-semibold italic bg-theme-secondary text-theme-primary">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-theme-primary mx-auto mb-3" />
                <h3 className="text-lg sm:text-xl font-serif font-semibold italic text-theme-primary mb-2">
                  Change Password
                </h3>
                <p className="text-sm sm:text-base font-serif italic text-theme-muted">
                  Update your admin account password
                </p>
              </div>
              <ChangePasswordForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfileModal;