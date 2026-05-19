import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import RegisterComplaintPage from './pages/RegisterComplaintPage';
import ComplaintListPage from './pages/ComplaintListPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Chatbot from './components/Chatbot';
import { AuthContext } from './context/AuthContext';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '15px' }}>
        <div className="loading-dots" style={{ fontSize: '2rem' }}>
          <span>•</span><span>•</span><span>•</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading secure session...</p>
      </div>
    );
  }

  return (
    <>
      {user && <Navbar />}
      <div className="container" style={{ paddingTop: user ? '120px' : '40px' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />

          {/* Protected Routes */}
          <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/register" element={user ? <RegisterComplaintPage /> : <Navigate to="/login" />} />
          <Route path="/complaints" element={user ? <ComplaintListPage /> : <Navigate to="/login" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
      </div>
      {user && <Chatbot />}
    </>
  );
}

export default App;
