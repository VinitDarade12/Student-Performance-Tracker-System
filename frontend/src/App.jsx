import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Ecosystem from './components/Ecosystem';
import Login from './components/Login';
import About from './components/About';
import AdminDashboard from './components/AdminDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import StudentDashboard from './components/StudentDashboard';

const Home = () => (
  <>
    <Navbar />
    <main>
      <Hero />
      <Ecosystem />
    </main>
    <footer style={{ padding: '40px 0', textAlign: 'center', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.9rem' }}>
      <p>&copy; {new Date().getFullYear()} TRACKER. All rights reserved.</p>
    </footer>
  </>
);

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
