import React, { useState, useEffect } from 'react';
import api from '../api';

const ComplaintListPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  
  // Status editing state
  const [editingId, setEditingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState('');
  const [editingLoading, setEditingLoading] = useState(false);

  // Detail Modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const categories = [
    'Water Supply',
    'Electricity',
    'Sanitation',
    'Roads & Traffic',
    'General Administration'
  ];

  const statuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/complaints';
      const params = [];
      if (filterCategory) params.push(`category=${encodeURIComponent(filterCategory)}`);
      if (filterStatus) params.push(`status=${encodeURIComponent(filterStatus)}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await api.get(url);
      setComplaints(res.data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!searchLocation.trim()) {
      fetchComplaints();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/complaints/search?location=${encodeURIComponent(searchLocation)}`);
      setComplaints(res.data);
    } catch (err) {
      console.error('Error searching location:', err);
      setError('Failed to search by location.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id) => {
    if (!editingStatus) return;
    setEditingLoading(true);
    try {
      const res = await api.put(`/complaints/${id}`, { status: editingStatus });
      setComplaints(complaints.map(c => c._id === id ? res.data.complaint : c));
      setEditingId(null);
      if (selectedComplaint && selectedComplaint._id === id) {
        setSelectedComplaint(res.data.complaint);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setEditingLoading(false);
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await api.delete(`/complaints/${id}`);
      setComplaints(complaints.filter(c => c._id !== id));
      if (selectedComplaint && selectedComplaint._id === id) {
        setSelectedComplaint(null);
      }
    } catch (err) {
      console.error('Error deleting complaint:', err);
      alert('Failed to delete complaint.');
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filterCategory, filterStatus]);

  const getUrgencyColor = (urgency) => {
    const u = urgency?.toLowerCase();
    if (u === 'critical') return '#ef4444';
    if (u === 'high') return '#f97316';
    if (u === 'medium') return '#eab308';
    return '#10b981';
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'resolved') return '#10b981';
    if (s === 'in progress') return '#3b82f6';
    if (s === 'rejected') return '#ef4444';
    return '#facc15';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0 }}>📋 Citizen Grievance Registry</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0 0' }}>Search, track, and update civic complaint reports.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchComplaints} disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh List'}
        </button>
      </div>

      {/* Filter and Search Bar Panel */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Search */}
        <form onSubmit={handleLocationSearch} style={{ display: 'flex', gap: '10px', flex: '1 1 300px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search by location (e.g. Ghaziabad)..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            style={{ margin: 0 }}
          />
          <button type="submit" className="btn btn-secondary">🔍 Search</button>
        </form>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category:</span>
            <select
              className="input-field"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: '160px', margin: 0, padding: '8px 12px', background: '#0f172a', color: '#f8fafc' }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
            <select
              className="input-field"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: '140px', margin: 0, padding: '8px 12px', background: '#0f172a', color: '#f8fafc' }}
            >
              <option value="">All Statuses</option>
              {statuses.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
        </div>

      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '12px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Complaint Grid List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <div className="loading-dots" style={{ fontSize: '2.5rem' }}>
            <span>•</span><span>•</span><span>•</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Loading grievances database...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', borderRadius: '16px' }}>
          <span style={{ fontSize: '3rem' }}>📭</span>
          <h3 style={{ margin: '15px 0 5px 0', fontSize: '1.2rem', color: '#f8fafc' }}>No Complaints Registered</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Try adjusting your filters or location search query.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {complaints.map((complaint) => (
            <div 
              key={complaint._id} 
              className="glass-panel animate-fade-in" 
              style={{ 
                padding: '24px', 
                borderRadius: '14px', 
                borderLeft: `5px solid ${getUrgencyColor(complaint.aiAnalysis?.urgency)}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedComplaint(complaint)}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                      {complaint.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      📍 {complaint.location}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0 0 0', color: '#f8fafc' }}>
                    {complaint.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    color: getStatusColor(complaint.status),
                    background: `${getStatusColor(complaint.status)}15`,
                    border: `1px solid ${getStatusColor(complaint.status)}40`
                  }}>
                    ● {complaint.status}
                  </span>
                  
                  {editingId === complaint._id ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        className="input-field"
                        value={editingStatus}
                        onChange={(e) => setEditingStatus(e.target.value)}
                        style={{ margin: 0, padding: '4px 8px', fontSize: '0.8rem', width: '120px', background: '#0f172a', color: '#f8fafc' }}
                      >
                        {statuses.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                      <button 
                        onClick={() => handleStatusUpdate(complaint._id)} 
                        className="btn btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        disabled={editingLoading}
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingId(null)} 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setEditingId(complaint._id);
                        setEditingStatus(complaint.status);
                      }} 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      ✏️ Edit Status
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleDeleteComplaint(complaint._id)} 
                    className="btn" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>

              {/* Description Summary */}
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.5' }}>
                {complaint.description.length > 180 ? `${complaint.description.slice(0, 180)}...` : complaint.description}
              </p>

              {/* Footer / Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                <span>Reported by: <strong>{complaint.name}</strong> ({complaint.email})</span>
                <span>📅 {new Date(complaint.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expanded Complaint Detail Modal */}
      {selectedComplaint && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '35px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                  {selectedComplaint.category}
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '8px 0 0 0', color: '#f8fafc' }}>
                  {selectedComplaint.title}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedComplaint(null)} 
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Complaint Text Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '24px' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Reporter Details</h4>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                  <strong>{selectedComplaint.name}</strong> (<span style={{ color: 'var(--text-secondary)' }}>{selectedComplaint.email}</span>) | 📍 {selectedComplaint.location}
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Full Description</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px' }}>
                  {selectedComplaint.description}
                </p>
              </div>
            </div>

            {/* AI Analysis Display */}
            {selectedComplaint.aiAnalysis && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🤖</span> AI Diagnostic Metrics
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <h5 style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CRITICALITY LEVEL</h5>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: getUrgencyColor(selectedComplaint.aiAnalysis.urgency) }}>
                      ⚠️ {selectedComplaint.aiAnalysis.urgency}
                    </span>
                  </div>

                  <div>
                    <h5 style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ASSIGNED DEPARTMENT</h5>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                      🏛️ {selectedComplaint.aiAnalysis.department}
                    </span>
                  </div>
                </div>

                <div>
                  <h5 style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI RECOLLECTIVE SUMMARY</h5>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                    "{selectedComplaint.aiAnalysis.summary}"
                  </p>
                </div>

                <div>
                  <h5 style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AUTO-RESPONSE ACKNOWLEDGMENT</h5>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#a7f3d0', lineHeight: '1.5' }}>
                    {selectedComplaint.aiAnalysis.autoResponse}
                  </p>
                </div>
              </div>
            )}

            {/* Footer / Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Report Date: {new Date(selectedComplaint.createdAt).toLocaleString()}
              </span>
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedComplaint(null)}
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ComplaintListPage;
