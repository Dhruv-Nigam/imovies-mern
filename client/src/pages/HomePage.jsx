import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorText } from "../api";
import MovieCard from "../components/MovieCard";
import TrailerModal from "../components/TrailerModal";

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTrailerMovie, setActiveTrailerMovie] = useState(null);

  const fetchMovies = async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/movies", {
        params: {
          search: params.search ?? search,
          genre: params.genre ?? selectedGenre,
          language: params.language ?? selectedLanguage,
          sort: params.sort ?? sortBy,
        },
      });

      setMovies(res.data.movies || []);
      if (!featuredMovie && res.data.movies && res.data.movies.length > 0) {
        setFeaturedMovie(res.data.movies[0]);
      }
      if (res.data.genres) setGenres(["All", ...res.data.genres]);
      if (res.data.languages) setLanguages(["All", ...res.data.languages]);
      setError("");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre, selectedLanguage, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMovies({ search });
  };

  return (
    <div className="home-page">
      {/* Hero Spotlight Section */}
      {featuredMovie && (
        <section
          className="hero-spotlight"
          style={{
            backgroundImage: `linear-gradient(to right, #101322 25%, rgba(16, 19, 34, 0.85) 60%, rgba(16, 19, 34, 0.4) 100%), url(${
              featuredMovie.bannerUrl || featuredMovie.posterUrl
            })`,
          }}
        >
          <div className="container hero-container">
            <div className="hero-content">
              <span className="featured-pill">FEATURED PREMIERE</span>
              <h1 className="hero-title">{featuredMovie.title}</h1>
              <div className="hero-meta">
                <span className="rating-tag">★ {featuredMovie.rating || 8.5}</span>
                <span>{featuredMovie.language}</span>
                <span>•</span>
                <span>{featuredMovie.durationMins} Mins</span>
                <span>•</span>
                <span>{(featuredMovie.genre || []).join(", ")}</span>
              </div>
              <p className="hero-desc">{featuredMovie.description}</p>
              <div className="hero-actions">
                <Link to={`/movies/${featuredMovie._id}`} className="btn btn-primary btn-lg">
                  🎟️ Book Tickets
                </Link>
                {featuredMovie.trailerUrl && (
                  <button
                    className="btn btn-outline-light btn-lg"
                    onClick={() => setActiveTrailerMovie(featuredMovie)}
                  >
                    ▶ Watch Trailer
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Browse Section */}
      <main className="container catalog-section">
        <div className="catalog-header">
          <div>
            <span className="section-eyebrow">EXPLORE MOVIES</span>
            <h2 className="section-title">Now Showing In Cinemas</h2>
          </div>

          {/* Search Bar */}
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search by title, director, keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary search-btn">
              Search
            </button>
            {search && (
              <button
                type="button"
                className="btn btn-link clear-search-btn"
                onClick={() => {
                  setSearch("");
                  fetchMovies({ search: "" });
                }}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Filter Controls */}
        <div className="filters-bar">
          <div className="genre-filters">
            {genres.map((g) => (
              <button
                key={g}
                className={`filter-pill ${selectedGenre === g ? "active" : ""}`}
                onClick={() => setSelectedGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="sort-dropdowns">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Languages</option>
              {languages
                .filter((l) => l !== "All")
                .map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="latest">Sort: Latest</option>
              <option value="rating">Sort: Top Rated</option>
              <option value="releaseDate">Sort: Release Date</option>
            </select>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="alert alert-warning my-4">
            <strong>Notice:</strong> {error}. Ensure your MongoDB connection and backend server are active.
          </div>
        )}

        {/* Movies Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading cinema experiences...</p>
          </div>
        ) : movies.length > 0 ? (
          <div className="movies-grid">
            {movies.map((movie) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onWatchTrailer={(m) => setActiveTrailerMovie(m)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-catalog-state">
            <div className="empty-icon">🎬</div>
            <h3>No movies found</h3>
            <p>Try adjusting your search query or genre filter.</p>
            <div className="seed-helper-tip">
              <strong>Tip for developers:</strong> If this is your first run, execute <code>npm run seed</code> in the <code>server</code> directory to automatically populate movies, theatres, and shows!
            </div>
          </div>
        )}
      </main>

      {/* Trailer Modal */}
      {activeTrailerMovie && (
        <TrailerModal
          movie={activeTrailerMovie}
          onClose={() => setActiveTrailerMovie(null)}
        />
      )}
    </div>
  );
}
