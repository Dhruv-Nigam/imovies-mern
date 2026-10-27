import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="site-header">
      <div className="container nav-container">
        <Link to="/" className="brand-logo">
          <span className="brand-icon">🎬</span>
          <span className="brand-name">
            IMOVIES<span className="brand-dot">.</span>
          </span>
        </Link>

        <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
          <Link
            to="/"
            className={`nav-link ${isActive("/") ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Movies
          </Link>
          <Link
            to="/theatres"
            className={`nav-link ${isActive("/theatres") ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Cinemas
          </Link>
          {user && (
            <Link
              to="/bookings"
              className={`nav-link ${isActive("/bookings") ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              My Tickets
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-link admin-pill ${isActive("/admin") ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              ⚡ Admin Panel
            </Link>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="user-profile-badge">
              <div className="avatar-circle">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-info-text">
                <span className="user-name">{user.name.split(" ")[0]}</span>
                {isAdmin && <span className="admin-tag">ADMIN</span>}
              </div>
              <button
                className="btn btn-outline-danger btn-sm logout-btn"
                onClick={logout}
                title="Sign out"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline-light btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          <button
            className="mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
