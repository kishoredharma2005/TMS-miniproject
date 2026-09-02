import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { userService, departmentService, programmeService } from '../services/api';
import './MasterScreen.css';

const UserPage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [, setDepartments] = useState([]);
  const [, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'User',
    department: '',
    programme: ''
  });
  const [editingId, setEditingId] = useState(null);

  const roles = ['SuperAdmin', 'User', 'Networking Staff', 'Plumber', 'Electrician', 'Software Developer', 'Application', 'PC Hardware'];

  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, deptRes, progRes] = await Promise.all([
        userService.getAll(),
        departmentService.getAll(),
        programmeService.getAll()
      ]);
      setUsers(userRes.data);
      setDepartments(deptRes.data);
      setProgrammes(progRes.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      if (!editingId) {
        if (!submitData.password) {
          setError('Password is required for new users');
          return;
        }
      } else {
        if (!submitData.password) {
          delete submitData.password;
        }
      }

      // Remove department/programme from payload when not used
      if (submitData.department === '') delete submitData.department;
      if (submitData.programme === '') delete submitData.programme;

      if (editingId) {
        await userService.update(editingId, submitData);
      } else {
        await userService.create(submitData);
      }
      setFormData({
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'User',
        department: '',
        programme: ''
      });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleEdit = (userData) => {
    setFormData({
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      password: '',
      role: userData.role,
      department: userData.department?._id || userData.department || '',
      programme: userData.programme?._id || userData.programme || ''
    });
    setEditingId(userData._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await userService.delete(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  if (loading) return <div className="master-screen"><p>Loading...</p></div>;

  return (
    <div className="master-screen">
      <div className="screen-header">
        <div>
          <h1>User Management</h1>
          <p className="hero-subtitle">Manage system users and access levels</p>
        </div>

        {user?.role === 'SuperAdmin' && (
          <button onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setFormData({
                username: '',
                email: '',
                phone: '',
                password: '',
                role: 'User',
                department: '',
                programme: ''
              });
              setEditingId(null);
            }
          }} className={showForm ? "btn-secondary" : "btn-primary"}>
            {showForm ? 'Cancel' : 'Add User'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && user?.role === 'SuperAdmin' && (
        <div className="glass-panel" style={{ marginBottom: 'var(--space-4)' }}>
          <form onSubmit={handleSubmit} className="master-form">
            <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--text-main)' }}>
              {editingId ? 'Edit User' : 'Create New User'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  placeholder="e.g., johndoe"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="e.g., john@example.com"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="e.g., +1234567890"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Password {editingId && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(leave empty to keep current)</span>}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingId}
                  placeholder={editingId ? "********" : "Enter new password"}
                />
              </div>
            </div>

            {/* Department and Programme fields removed as not required */}

            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <button type="submit" className="btn-primary">
                {editingId ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="master-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Department</th>
                {user?.role === 'SuperAdmin' && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-muted)' }}>No users found.</td>
                </tr>
              )}
              {users.map((userData) => (
                <tr key={userData._id}>
                  <td style={{ fontWeight: '500', color: 'var(--text-main)' }}>{userData.username}</td>
                  <td>{userData.email}</td>
                  <td>{userData.phone}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: userData.role === 'SuperAdmin' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.05)',
                      color: userData.role === 'SuperAdmin' ? 'var(--accent-teal)' : 'var(--text-muted)',
                      border: userData.role === 'SuperAdmin' ? '1px solid rgba(99, 102, 241, 0.2)' : 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                    }}>
                      {userData.role}
                    </span>
                  </td>
                  <td>{userData.department?.name || '-'}</td>
                  {user?.role === 'SuperAdmin' && (
                    <td>
                      <div className="actions-cell">
                        <button onClick={() => handleEdit(userData)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>Edit</button>
                        <button onClick={() => handleDelete(userData._id)} className="status-cancel" style={{ padding: '6px 12px', fontSize: '13px' }}>Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
