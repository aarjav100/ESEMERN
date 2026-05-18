import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AllCandidatesPage from './pages/AllCandidatesPage';
import AddCandidatePage from './pages/AddCandidatePage';
import JobMatchPage from './pages/JobMatchPage';

import DashboardPage from './pages/DashboardPage';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '120px' }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/candidates" element={<AllCandidatesPage />} />
          <Route path="/add" element={<AddCandidatePage />} />
          <Route path="/match" element={<JobMatchPage />} />
        </Routes>
      </div>
      <Chatbot />
    </>
  );
}

export default App;
