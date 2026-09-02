import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { departmentService } from '../services/api';
import './MasterScreen.css';

const DepartmentPage = () => {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', shortName: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchDepartments();
    }
  }, [user]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getAll();
      setDepartments(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // client-side validation for shortName length (2-8 chars)
    const shortLen = (formData.shortName || '').trim().length;
    if (shortLen < 2 || shortLen > 8) {
      setError('Short Name must be between 2 and 8 characters');
      return;
    }

    try {
      if (editingId) {
        await departmentService.update(editingId, formData);
      } else {
        await departmentService.create(formData);
      }
      setFormData({ name: '', shortName: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      fetchDepartments();
    } catch (err) {
      setError('Failed to save department');
    }
  };

  const handleEdit = (department) => {
    setFormData(department);
    setEditingId(department._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await departmentService.delete(id);
        fetchDepartments();
      } catch (err) {
        setError('Failed to delete department');
      }
    }
  };

  if (loading) return <div className="master-screen"><p>Loading...</p></div>;

  return (
    <div className="master-screen">
      <div className="screen-header">
        <div>
          <h1>Department Management</h1>
          <p className="hero-subtitle">Manage campus departments</p>
        </div>

        {user?.role === 'SuperAdmin' && (
          <button onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setFormData({ name: '', shortName: '', description: '' });
              setEditingId(null);
            }
          }} className={showForm ? "btn-secondary" : "btn-primary"}>
            {showForm ? 'Cancel' : 'Add Department'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && user?.role === 'SuperAdmin' && (
        <div className="glass-panel" style={{ marginBottom: 'var(--space-4)' }}>
          <form onSubmit={handleSubmit} className="master-form">
            <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--text-main)' }}>
              {editingId ? 'Edit Department' : 'Create New Department'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label>Department Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div className="form-group">
                <label>Short Name</label>
                <input
                  type="text"
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  required
                  minLength="2"
                  maxLength="8"
                  placeholder="e.g. CS (2-8 chars)"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                placeholder="Optional description"
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <button type="submit" className="btn-primary">
                {editingId ? 'Save Changes' : 'Create Department'}
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
                <th>Department Name</th>
                <th>Short Name</th>
                <th>Description</th>
                {user?.role === 'SuperAdmin' && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-muted)' }}>No departments found.</td>
                </tr>
              )}
              {departments.map((dept) => (
                <tr key={dept._id}>
                  <td style={{ fontWeight: '500', color: 'var(--text-main)' }}>{dept.name}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      letterSpacing: '0.5px'
                    }}>
                      {dept.shortName}
                    </span>
                  </td>
                  <td>{dept.description || '-'}</td>
                  {user?.role === 'SuperAdmin' && (
                    <td>
                      <div className="actions-cell">
                        <button onClick={() => handleEdit(dept)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>Edit</button>
                        <button onClick={() => handleDelete(dept._id)} className="status-cancel" style={{ padding: '6px 12px', fontSize: '13px' }}>Delete</button>
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

export default DepartmentPage;
