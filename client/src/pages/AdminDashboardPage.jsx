import React, { useEffect, useState } from "react";
import { api, errorText } from "../api";
import { useAuth } from "../context/AuthContext";
import TicketModal from "../components/TicketModal";
import { toast } from "react-toastify";

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Dashboard Stats
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Entities Data
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  // Modals / Selected ticket
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Forms
  const [movieForm, setMovieForm] = useState({
    title: "",
    description: "",
    genre: "Action, Sci-Fi",
    language: "English",
    durationMins: 130,
    posterUrl: "",
    bannerUrl: "",
    trailerUrl: "",
    rating: 8.5,
    director: "",
  });

  const [theatreForm, setTheatreForm] = useState({
    name: "",
    location: "",
    address: "",
    screenType: "Dolby Atmos Premium",
    totalSeats: 48,
  });

  const [showForm, setShowForm] = useState({
    movie: "",
    theatre: "",
    startsAt: "",
    price: 250,
    screenType: "Dolby Atmos Premium",
  });

  const loadStats = async () => {
    try {
      const { data } = await api.get("/stats/admin");
      setStats(data.stats);
      setRecentBookings(data.recentBookings || []);
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setLoadingStats(false);
    }
  };

  const loadMovies = async () => {
    try {
      const { data } = await api.get("/movies/admin/all");
      setMovies(data.movies || []);
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const loadTheatres = async () => {
    try {
      const { data } = await api.get("/theatres");
      setTheatres(data.theatres || []);
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const loadShows = async () => {
    try {
      const { data } = await api.get("/shows/admin/all");
      setShows(data.shows || []);
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const loadBookings = async () => {
    try {
      const { data } = await api.get("/bookings/admin/all");
      setAllBookings(data.bookings || []);
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadMovies();
      loadTheatres();
      loadShows();
      loadBookings();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <h3>Admin Privileges Required</h3>
          <p>You must be signed in with an administrative account to access this control portal.</p>
          <div className="mt-3">
            <small>Tip: You can log in with <strong>admin@imovies.com</strong> / <strong>admin12345</strong></small>
          </div>
        </div>
      </div>
    );
  }

  // Create Handlers
  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      await api.post("/movies", movieForm);
      toast.success(`Movie "${movieForm.title}" created successfully!`);
      setMovieForm({
        title: "",
        description: "",
        genre: "Action, Sci-Fi",
        language: "English",
        durationMins: 130,
        posterUrl: "",
        bannerUrl: "",
        trailerUrl: "",
        rating: 8.5,
        director: "",
      });
      loadMovies();
      loadStats();
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const handleToggleMovie = async (id) => {
    try {
      const { data } = await api.delete(`/movies/${id}`);
      toast.info(data.message);
      loadMovies();
      loadStats();
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      await api.post("/theatres", theatreForm);
      toast.success(`Theatre "${theatreForm.name}" created successfully!`);
      setTheatreForm({
        name: "",
        location: "",
        address: "",
        screenType: "Dolby Atmos Premium",
        totalSeats: 48,
      });
      loadTheatres();
      loadStats();
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const handleDeleteTheatre = async (id) => {
    if (!window.confirm("Delete this theatre and cancel all its scheduled shows?")) return;
    try {
      await api.delete(`/theatres/${id}`);
      toast.success("Theatre deleted.");
      loadTheatres();
      loadShows();
      loadStats();
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    if (!showForm.movie || !showForm.theatre || !showForm.startsAt) {
      toast.warning("Please fill all required show fields.");
      return;
    }

    try {
      await api.post("/shows", showForm);
      toast.success("Showtime scheduled successfully with 48 tiered seats!");
      setShowForm({
        movie: "",
        theatre: "",
        startsAt: "",
        price: 250,
        screenType: "Dolby Atmos Premium",
      });
      loadShows();
      loadStats();
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const handleCancelShow = async (id) => {
    if (!window.confirm("Cancel this scheduled showtime?")) return;
    try {
      await api.delete(`/shows/${id}`);
      toast.success("Show cancelled.");
      loadShows();
      loadStats();
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  return (
    <div className="container admin-dashboard py-5">
      <div className="admin-header">
        <div>
          <span className="section-eyebrow">COMMAND CENTER</span>
          <h1 className="section-title">Admin Management Portal</h1>
        </div>
        <div className="admin-status-badge">
          <span className="dot-live"></span> System Operational
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Dashboard Overview
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "movies" ? "active" : ""}`}
          onClick={() => setActiveTab("movies")}
        >
          🎬 Movies ({movies.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "theatres" ? "active" : ""}`}
          onClick={() => setActiveTab("theatres")}
        >
          🏛️ Cinemas & Theatres ({theatres.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "shows" ? "active" : ""}`}
          onClick={() => setActiveTab("shows")}
        >
          🕒 Scheduled Shows ({shows.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          🎟️ Customer Bookings ({allBookings.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="admin-overview-tab">
          {stats && (
            <div className="stats-kpi-grid">
              <div className="kpi-card revenue">
                <span className="kpi-icon">💰</span>
                <span className="kpi-label">TOTAL REVENUE</span>
                <h3 className="kpi-val">₹{stats.totalRevenue?.toLocaleString()}</h3>
                <small className="kpi-sub">{stats.confirmedBookingsCount} confirmed bookings</small>
              </div>

              <div className="kpi-card">
                <span className="kpi-icon">🎟️</span>
                <span className="kpi-label">SEATS RESERVED</span>
                <h3 className="kpi-val">{stats.totalSeatsBooked || 0}</h3>
                <small className="kpi-sub">Across all multiplexes</small>
              </div>

              <div className="kpi-card">
                <span className="kpi-icon">🎬</span>
                <span className="kpi-label">TOTAL MOVIES</span>
                <h3 className="kpi-val">{stats.totalMovies || 0}</h3>
                <small className="kpi-sub">Active in catalog</small>
              </div>

              <div className="kpi-card">
                <span className="kpi-icon">🕒</span>
                <span className="kpi-label">ACTIVE SHOWTIMES</span>
                <h3 className="kpi-val">{stats.totalShows || 0}</h3>
                <small className="kpi-sub">Available for booking</small>
              </div>
            </div>
          )}

          {/* Recent Bookings Activity */}
          <div className="admin-card-panel mt-4">
            <h3>Recent Booking Activity</h3>
            {recentBookings.length > 0 ? (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Movie & Theatre</th>
                      <th>Seats</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b._id}>
                        <td className="code-font">{b.bookingCode}</td>
                        <td>{b.user?.name || "Customer"}<br/><small className="text-muted">{b.user?.email}</small></td>
                        <td>
                          <strong>{b.show?.movie?.title || "Movie"}</strong>
                          <br />
                          <small className="text-muted">{b.show?.theatre?.name}</small>
                        </td>
                        <td className="highlight-seats">{b.seats?.join(", ")}</td>
                        <td>₹{b.totalAmount}</td>
                        <td>
                          <span className={`status-pill-sm ${b.status}`}>{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">No recent bookings recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MOVIES */}
      {activeTab === "movies" && (
        <div className="admin-split-layout">
          {/* Add Movie Form */}
          <div className="admin-card-panel">
            <h3>Add New Movie</h3>
            <form onSubmit={handleCreateMovie} className="admin-form">
              <label>
                Title *
                <input
                  required
                  className="form-control"
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  placeholder="e.g. Gladiator II"
                />
              </label>

              <label>
                Description
                <textarea
                  className="form-control"
                  rows="3"
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  placeholder="Synopsis..."
                />
              </label>

              <div className="form-row-2">
                <label>
                  Genres (comma-separated)
                  <input
                    className="form-control"
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    placeholder="Action, Drama, Thriller"
                  />
                </label>
                <label>
                  Language
                  <input
                    className="form-control"
                    value={movieForm.language}
                    onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                  />
                </label>
              </div>

              <div className="form-row-2">
                <label>
                  Duration (Minutes)
                  <input
                    type="number"
                    className="form-control"
                    value={movieForm.durationMins}
                    onChange={(e) => setMovieForm({ ...movieForm, durationMins: e.target.value })}
                  />
                </label>
                <label>
                  Rating (0 - 10)
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                  />
                </label>
              </div>

              <label>
                Poster Image URL
                <input
                  type="url"
                  className="form-control"
                  value={movieForm.posterUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </label>

              <label>
                YouTube Trailer URL
                <input
                  type="url"
                  className="form-control"
                  value={movieForm.trailerUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>

              <button type="submit" className="btn btn-primary w-100 mt-2">
                Publish Movie
              </button>
            </form>
          </div>

          {/* Existing Movies List */}
          <div className="admin-card-panel">
            <h3>Catalog Movies ({movies.length})</h3>
            <div className="admin-list-scroll">
              {movies.map((m) => (
                <div key={m._id} className="admin-item-card">
                  <img
                    src={m.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=100&q=80"}
                    alt={m.title}
                    className="admin-item-thumb"
                  />
                  <div className="admin-item-info">
                    <h4>{m.title}</h4>
                    <p>{m.language} • {m.durationMins}m • Rating: {m.rating}</p>
                    <small className="text-muted">Status: {m.active ? "Visible" : "Hidden"}</small>
                  </div>
                  <div className="admin-item-actions">
                    <button
                      className={`btn btn-sm ${m.active ? "btn-outline-warning" : "btn-outline-success"}`}
                      onClick={() => handleToggleMovie(m._id)}
                    >
                      {m.active ? "Hide" : "Unhide"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: THEATRES */}
      {activeTab === "theatres" && (
        <div className="admin-split-layout">
          {/* Add Theatre Form */}
          <div className="admin-card-panel">
            <h3>Add New Cinema / Multiplex</h3>
            <form onSubmit={handleCreateTheatre} className="admin-form">
              <label>
                Theatre Name *
                <input
                  required
                  className="form-control"
                  value={theatreForm.name}
                  onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                  placeholder="e.g. IMovies IMAX 4DX"
                />
              </label>

              <label>
                Location / City *
                <input
                  required
                  className="form-control"
                  value={theatreForm.location}
                  onChange={(e) => setTheatreForm({ ...theatreForm, location: e.target.value })}
                  placeholder="e.g. Mumbai, Indore, Bengaluru"
                />
              </label>

              <label>
                Full Address
                <input
                  className="form-control"
                  value={theatreForm.address}
                  onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                  placeholder="Street / Mall / Floor"
                />
              </label>

              <div className="form-row-2">
                <label>
                  Screen Technology
                  <select
                    className="form-control"
                    value={theatreForm.screenType}
                    onChange={(e) => setTheatreForm({ ...theatreForm, screenType: e.target.value })}
                  >
                    <option value="Dolby Atmos Premium">Dolby Atmos Premium</option>
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="4DX">4DX</option>
                    <option value="Standard">Standard</option>
                  </select>
                </label>

                <label>
                  Total Seats
                  <input
                    type="number"
                    className="form-control"
                    value={theatreForm.totalSeats}
                    onChange={(e) => setTheatreForm({ ...theatreForm, totalSeats: e.target.value })}
                  />
                </label>
              </div>

              <button type="submit" className="btn btn-primary w-100 mt-2">
                Add Theatre
              </button>
            </form>
          </div>

          {/* Existing Theatres */}
          <div className="admin-card-panel">
            <h3>Registered Cinemas ({theatres.length})</h3>
            <div className="admin-list-scroll">
              {theatres.map((t) => (
                <div key={t._id} className="admin-item-card">
                  <div className="admin-item-info">
                    <h4>{t.name}</h4>
                    <p>📍 {t.location} • {t.screenType}</p>
                    <small className="text-muted">{t.address}</small>
                  </div>
                  <div className="admin-item-actions">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteTheatre(t._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SCHEDULE SHOWS */}
      {activeTab === "shows" && (
        <div className="admin-split-layout">
          {/* Schedule Show Form */}
          <div className="admin-card-panel">
            <h3>Schedule New Show</h3>
            <form onSubmit={handleCreateShow} className="admin-form">
              <label>
                Select Movie *
                <select
                  required
                  className="form-control"
                  value={showForm.movie}
                  onChange={(e) => setShowForm({ ...showForm, movie: e.target.value })}
                >
                  <option value="">-- Choose a Movie --</option>
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.language})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Select Cinema / Theatre *
                <select
                  required
                  className="form-control"
                  value={showForm.theatre}
                  onChange={(e) => setShowForm({ ...showForm, theatre: e.target.value })}
                >
                  <option value="">-- Choose a Theatre --</option>
                  {theatres.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.location})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Date & Showtime *
                <input
                  type="datetime-local"
                  required
                  className="form-control"
                  value={showForm.startsAt}
                  onChange={(e) => setShowForm({ ...showForm, startsAt: e.target.value })}
                />
              </label>

              <div className="form-row-2">
                <label>
                  Base Ticket Price (₹) *
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={showForm.price}
                    onChange={(e) => setShowForm({ ...showForm, price: e.target.value })}
                  />
                </label>

                <label>
                  Screen Type
                  <select
                    className="form-control"
                    value={showForm.screenType}
                    onChange={(e) => setShowForm({ ...showForm, screenType: e.target.value })}
                  >
                    <option value="Dolby Atmos Premium">Dolby Atmos Premium</option>
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="4DX">4DX</option>
                    <option value="Standard">Standard</option>
                  </select>
                </label>
              </div>

              <div className="alert alert-info py-2">
                <small>ℹ️ An interactive 48-seat cinema matrix (Standard, Premium, VIP) will be automatically initialized for this showtime.</small>
              </div>

              <button type="submit" className="btn btn-primary w-100 mt-2">
                Schedule Showtime
              </button>
            </form>
          </div>

          {/* Scheduled Shows List */}
          <div className="admin-card-panel">
            <h3>Scheduled Shows ({shows.length})</h3>
            <div className="admin-list-scroll">
              {shows.map((s) => (
                <div key={s._id} className="admin-item-card">
                  <div className="admin-item-info">
                    <h4>{s.movie?.title || "Movie"}</h4>
                    <p>{s.theatre?.name} ({s.theatre?.location})</p>
                    <p className="text-muted">
                      🕒 {new Date(s.startsAt).toLocaleString()} • ₹{s.price} Base
                    </p>
                  </div>
                  <div className="admin-item-actions">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleCancelShow(s._id)}
                    >
                      Cancel Show
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ALL BOOKINGS */}
      {activeTab === "bookings" && (
        <div className="admin-card-panel">
          <h3>Customer Reservations ({allBookings.length})</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Movie & Venue</th>
                  <th>Seats</th>
                  <th>Total Paid</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="code-font">{b.bookingCode}</td>
                    <td>
                      {b.user?.name || "Customer"}
                      <br />
                      <small className="text-muted">{b.user?.email}</small>
                    </td>
                    <td>
                      <strong>{b.show?.movie?.title}</strong>
                      <br />
                      <small className="text-muted">{b.show?.theatre?.name}</small>
                    </td>
                    <td className="highlight-seats">{b.seats?.join(", ")}</td>
                    <td>₹{b.totalAmount}</td>
                    <td>
                      <span className={`status-pill-sm ${b.status}`}>{b.status}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-light"
                        onClick={() => setSelectedTicket(b)}
                      >
                        View Ticket
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTicket && (
        <TicketModal
          booking={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
