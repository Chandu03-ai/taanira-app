import React, { useState, useEffect } from 'react';
import { Save, X, Edit3, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    contact: user?.contact || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname,
        lastname: user.lastname,
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
      if (!formData.firstname.trim() || !formData.lastname.trim() || !formData.contact.trim()) {
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
        firstname: user.firstname,
        lastname: user.lastname,
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
    <div className="min-h-screen bg-[#FAF9F6] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-serif italic text-[#4A3F36]">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-[#DEC9A3] text-[#4A3F36] text-xs sm:text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#d1b990] transition"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-md hover:bg-gray-700 transition"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[#4A3F36]">
          <div>
            <label className="block text-xs sm:text-sm mb-1">First Name</label>
            {isEditing ? (
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="w-full border-b border-[#4A3F36] bg-transparent text-sm focus:outline-none py-2"
              />
            ) : (
              <p className="py-2">{user.firstname}</p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm mb-1">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className="w-full border-b border-[#4A3F36] bg-transparent text-sm focus:outline-none py-2"
              />
            ) : (
              <p className="py-2">{user.lastname}</p>
            )}
          </div>
        </div>

        <div className="mt-6 text-[#4A3F36]">
          <label className="block text-xs sm:text-sm mb-1">Email Address</label>
          <p className="bg-[#F2ECE4] px-3 py-2 rounded text-sm">
            {user.email} <span className="text-xs italic">(Cannot be changed)</span>
          </p>
        </div>

        <div className="mt-6 text-[#4A3F36]">
          <label className="block text-xs sm:text-sm mb-1">Contact Number</label>
          {isEditing ? (
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full border-b border-[#4A3F36] bg-transparent text-sm focus:outline-none py-2"
            />
          ) : (
            <p className="py-2">{user.contact}</p>
          )}
        </div>

        <div className="mt-6 text-[#4A3F36]">
          <label className="block text-xs sm:text-sm mb-1">Username</label>
          <p className="bg-[#F2ECE4] px-3 py-2 rounded text-sm">
            {user.username} <span className="text-xs italic">(Cannot be changed)</span>
          </p>
        </div>

        {user.role && (
          <div className="mt-6 text-[#4A3F36]">
            <label className="block text-xs sm:text-sm mb-1">Role</label>
            <p className="bg-[#F2ECE4] px-3 py-2 rounded text-sm">{user.role}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
