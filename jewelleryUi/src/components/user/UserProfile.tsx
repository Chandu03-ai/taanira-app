import React, { useState, useEffect } from 'react';
import { Save, X, Edit3, User, Lock, UserCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ChangePasswordForm from './ChangePasswordForm';

const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [formData, setFormData] = useState({
    contact: user?.contact || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        contact: user.contact,
        email: user.email,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (!formData.contact.trim()) {
        alert('Please fill in all required fields');
        return;
      }
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        contact: user.contact,
        email: user.email,
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center text-[#4A3F36]">
          <User className="h-16 w-16 text-[#4A3F36] mx-auto mb-4" />
          <h2 className="text-2xl font-serif italic mb-2">Please Login</h2>
          <p className="text-sm font-light">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif italic text-[#4A3F36] mb-2">My Account</h1>
          <p className="text-[#8F6C43] font-serif italic">Manage your profile and security settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-subtle-beige mb-6">
          <div className="flex border-b border-subtle-beige">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center focus:outline-none px-6 py-4 text-sm font-serif font-semibold italic duration-200 ${
                activeTab === 'profile'
                  ? 'text-rich-brown border-b-2 border-soft-gold bg-rose-sand/20'
                  : 'text-mocha hover:text-rich-brown hover:bg-subtle-beige/50'
              }`}
            >
              <UserCircle className="h-5 w-5 mr-2" />
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 flex items-center justify-center focus:outline-none px-6 py-4 text-sm font-serif font-semibold italic duration-200 ${
                activeTab === 'password'
                  ? 'text-rich-brown border-b-2 border-soft-gold bg-rose-sand/20'
                  : 'text-mocha hover:text-rich-brown hover:bg-subtle-beige/50'
              }`}
            >
              <Lock className="h-5 w-5 mr-2" />
              Change Password
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-subtle-beige p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-semibold italic text-[#4A3F36]">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-[#DEC9A3] text-[#4A3F36] text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#d1b990] transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-green-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-700 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    <Save size={16} />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 bg-gray-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-700 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 text-[#4A3F36]">
              <label className="block text-xs sm:text-sm mb-1 font-serif italic">Email Address</label>
              <p className="bg-[#F2ECE4] px-4 py-3 rounded-xl text-sm font-serif">
                {user.email} <span className="text-xs italic">(Cannot be changed)</span>
              </p>
            </div>

            <div className="mt-6 text-[#4A3F36]">
              <label className="block text-xs sm:text-sm mb-1 font-serif italic">Contact Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                 className="w-full border-b-2 border-[#4A3F36] bg-transparent text-sm focus:outline-none focus:ring-0 focus:border-soft-gold py-2 font-serif transition-all duration-200 ease-in-out"
                />
              ) : (
                <p className="py-2 font-serif">{user.contact}</p>
              )}
            </div>


            {user.role && (
              <div className="mt-6 text-[#4A3F36]">
                <label className="block text-xs sm:text-sm mb-1 font-serif italic">Role</label>
                <p className="bg-[#F2ECE4] px-4 py-3 rounded-xl text-sm font-serif">{user.role}</p>
              </div>
            )}
          </div>
        ) : (
          <ChangePasswordForm />
        )}
      </div>
    </div>
  );
};

export default UserProfile;
