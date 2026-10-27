import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, errorText } from "../api";
import { useAuth } from "../context/AuthContext";
import TrailerModal from "../components/TrailerModal";
import { toast } from "react-toastify";

const FALLBACK_POSTER = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";

export default function MovieDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [showTrailer, setShowTrailer] = useState(false);

  // Generate the next 4 calendar days for quick tabs
  const dateTabs = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const label =
      i === 0
        ? "Today"
        : i === 1
        ? "Tomorrow"
        : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return { dateStr, label };
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [movieRes, showsRes] = await Promise.all([
        api.get(`/movies/${id}`),
        api.get("/shows", {
          params: {
            movieId: id,
            date: selectedDate,
          },
        }),
      ]);

      setMovie(movieRes.data.movie);
      setShows(showsRes.data.shows || []);
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, selectedDate]);

  if (loading && !movie) {
    return (
      <div className="container page-loading">
        <div className="spinner"></div>
        <p>Loading movie & show details...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container text-center py-5">
        <h2>Movie not found</h2>
        <Link to="/" className="btn btn-primary mt-3">
          Back to Movies
        </Link>
      </div>
    );
  }

  // Group shows by Theatre
  const theatreMap = new Map();
  shows.forEach((show) => {
    const theatreId = show.theatre?._id || "unknown";
    if (!theatreMap.has(theatreId)) {
      theatreMap.set(theatreId, {
        theatre: show.theatre,
        shows: [],
      });
    }
    theatreMap.get(theatreId).shows.push(show);
  });

  const groupedTheatres = Array.from(theatreMap.values());

  return (
    <div className="movie-details-page">
      {/* Movie Banner Header */}
      <section
        className="movie-banner"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(16, 19, 34, 0.7) 0%, #101322 100%), url(${
            movie.bannerUrl || movie.posterUrl || FALLBACK_POSTER
          })`,
        }}
      >
        <div className="container banner-inner">
          <div className="movie-poster-large">
            <img
              src={movie.posterUrl || FALLBACK_POSTER}
              alt={movie.title}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_POSTER;
              }}
            />
          </div>

          <div className="banner-content">
            <span className="eyebrow">NOW SCREENING</span>
            <h1 className="movie-page-title">{movie.title}</h1>

            <div className="banner-badges">
              <span className="rating-pill">★ {movie.rating || 8.0} / 10</span>
              <span className="info-pill">{movie.language}</span>
              <span className="info-pill">{movie.durationMins} Mins</span>
              <span className="info-pill">
                {(movie.genre || []).join(" • ")}
              </span>
            </div>

            <p className="movie-synopsis">{movie.description}</p>

            <div className="movie-credits">
              {movie.director && (
                <p>
                  <strong>Director:</strong> {movie.director}
                </p>
              )}
              {movie.cast && movie.cast.length > 0 && (
                <p>
                  <strong>Cast:</strong> {movie.cast.join(", ")}
                </p>
              )}
            </div>

            <div className="banner-cta">
              {movie.trailerUrl && (
                <button
                  className="btn btn-outline-light"
                  onClick={() => setShowTrailer(true)}
                >
                  ▶ Watch Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Shows & Schedule Section */}
      <main className="container schedule-section">
        <div className="schedule-header">
          <h2>Select Showtime & Cinema</h2>

          {/* Date Selector Tabs */}
          <div className="date-tabs">
            {dateTabs.map((tab) => (
              <button
                key={tab.dateStr}
                className={`date-tab ${selectedDate === tab.dateStr ? "active" : ""}`}
                onClick={() => setSelectedDate(tab.dateStr)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {groupedTheatres.length > 0 ? (
          <div className="theatres-schedule-list">
            {groupedTheatres.map(({ theatre, shows: tShows }) => (
              <div key={theatre._id} className="theatre-schedule-card">
                <div className="theatre-card-header">
                  <div>
                    <h3 className="theatre-name">{theatre.name}</h3>
                    <p className="theatre-location">
                      📍 {theatre.location} • {theatre.address}
                    </p>
                  </div>
                  <span className="screen-badge">
                    {theatre.screenType || "Dolby Atmos"}
                  </span>
                </div>

                <div className="showtimes-grid">
                  {tShows.map((show) => {
                    const timeStr = new Date(show.startsAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <Link
                        key={show._id}
                        to={user ? `/shows/${show._id}` : `/login?redirect=/shows/${show._id}`}
                        className="showtime-card"
                      >
                        <div className="time-val">{timeStr}</div>
                        <div className="show-price">₹{show.price}</div>
                        <div className="screen-sub">{show.screenType}</div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-shows-card">
            <div className="empty-icon">🕒</div>
            <h3>No showtimes scheduled for this date</h3>
            <p>
              Please try selecting another date tab above, or check back later as new schedules are added daily.
            </p>
          </div>
        )}
      </main>

      {showTrailer && (
        <TrailerModal movie={movie} onClose={() => setShowTrailer(false)} />
      )}
    </div>
  );
}
