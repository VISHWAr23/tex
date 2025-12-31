import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../api/usersAPI';

const MyProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit form states
  const [editData, setEditData] = useState({ name: '', email: '' });

  // Password form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user profile on mount
  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getCurrentUser();
      setProfileData(response.data);
      setEditData({ name: response.data.name, email: response.data.email });
      setError('');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch profile';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      const response = await usersAPI.updateUser(user.id, editData);
      setProfileData(response.data);
      setSuccessMsg('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      setError(message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validate password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await usersAPI.changePassword(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccessMsg('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password';
      setError(message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
  const buttonClasses = "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition";
  const cancelButtonClasses = "px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>

          {/* Messages */}
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              {successMsg}
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow">
            {/* Profile Information */}
            {!isEditing && profileData && (
              <div className="space-y-6">
                <div>
                  <label className="text-gray-500 text-sm">Name</label>
                  <p className="text-lg font-semibold">{profileData.name}</p>
                </div>

                <div>
                  <label className="text-gray-500 text-sm">Email</label>
                  <p className="text-lg font-semibold">{profileData.email}</p>
                </div>

                <div>
                  <label className="text-gray-500 text-sm">Role</label>
                  <p className="text-lg font-semibold capitalize">{profileData.role}</p>
                </div>

                <div>
                  <label className="text-gray-500 text-sm">Member Since</label>
                  <p className="text-lg font-semibold">{new Date(profileData.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className={buttonClasses}
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className={buttonClasses}
                  >
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {/* Edit Profile Form */}
            {isEditing && (
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className={inputClasses}
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className={buttonClasses}>
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({ name: profileData.name, email: profileData.email });
                    }}
                    className={cancelButtonClasses}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Change Password Form */}
            {isChangingPassword && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6 border-t pt-8">
                <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className={inputClasses}
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className={buttonClasses}>
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className={cancelButtonClasses}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
  );
};

export default MyProfile;