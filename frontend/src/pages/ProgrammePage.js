import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { programmeService, departmentService } from '../services/api';
import './MasterScreen.css';

const ProgrammePage = () => {
  const { user } = useContext(AuthContext);
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', shortName: '', department: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [progRes, deptRes] = await Promise.all([
        programmeService.getAll(),
        departmentService.getAll()
      ]);
      setProgrammes(progRes.data);
      setDepartments(deptRes.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch data');
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
        await programmeService.update(editingId, formData);
      } else {
        await programmeService.create(formData);
      }
      setFormData({ name: '', shortName: '', department: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError('Failed to save programme');
    }
  };

  const handleEdit = (programme) => {
    setFormData(programme);
    setEditingId(programme._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await programmeService.delete(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete programme');
      }
    }
  };

  if (loading) return <div className="master-screen"><p>Loading...</p></div>;

  return (
    <div className="master-screen">
      <div className="screen-header">
        <div>
          <h1>Programme Management</h1>
          <p className="hero-subtitle">Manage academic programmes</p>
        </div>

        {user?.role === 'SuperAdmin' && (
          <button onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setFormData({ name: '', shortName: '', department: '', description: '' });
              setEditingId(null);
            }
          }} className={showForm ? "btn-secondary" : "btn-primary"}>
            {showForm ? 'Cancel' : 'Add Programme'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && user?.role === 'SuperAdmin' && (
        <div className="glass-panel" style={{ marginBottom: 'var(--space-4)' }}>
          <form onSubmit={handleSubmit} className="master-form">
            <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--text-main)' }}>
              {editingId ? 'Edit Programme' : 'Create New Programme'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label>Programme Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Bachelor of Science"
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
                  placeholder="e.g. BSc (2-8 chars)"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
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
                {editingId ? 'Save Changes' : 'Create Programme'}
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
                <th>Programme Name</th>
                <th>Short Name</th>
                <th>Department</th>
                <th>Description</th>
                {user?.role === 'SuperAdmin' && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {programmes.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-muted)' }}>No programmes found.</td>
                </tr>
              )}
              {programmes.map((prog) => (
                <tr key={prog._id}>
                  <td style={{ fontWeight: '500', color: 'var(--text-main)' }}>{prog.name}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      letterSpacing: '0.5px'
                    }}>
                      {prog.shortName}
                    </span>
                  </td>
                  <td>{prog.department?.name || '-'}</td>
                  <td>{prog.description || '-'}</td>
                  {user?.role === 'SuperAdmin' && (
                    <td>
                      <div className="actions-cell">
                        <button onClick={() => handleEdit(prog)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>Edit</button>
                        <button onClick={() => handleDelete(prog._id)} className="status-cancel" style={{ padding: '6px 12px', fontSize: '13px' }}>Delete</button>
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

export default ProgrammePage;
