import React, { useEffect, useState, useContext } from 'react';
import { complaintService, userService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './MasterScreen.css';

const ComplaintsDashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, closed: 0 });
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignTarget, setAssignTarget] = useState({ complaintId: null, assignee: '' });
  const [statusTarget, setStatusTarget] = useState({ complaintId: null, status: '' });

  useEffect(() => {
    const load = async () => {
      try {
        setListLoading(true);
        const res = await complaintService.getAll();
        setComplaints(res.data || []);
        // fetch stats too
        try {
          const s = await complaintService.getStats();
          setStats(s.data || { total: 0, pending: 0, assigned: 0, closed: 0 });
        } catch (e) { }
      } catch (err) {
        setError('Failed to load complaints');
      } finally {
        setListLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      userService.getAll().then((res) => setUsers(res.data || [])).catch(() => { });
    }
  }, [user]);

  const refresh = async () => {
    try {
      const res = await complaintService.getAll();
      setComplaints(res.data || []);
      try {
        const s = await complaintService.getStats();
        setStats(s.data || { total: 0, pending: 0, assigned: 0, closed: 0 });
      } catch (e) { }
    } catch (e) { }
  };

  const handleAssignClick = (id) => setAssignTarget({ complaintId: id, assignee: '' });
  const handleAssignSubmit = async () => {
    if (!assignTarget.assignee) return setError('Select an assignee');
    try {
      await complaintService.assign(assignTarget.complaintId, assignTarget.assignee);
      setAssignTarget({ complaintId: null, assignee: '' });
      refresh();
    } catch (err) { setError('Failed to assign'); }
  };

  const handleStatusClick = (id) => setStatusTarget({ complaintId: id, status: '' });
  const handleStatusSubmit = async () => {
    if (!statusTarget.status) return setError('Select a status');
    try {
      await complaintService.updateStatus(statusTarget.complaintId, statusTarget.status);
      setStatusTarget({ complaintId: null, status: '' });
      refresh();
    } catch (err) { setError('Failed to update status'); }
  };

  const handleClose = async (id) => {
    try {
      await complaintService.updateStatus(id, 'Closed');
      refresh();
    } catch (err) { setError('Failed to close'); }
  };

  return (
    <div className="master-screen">
      <div className="screen-header">
        <div>
          <h1>Complaints Dashboard</h1>
          <p className="hero-subtitle">Overview of all system complaints</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending Action</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.assigned}</div>
          <div className="stat-label">Currently Assigned</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.closed}</div>
          <div className="stat-label">Successfully Closed</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {listLoading ? (
          <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading complaints...</div>
        ) : (
          <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="master-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Block</th>
                  <th>Room</th>
                  <th>Type</th>
                  <th>Remarks</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Attachment</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-muted)' }}>No complaints found.</td>
                  </tr>
                )}
                {complaints.map((c) => {
                  const isAssignee = c.assignedTo && String(c.assignedTo._id || c.assignedTo) === String(user?.id || user?._id);
                  return (
                    <tr key={c._id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>{c.blockName}</td>
                      <td>{c.roomNumber}</td>
                      <td>{c.complaintType}</td>
                      <td>{c.remarks || '-'}</td>
                      <td>
                        <span className={`status-badge status-${(c.status || '').toLowerCase()}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>{c.createdBy?.username || c.createdBy?.email || '-'}</td>
                      <td>
                        {c.attachment ? (
                          <a href={`http://localhost:5000${c.attachment}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-teal)' }}>View</a>
                        ) : '-'}
                      </td>
                      <td>
                        <div className="actions-cell">
                          {(isAssignee || user?.role === 'SuperAdmin') && c.status !== 'Closed' && (
                            <button onClick={() => handleClose(c._id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>Mark Completed</button>
                          )}

                          {user?.role === 'SuperAdmin' && (
                            assignTarget.complaintId === c._id ? (
                              <div className="assign-overlay">
                                <select value={assignTarget.assignee} onChange={(e) => setAssignTarget({ ...assignTarget, assignee: e.target.value })}>
                                  <option value="">Select user</option>
                                  {users.filter(u => u.role !== 'SuperAdmin').map(u => (
                                    <option key={u._id} value={u._id}>{u.username} ({u.role})</option>
                                  ))}
                                </select>
                                <button onClick={handleAssignSubmit} className="status-save">Assign</button>
                                <button onClick={() => setAssignTarget({ complaintId: null, assignee: '' })} className="status-cancel">Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => handleAssignClick(c._id)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>Assign</button>
                            )
                          )}

                          {(isAssignee || user?.role === 'SuperAdmin') && (
                            statusTarget.complaintId === c._id ? (
                              <div className="assign-overlay" style={{ right: '40px' }}>
                                <select className="status-select" value={statusTarget.status} onChange={(e) => setStatusTarget({ ...statusTarget, status: e.target.value })}>
                                  <option value="">Select status</option>
                                  <option value="Pending">Pending</option>
                                  <option value="In-Progress">In-Progress</option>
                                  <option value="Onhold">Onhold</option>
                                  <option value="Closed">Closed</option>
                                </select>
                                <button onClick={handleStatusSubmit} className="status-save">Save</button>
                                <button onClick={() => setStatusTarget({ complaintId: null, status: '' })} className="status-cancel">Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => handleStatusClick(c._id)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>Update Status</button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintsDashboardPage;
