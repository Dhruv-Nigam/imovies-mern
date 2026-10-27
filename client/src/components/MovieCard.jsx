import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_POSTER = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";

export default function MovieCard({ movie, onWatchTrailer }) {
  const genres = Array.isArray(movie.genre) ? movie.genre : [];

  return (
    <article className="movie-card">
      <div className="poster-wrap">
        <img
          src={movie.posterUrl || FALLBACK_POSTER}
          alt={movie.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_POSTER;
          }}
        />
        {movie.rating && (
          <div className="rating-badge">
            <span className="star">★</span> {movie.rating.toFixed(1)}
          </div>
        )}
        <div className="hover-overlay">
          {movie.trailerUrl && (
            <button
              className="btn btn-sm btn-light trailer-btn"
              onClick={() => onWatchTrailer && onWatchTrailer(movie)}
            >
              ▶ Watch Trailer
            </button>
          )}
          <Link to={`/movies/${movie._id}`} className="btn btn-sm btn-primary view-btn">
            View Shows
          </Link>
        </div>
      </div>

      <div className="movie-info">
        <h3 className="movie-title" title={movie.title}>
          {movie.title}
        </h3>
        <div className="movie-meta">
          <span>{movie.language || "English"}</span>
          <span>•</span>
          <span>{movie.durationMins || 120} mins</span>
        </div>
        <div className="genre-tags">
          {genres.slice(0, 3).map((g, idx) => (
            <span key={idx} className="genre-pill">
              {g}
            </span>
          ))}
        </div>
        <Link to={`/movies/${movie._id}`} className="btn btn-primary w-100 book-action-btn">
          Book Tickets
        </Link>
      </div>
    </article>
  );
}
