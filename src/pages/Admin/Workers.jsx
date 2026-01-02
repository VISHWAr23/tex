import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../../api/usersAPI';

const Workers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState(null);

  // Form states for creating/editing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'WORKER',
    monthlySalary: '',
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAllUsers();
      setUsers(response.data);
      setError('');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch users';
      setError(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await usersAPI.getStatistics();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        monthlySalary: user.monthlySalary || '',
      });
    } else {
      setIsEditing(false);
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'WORKER',
        monthlySalary: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: '', email: '', password: '', role: 'WORKER', monthlySalary: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      if (isEditing) {
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          monthlySalary: formData.monthlySalary ? parseFloat(formData.monthlySalary) : null,
        };
        await usersAPI.updateUser(selectedUser.id, updateData);
        setSuccessMsg('User updated successfully');
      } else {
        // Create user
        if (!formData.password) {
          setError('Password is required for new users');
          return;
        }
        const createData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          monthlySalary: formData.monthlySalary ? parseFloat(formData.monthlySalary) : null,
        };
        await usersAPI.createUser(createData);
        setSuccessMsg('User created successfully');
      }
      handleCloseModal();
      fetchUsers();
      fetchStats();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Operation failed';
      setError(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        setError('');
        await usersAPI.deleteUser(userId);
        setSuccessMsg('User deleted successfully');
        fetchUsers();
        fetchStats();
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to delete user';
        setError(message);
      }
    }
  };

  const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
  const buttonClasses = "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition";
  const deleteButtonClasses = "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition";
  const editButtonClasses = "px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition text-sm";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
              <button onClick={() => handleOpenModal()} className={buttonClasses}>
                + Add New User
              </button>
            </div>

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

            {/* Statistics */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm font-semibold">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                </div>
                {stats.byRole.map((role) => (
                  <div key={role.role} className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-600 text-sm font-semibold capitalize">{role.role} Users</h3>
                    <p className="text-3xl font-bold text-green-600">{role.count}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {users.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Since</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr 
                        key={user.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/workers/${user.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'OWNER' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 flex" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenModal(user)}
                            className={editButtonClasses}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            className={deleteButtonClasses}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-gray-600">No users found</div>
              )}
          </div>
        </div>

      {/* Modal for Create/Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">
              {isEditing ? 'Edit User' : 'Add New User'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputClasses}
                  required
                />
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={inputClasses}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={inputClasses}
                >
                  <option value="WORKER">Worker</option>
                  <option value="OWNER">Owner</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Salary (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthlySalary}
                  onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                  className={inputClasses}
                  placeholder="Enter monthly salary"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className={buttonClasses + ' flex-1'}>
                  {isEditing ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
