import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <span>🎬</span> IMOVIES<span>.</span>
          </div>
          <p className="footer-desc">
            Next-generation full-stack cinema booking application powered by the MERN Stack & Socket.IO. Experience instant seat reservation and ticket issuance.
          </p>
          <div className="tech-pills">
            <span className="badge">MongoDB</span>
            <span className="badge">Express.js</span>
            <span className="badge">React 18</span>
            <span className="badge">Node.js</span>
            <span className="badge">Socket.IO</span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/">Now Showing</Link></li>
            <li><Link to="/theatres">Cinemas & Theatres</Link></li>
            <li><Link to="/bookings">My Bookings</Link></li>
            <li><Link to="/login">Account Access</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Demo Credentials</h4>
          <div className="demo-box">
            <p><strong>Admin:</strong> admin@imovies.com / admin12345</p>
            <p><strong>User:</strong> user@imovies.com / user12345</p>
          </div>
          <small className="text-muted">
            * All payments in this platform are mocked for educational demonstrations.
          </small>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} IMovies Cinema Network. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
