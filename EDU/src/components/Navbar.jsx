import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const nav = useNavigate();
  const handleLogout = () => { logout(); nav('/'); };
  const initials = user?.name ? user.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : 'S';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <a href="/" className="logo" onClick={e=>{e.preventDefault();nav('/');}}>
          <i className="fas fa-graduation-cap"></i><span>EduAssist</span>
        </a>
        <div style={{display:'flex',gap:'0.7rem',alignItems:'center'}}>
          <button className="theme-toggle" onClick={toggle} title={dark?'Light mode':'Dark mode'}>
            <i className={`fas fa-${dark?'sun':'moon'}`}></i>
          </button>
          {user ? (
            <div className="user-profile" onClick={handleLogout} title="Click to logout">
              <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'var(--primary)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.85rem'}}>
                {initials}
              </div>
              <span>{user.name?.split(' ')[0]}</span>
            </div>
          ) : (
            <div style={{display:'flex',gap:'0.6rem'}}>
              <button onClick={()=>nav('/login')} style={{padding:'0.5rem 1.2rem',border:'1.5px solid var(--primary)',borderRadius:'var(--r-sm)',background:'transparent',color:'var(--primary)',fontWeight:600,cursor:'pointer',fontSize:'0.9rem'}}>Login</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
