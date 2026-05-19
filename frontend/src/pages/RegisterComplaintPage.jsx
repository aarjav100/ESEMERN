import React, { useState } from 'react';
import api from '../api';

const RegisterComplaintPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    category: 'Water Supply',
    location: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const categories = [
    'Water Supply',
    'Electricity',
    'Sanitation',
    'Roads & Traffic',
    'General Administration'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setAiResult(null);
    setLoading(true);

    try {
      const res = await api.post('/complaints', formData);
      setSuccess(true);
      setAiResult(res.data.complaint.aiAnalysis);
      setFormData({
        name: '',
        email: '',
        title: '',
        category: 'Water Supply',
        location: '',
        description: ''
      });
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError(err.response?.data?.error || 'Failed to submit complaint. Please check fields.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get urgency badge styles
  const getUrgencyBadge = (urgency) => {
    const u = urgency?.toLowerCase();
    if (u === 'critical') return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' };
    if (u === 'high') return { bg: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', border: '1px solid rgba(249, 115, 22, 0.4)' };
    if (u === 'medium') return { bg: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.4)' };
    return { bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' };
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 10px 0', background: 'linear-gradient(to right, #10b981, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Smart Complaint Portal
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxW: '600px', margin: '0 auto' }}>
          Submit your public grievances online. Our AI engine will automatically classify priority, recommend the concerned department, and issue a direct response.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: aiResult ? '1fr 1fr' : '1fr', gap: '30px', transition: 'all 0.3s ease' }}>
        
        {/* Registration Form */}
        <div className="glass-panel animate-fade-in" style={{ padding: '35px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📝</span> Lodge New Complaint
          </h2>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="label">Your Name</label>
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  placeholder="Rahul Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="input-field"
                  placeholder="rahul@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label className="label">Complaint Title</label>
              <input
                type="text"
                name="title"
                className="input-field"
                placeholder="Water Leakage Issue / Electricity Wire Sparking"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
              <div className="form-group">
                <label className="label">Category</label>
                <select
                  name="category"
                  className="input-field"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ background: '#0f172a', color: '#f8fafc', cursor: 'pointer' }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Location / Area</label>
                <input
                  type="text"
                  name="location"
                  className="input-field"
                  placeholder="Ghaziabad"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label className="label">Detailed Description</label>
              <textarea
                name="description"
                className="input-field"
                placeholder="Water pipeline damaged near market area. Water overflowing onto roads..."
                rows="5"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 600, marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }} disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-dots">⚙️ Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <span>🚀 Submit & Analyze Complaint</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* AI Analysis Result Display */}
        {aiResult && (
          <div className="glass-panel animate-fade-in" style={{ padding: '35px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981' }}>
                  <span>🤖</span> AI Diagnostics Complete!
                </h2>
                <span style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  ...getUrgencyBadge(aiResult.urgency)
                }}>
                  {aiResult.urgency} Urgency
                </span>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Concerned Department Suggested
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🏛️</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                    {aiResult.department}
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI Generated Complaint Summary
                </h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{aiResult.summary}"
                </p>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Automated User Response
                </h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#a7f3d0', lineHeight: '1.6' }}>
                  {aiResult.autoResponse}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center', padding: '10px 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ color: '#34d399', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                ✅ Complaint stored successfully in MongoDB Atlas!
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RegisterComplaintPage;
