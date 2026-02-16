import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

function Register() {
  const [formData, setFormData] = useState({
    email: '', password: '', full_name: '', semester: 'S1', department: 'CS'
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/register', formData);
      alert('Registration Successful! Please Login.');
      navigate('/');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || 'Registration failed'));
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <div className="card">
        <h2 className="title" style={{ textAlign: 'center' }}>Student Register</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <input type="text" placeholder="Full Name" required 
            onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
            style={{ padding: '8px' }} />
            
          <input type="email" placeholder="Email" required 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            style={{ padding: '8px' }} />
            
          <input type="password" placeholder="Password" required 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            style={{ padding: '8px' }} />
            
          <select onChange={(e) => setFormData({...formData, semester: e.target.value})} style={{ padding: '8px' }}>
            <option value="S1">S1</option><option value="S2">S2</option><option value="S3">S3</option>
            <option value="S4">S4</option><option value="S5">S5</option><option value="S6">S6</option>
            <option value="S7">S7</option><option value="S8">S8</option>
          </select>
          
          <input type="text" placeholder="Department (e.g. CS, EC)" required 
            onChange={(e) => setFormData({...formData, department: e.target.value})} 
            style={{ padding: '8px' }} />

          <button type="submit" className="download-btn" style={{ justifyContent: 'center', background: '#d32f2f', color: 'white', marginTop: '10px' }}>
            Sign Up
          </button>
        </form>
        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;