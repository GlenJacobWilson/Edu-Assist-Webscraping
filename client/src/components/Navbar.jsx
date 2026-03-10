import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar({ onOpenRegister }) {
  const { user, logout } = useAuth();
  const { showNotification } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showNotification('Logged out successfully', 'info');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <a href="/" className="logo" onClick={e => { e.preventDefault(); navigate('/'); }}>
          <i className="fas fa-graduation-cap"></i>
          <span>EduAssist</span>
        </a>

        {user ? (
          <div className="user-profile" onClick={handleLogout} title="Click to logout">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
              alt="avatar"
            />
            <span>{user.name}</span>
          </div>
        ) : (
          <div className="nav-right">
            {onOpenRegister && (
              <button className="btn-nav-register" onClick={onOpenRegister}>
                <i className="fas fa-user-plus"></i> Create Account
              </button>
            )}
            <button className="btn-nav-login" onClick={() => navigate('/login')}>
              <i className="fas fa-sign-in-alt"></i> Login
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
