import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { roleService } from '../services/api';
import './MasterScreen.css';

const RolePage = () => {
  const { user } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchRoles();
    }
  }, [user]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleService.getAll();
      setRoles(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const permissions = formData.permissions
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p);

      const data = { ...formData, permissions };

      if (editingId) {
        await roleService.update(editingId, data);
      } else {
        await roleService.create(data);
      }
      setFormData({ name: '', description: '', permissions: '' });
      setEditingId(null);
      setShowForm(false);
      fetchRoles();
    } catch (err) {
      setError('Failed to save role');
    }
  };

  const handleEdit = (role) => {
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions?.join(', ') || ''
    });
    setEditingId(role._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await roleService.delete(id);
        fetchRoles();
      } catch (err) {
        setError('Failed to delete role');
      }
    }
  };

  if (loading) return <div className="master-screen"><p>Loading...</p></div>;

  return (
    <div className="master-screen">
      <div className="screen-header">
        <div>
          <h1>Role Management</h1>
          <p className="hero-subtitle">Manage system roles and permissions</p>
        </div>

        {user?.role === 'SuperAdmin' && (
          <button onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setFormData({ name: '', description: '', permissions: '' });
              setEditingId(null);
            }
          }} className={showForm ? "btn-secondary" : "btn-primary"}>
            {showForm ? 'Cancel' : 'Add Role'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && user?.role === 'SuperAdmin' && (
        <div className="glass-panel" style={{ marginBottom: 'var(--space-4)' }}>
          <form onSubmit={handleSubmit} className="master-form">
            <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--text-main)' }}>
              {editingId ? 'Edit Role' : 'Create New Role'}
            </h3>

            <div className="form-group">
              <label>Role Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Electrician"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                placeholder="Brief description of the role's responsibilities"
              ></textarea>
            </div>

            <div className="form-group">
              <label>Permissions (comma separated)</label>
              <textarea
                value={formData.permissions}
                onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                rows="3"
                placeholder="e.g., view_complaints, assign_tasks, approve_work"
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <button type="submit" className="btn-primary">
                {editingId ? 'Save Changes' : 'Create Role'}
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
                <th>Role Name</th>
                <th>Description</th>
                <th>Permissions</th>
                {user?.role === 'SuperAdmin' && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-muted)' }}>No roles found.</td>
                </tr>
              )}
              {roles.map((role) => (
                <tr key={role._id}>
                  <td style={{ fontWeight: '500', color: 'var(--text-main)' }}>{role.name}</td>
                  <td>{role.description || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(role.permissions || []).map((perm, idx) => (
                        <span key={idx} style={{
                          padding: '2px 8px',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '11px',
                          color: 'var(--text-muted)'
                        }}>
                          {perm}
                        </span>
                      ))}
                      {(!role.permissions || role.permissions.length === 0) && '-'}
                    </div>
                  </td>
                  {user?.role === 'SuperAdmin' && (
                    <td>
                      <div className="actions-cell">
                        <button onClick={() => handleEdit(role)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>Edit</button>
                        <button onClick={() => handleDelete(role._id)} className="status-cancel" style={{ padding: '6px 12px', fontSize: '13px' }}>Delete</button>
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

export default RolePage;
