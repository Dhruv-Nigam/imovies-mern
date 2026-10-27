import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ defaultMode = "login" }) {
  const [mode, setMode] = useState(defaultMode);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get("redirect") || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let res;
    if (mode === "login") {
      res = await login(formData.email, formData.password);
    } else {
      res = await register(formData);
    }

    setSubmitting(false);
    if (res.success) {
      navigate(redirectPath);
    }
  };

  const fillDemoAccount = (role) => {
    setMode("login");
    if (role === "admin") {
      setFormData({
        name: "",
        email: "admin@imovies.com",
        password: "admin12345",
        phone: "",
      });
    } else {
      setFormData({
        name: "",
        email: "user@imovies.com",
        password: "user12345",
        phone: "",
      });
    }
  };

  return (
    <div className="auth-page-wrap">
      <div className="auth-card">
        <div className="auth-card-header">
          <span className="brand-icon-big">🎬</span>
          <h2>{mode === "login" ? "Welcome Back" : "Join IMovies"}</h2>
          <p className="auth-subtext">
            {mode === "login"
              ? "Access your tickets, personalized screenings, and book cinema seats."
              : "Create an account to reserve premium seats and earn member perks."}
          </p>
        </div>

        {/* Quick Demo Login Helpers */}
        <div className="demo-credentials-banner">
          <span className="demo-label">⚡ 1-Click Demo Login:</span>
          <div className="demo-btns">
            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={() => fillDemoAccount("admin")}
            >
              Fill Admin
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={() => fillDemoAccount("user")}
            >
              Fill Demo User
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <label>
              Full Name *
              <input
                required
                type="text"
                className="form-control"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </label>
          )}

          <label>
            Email Address *
            <input
              required
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </label>

          <label>
            Password *
            <input
              required
              type="password"
              minLength="6"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <small className="text-muted">Minimum 6 characters</small>
          </label>

          {mode === "register" && (
            <label>
              Phone (Optional)
              <input
                type="tel"
                className="form-control"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </label>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 submit-auth-btn"
            disabled={submitting}
          >
            {submitting
              ? "Authenticating..."
              : mode === "login"
              ? "Sign In to Account"
              : "Create Free Account"}
          </button>
        </form>

        <div className="auth-footer-toggle">
          {mode === "login" ? (
            <p>
              Don't have an account yet?{" "}
              <button
                type="button"
                className="btn-toggle-mode"
                onClick={() => setMode("register")}
              >
                Create Account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="btn-toggle-mode"
                onClick={() => setMode("login")}
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
