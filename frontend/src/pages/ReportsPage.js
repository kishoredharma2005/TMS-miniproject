import React, { useContext, useEffect, useState } from 'react';
import { complaintService, departmentService, programmeService, userService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './MasterScreen.css';

const ReportsPage = () => {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ department: '', programme: '', complaintType: '', status: '', assignee: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'SuperAdmin') return;
    departmentService.getAll().then(r => setDepartments(r.data || [])).catch(() => { });
    programmeService.getAll().then(r => setProgrammes(r.data || [])).catch(() => { });
    userService.getAll().then(r => setUsers(r.data || [])).catch(() => { });
  }, [user]);

  const fetchReport = async () => {
    setError('');
    setLoading(true);
    try {
      const params = { ...filters };
      // remove empty
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const res = await complaintService.report(params);
      setResults(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!results.length) return;
    const headers = ['Date', 'Block', 'Room', 'Type', 'Remarks', 'Status', 'CreatedBy', 'Assignee'];
    const rows = results.map(r => [new Date(r.createdAt).toLocaleString(), r.blockName, r.roomNumber, r.complaintType, (r.remarks || '').replace(/\n/g, ' '), r.status, r.createdBy?.username || r.createdBy?.email || '', r.assignedTo?.username || r.assignedTo?.email || '']);
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${('' + cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'complaints_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (user?.role !== 'SuperAdmin') {
    return (
      <div className="master-screen">
        <div className="glass-panel" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <h2 style={{ color: 'var(--text-main)', marginBottom: 'var(--space-2)' }}>Access Denied</h2>
          <p style={{ color: 'var(--status-danger)' }}>Only SuperAdmin can generate reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="master-screen">
      <div className="screen-header">
        <div>
          <h1>Complaint Details Report</h1>
          <p className="hero-subtitle">Generate and export system complaint reports</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="glass-panel" style={{ marginBottom: 'var(--space-4)' }}>
        <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--text-main)' }}>Report Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Department</label>
            <select value={filters.department} onChange={e => setFilters({ ...filters, department: e.target.value })}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Programme</label>
            <select value={filters.programme} onChange={e => setFilters({ ...filters, programme: e.target.value })}>
              <option value="">All Programmes</option>
              {programmes.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Complaint Type</label>
            <input placeholder="e.g. Electrical" value={filters.complaintType} onChange={e => setFilters({ ...filters, complaintType: e.target.value })} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Status</label>
            <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Onhold">Onhold</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Assignee</label>
            <select value={filters.assignee} onChange={e => setFilters({ ...filters, assignee: e.target.value })}>
              <option value="">Any Assignee</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.username} ({u.role})</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
          <button onClick={fetchReport} className="btn-primary" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          <button onClick={exportCSV} className="btn-secondary" disabled={!results.length || loading}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="master-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Dept</th>
                <th>Programme</th>
                <th>Block</th>
                <th>Room</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Assignee</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-muted)' }}>Loading report data...</td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-muted)' }}>
                    No results found. Adjust filters and generate again.
                  </td>
                </tr>
              ) : (
                results.map(r => (
                  <tr key={r._id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>{r.createdBy?.department?.name || '-'}</td>
                    <td>{r.createdBy?.programme || '-'}</td>
                    <td>{r.blockName}</td>
                    <td>{r.roomNumber}</td>
                    <td>{r.complaintType}</td>
                    <td>
                      <span className={`status-badge status-${(r.status || '').toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.createdBy?.username || r.createdBy?.email}</td>
                    <td>{r.assignedTo?.username || r.assignedTo?.email || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
