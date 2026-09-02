import React, { useEffect, useState, useContext, useCallback } from 'react';
import { complaintService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './MasterScreen.css';

const StatCard = ({ label, value, color, onClick }) => (
  <div
    className="stat-card"
    style={{ borderTop: `4px solid ${color}`, cursor: onClick ? 'pointer' : 'default' }}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
  >
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const UserComplaintDashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [myStats, setMyStats] = useState({ total: 0, pending: 0, assigned: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusTarget, setStatusTarget] = useState({ complaintId: null, status: '' });
  const [selectedStatus, setSelectedStatus] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAll();
      const allComplaints = res.data || [];

      // Filter complaints for current user: either created by them or assigned to them
      const userId = user?.id || user?._id;
      const userComplaints = allComplaints.filter((c) => {
        const createdById = c.createdBy?._id || c.createdBy;
        const assignedToId = c.assignedTo?._id || c.assignedTo;
        return (
          String(createdById) === String(userId) ||
          String(assignedToId) === String(userId)
        );
      });
      setComplaints(userComplaints);

      // Calculate stats
      const stats = {
        total: userComplaints.length,
        pending: userComplaints.filter(c => c.status === 'Pending').length,
        assigned: userComplaints.filter(c => c.status === 'Assigned').length,
        closed: userComplaints.filter(c => c.status === 'Closed').length,
      };
      setMyStats(stats);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredComplaints = filterStatus === 'All'
    ? complaints
    : complaints.filter(c => c.status === filterStatus);

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedStatus(complaint.status || '');
  };

  if (loading) return <div className="master-screen"><p>Loading...</p></div>;

  return (
    <div className="master-screen">
      <div className="screen-header">
        <div>
          <h1>My Complaints</h1>
          <p className="hero-subtitle">Manage and track your complaint requests</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Complaint Status Dashboard */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h2 style={{ color: 'var(--text-main)', marginBottom: 'var(--space-3)', fontSize: '24px', fontWeight: '600' }}>Overview</h2>
        <div className="stats-grid">
          <div
            className="stat-card"
            style={{ cursor: 'pointer', borderTop: '4px solid var(--accent-teal)' }}
            onClick={() => {
              setFilterStatus('All');
              if (complaints.length > 0) {
                viewComplaintDetails(complaints[0]);
              }
            }}
          >
            <div className="stat-value">{myStats.total}</div>
            <div className="stat-label" style={{ color: 'var(--text-main)', marginTop: '8px' }}>Total Complaints</div>
          </div>

          <div
            className="stat-card"
            style={{ cursor: 'pointer', borderTop: '4px solid #10B981' }}
            onClick={() => setFilterStatus('Closed')}
          >
            <div className="stat-value" style={{ background: 'none', WebkitTextFillColor: 'initial', color: '#10B981' }}>{myStats.closed}</div>
            <div className="stat-label" style={{ color: 'var(--text-main)', marginTop: '8px' }}>Closed</div>
          </div>
        </div>
      </div>

      {/* Selected Complaint Details Card */}
      {selectedComplaint && (
        <div className="glass-panel" style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '22px', fontWeight: '700' }}>Complaint Details</h3>
            <button
              onClick={() => setSelectedComplaint(null)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-pill)',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-3)'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Block Name</label>
              <p style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontWeight: '500' }}>
                {selectedComplaint.blockName || '-'}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Room Number</label>
              <p style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontWeight: '500' }}>
                {selectedComplaint.roomNumber || '-'}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Complaint Type</label>
              <p style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontWeight: '500' }}>
                {selectedComplaint.complaintType || '-'}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
              <p style={{
                margin: 0,
                fontSize: '14px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-block',
                backgroundColor:
                  selectedComplaint.status === 'Closed' ? 'rgba(16, 185, 129, 0.15)' :
                    selectedComplaint.status === 'Pending' ? 'rgba(245, 158, 11, 0.15)' :
                      selectedComplaint.status === 'Assigned' ? 'rgba(56, 189, 248, 0.15)' :
                        'rgba(255,255,255,0.05)',
                color:
                  selectedComplaint.status === 'Closed' ? '#34D399' :
                    selectedComplaint.status === 'Pending' ? '#FBBF24' :
                      selectedComplaint.status === 'Assigned' ? '#38BDF8' :
                        'var(--text-main)',
                border: `1px solid ${selectedComplaint.status === 'Closed' ? 'rgba(16, 185, 129, 0.3)' :
                    selectedComplaint.status === 'Pending' ? 'rgba(245, 158, 11, 0.3)' :
                      selectedComplaint.status === 'Assigned' ? 'rgba(56, 189, 248, 0.3)' :
                        'rgba(255,255,255,0.1)'
                  }`,
                fontWeight: '600'
              }}>
                {selectedComplaint.status}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date Created</label>
              <p style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontWeight: '500' }}>
                {new Date(selectedComplaint.createdAt).toLocaleDateString()} {new Date(selectedComplaint.createdAt).toLocaleTimeString()}
              </p>
            </div>

            {selectedComplaint.assignedTo && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned To</label>
                <p style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontWeight: '500' }}>
                  {selectedComplaint.assignedTo?.username || selectedComplaint.assignedTo || '-'}
                </p>
              </div>
            )}
          </div>

          {selectedComplaint.remarks && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remarks</label>
              <p style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: 'var(--radius-md)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: '500', lineHeight: 1.6 }}>
                {selectedComplaint.remarks}
              </p>
            </div>
          )}

          {selectedComplaint.attachment && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attachment</label>
              <a href={`http://localhost:5000/${selectedComplaint.attachment}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{
                textDecoration: 'none',
                display: 'inline-block'
              }}>
                📎 View Attachment
              </a>
            </div>
          )}

          {/* Allow complaint creator or SuperAdmin to update status to Pending/Closed */}
          {(user?.role === 'SuperAdmin' || (selectedComplaint.createdBy && (String(selectedComplaint.createdBy._id || selectedComplaint.createdBy) === String(user?._id || user?.id)))) && (
            <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Change Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  minWidth: '140px'
                }}
              >
                <option value="">Select status</option>
                <option value="Pending">Pending</option>
                <option value="Closed">Closed</option>
              </select>
              <button
                onClick={async () => {
                  try {
                    if (!selectedStatus) return setError('Select a status');
                    await complaintService.updateStatus(selectedComplaint._id, selectedStatus);
                    await loadData();
                    // refresh selected complaint detail from latest list
                    const refreshed = (await complaintService.getById(selectedComplaint._id)).data;
                    setSelectedComplaint(refreshed);
                    setError('');
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to update status');
                  }
                }}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Save Updates
              </button>
            </div>
          )}
        </div>
      )}

      {/* Complaints List */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '18px', fontWeight: '600' }}>
            {filterStatus === 'All' ? 'All Complaints List' : `${filterStatus} Complaints List`}
          </h3>
          <button
            onClick={() => setFilterStatus('All')}
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '6px 12px' }}
          >
            Reset Filter
          </button>
        </div>

        <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="master-table">
            <thead>
              <tr>
                <th>Block</th>
                <th>Room</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date Created</th>
                <th>Remarks</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint._id} onClick={() => viewComplaintDetails(complaint)} style={{ cursor: 'pointer' }}>
                    <td>{complaint.blockName || '-'}</td>
                    <td>{complaint.roomNumber || '-'}</td>
                    <td>{complaint.complaintType || '-'}</td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: complaint.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' :
                          complaint.status === 'In-Progress' ? 'rgba(56, 189, 248, 0.1)' :
                            complaint.status === 'Closed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                        color: complaint.status === 'Pending' ? '#FBBF24' :
                          complaint.status === 'In-Progress' ? '#38BDF8' :
                            complaint.status === 'Closed' ? '#34D399' : 'var(--text-main)',
                        border: `1px solid ${complaint.status === 'Pending' ? 'rgba(245, 158, 11, 0.2)' :
                            complaint.status === 'In-Progress' ? 'rgba(56, 189, 248, 0.2)' :
                              complaint.status === 'Closed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)'
                          }`
                      }}>
                        {complaint.status}
                      </span>
                    </td>
                    <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    <td>{complaint.remarks?.substring(0, 30) || '-'}...</td>
                    <td>
                      <div className="actions-cell">
                        {/* Update status control for assigned staff (not SuperAdmin) */}
                        {String(complaint.assignedTo?._id || complaint.assignedTo) === String(user?._id || user?.id) && user?.role !== 'SuperAdmin' ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            {statusTarget.complaintId === complaint._id ? (
                              <div className={`status-action open`} onClick={(e) => e.stopPropagation()}>
                                <select
                                  className="status-select"
                                  value={statusTarget.status}
                                  onChange={(e) => setStatusTarget({ ...statusTarget, status: e.target.value })}
                                  aria-label="Select status"
                                >
                                  <option value="">Select status</option>
                                  <option value="In-Progress">In-Progress</option>
                                  <option value="Onhold">Onhold</option>
                                  <option value="Closed">Completed</option>
                                </select>

                                <div className="status-buttons show">
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        if (!statusTarget.status) return setError('Select a status');
                                        await complaintService.updateStatus(statusTarget.complaintId, statusTarget.status);
                                        await loadData();
                                        setStatusTarget({ complaintId: null, status: '' });
                                        setError('');
                                      } catch (err) {
                                        setError(err.response?.data?.message || 'Failed to update status');
                                      }
                                    }}
                                    className="status-save"
                                    aria-label="Save status"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setStatusTarget({ complaintId: null, status: '' }); }}
                                    className="status-cancel"
                                    aria-label="Cancel status"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); setStatusTarget({ complaintId: complaint._id, status: '' }); }}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '13px' }}
                              >
                                Update Status
                              </button>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-muted)' }}>
                    No {filterStatus === 'All' ? 'complaints' : `${filterStatus.toLowerCase()} complaints`} found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserComplaintDashboardPage;
