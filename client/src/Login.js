import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    // Create Form Data (Required for the Python Backend)
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await axios.post('http://127.0.0.1:8000/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      // --- SAVE USER DATA ---
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user_name', response.data.user_name);
      
      // 1. Save Semester (For Countdown)
      if (response.data.semester) {
        localStorage.setItem('semester', response.data.semester);
      }

      // 2. Save Admin Status (For Forum Delete Buttons)
      // We convert the boolean to a string because localStorage only stores strings
      localStorage.setItem('is_admin', response.data.is_admin); 
      
      // Redirect to Dashboard
      navigate('/dashboard');

    } catch (err) {
      // Show error message on screen (not popup)
      const msg = err.response?.data?.detail || "Login failed. Please check your internet or credentials.";
      setError(msg);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '80px auto' }}>
        <h2 className="title" style={{ textAlign: 'center', marginBottom: '20px' }}>Welcome Back</h2>
        
        {error && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '15px', 
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
          
          <button type="submit" className="download-btn" style={{ 
            justifyContent: 'center', 
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', 
            color: 'white', 
            cursor: 'pointer',
            padding: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            marginTop: '10px'
          }}>
            Login
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
          New Student? <Link to="/register" style={{ color: '#1e3c72', fontWeight: 'bold' }}>Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;