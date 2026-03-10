import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showNotification } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login(email, password);
      // Also fetch /me to get college_name and department
      let meData = {};
      try {
        // We need the token set first; login() sets it
        const tempToken = data.access_token;
        const meRes = await fetch('http://127.0.0.1:8000/me', {
          headers: { Authorization: `Bearer ${tempToken}` }
        });
        if (meRes.ok) meData = await meRes.json();
      } catch {}
      login(data, {
        department:   meData.department   || '',
        college_name: meData.college_name || '',
      });
      showNotification(`Welcome back, ${data.user_name}! 👋`, 'success');
      navigate('/dashboard');
    } catch (err) {
      showNotification(err.message || 'Login failed. Check your credentials.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <i className="fas fa-graduation-cap"></i>
          <h2>Welcome Back</h2>
          <p>Sign in to your EduAssist account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><i className="fas fa-envelope"></i> Email Address</label>
            <input
              type="email" placeholder="your.email@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label><i className="fas fa-lock"></i> Password</label>
            <input
              type="password" placeholder="Enter your password"
              value={password} onChange={e => setPassword(e.target.value)} required
            />
          </div>
          <button type="submit" className="btn-submit" disabled={loading}>
            <i className="fas fa-sign-in-alt"></i>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <button className="form-link" onClick={() => navigate('/')}>
            Create one here
          </button>
        </div>
      </div>
    </div>
  );
}
