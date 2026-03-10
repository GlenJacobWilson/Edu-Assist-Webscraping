import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3><i className="fas fa-graduation-cap"></i> EduAssist</h3>
          <p>Independent student support platform helping you stay updated with important academic notifications and resources.</p>
          <div className="social-links">
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/notifications">Notifications</Link></li>
            <li><Link to="/forum">Forum</Link></li>
            <li><Link to="/materials">Study Materials</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <ul>
            <li><i className="fas fa-envelope"></i> support@eduassist.com</li>
            <li><i className="fas fa-phone"></i> +91 1234567890</li>
            <li><i className="fas fa-map-marker-alt"></i> Kerala, India</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 EduAssist - Independent Student Support Platform. Not affiliated with KTU.</p>
      </div>
    </footer>
  );
}
