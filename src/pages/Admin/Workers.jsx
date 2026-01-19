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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'WORKER',
    monthlySalary: '',
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Users Management</h1>
          <p className="page-subtitle">Manage workers and administrators</p>
        </div>
        <button onClick={() => handleOpenModal()} className="action-button">
          <svg className="action-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New User</span>
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success">
          {successMsg}
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="stat-label">Total Users</p>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
          {stats.byRole.map((role) => (
            <div key={role.role} className="stat-card">
              <p className="stat-label">{role.role} Users</p>
              <p className="stat-value">{role.count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Users Table */}
      <div className="table-container">
        {users.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Member Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  className="cursor-pointer"
                  onClick={() => navigate(`/workers/${user.id}`)}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-surface-200 flex items-center justify-center text-sm font-semibold text-surface-600">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-surface-900">{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${
                      user.role === 'OWNER' ? 'badge-primary' : 'badge-neutral'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="btn-ghost btn-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="btn-ghost btn-sm text-accent-rose hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="empty-state-title">No users found</p>
            <p className="empty-state-text">Get started by adding your first user</p>
            <button onClick={() => handleOpenModal()} className="btn-primary mt-4">
              Add User
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {isEditing ? 'Edit User' : 'Add New User'}
              </h2>
              <button onClick={handleCloseModal} className="btn-ghost btn-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="label">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                {!isEditing && (
                  <div className="form-group">
                    <label className="label">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="label">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="select"
                  >
                    <option value="WORKER">Worker</option>
                    <option value="OWNER">Owner</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Monthly Salary (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthlySalary}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                    className="input"
                    placeholder="Enter monthly salary"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="modal-btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="modal-btn-submit">
                  {isEditing ? 'Update User' : 'Create User'}
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
