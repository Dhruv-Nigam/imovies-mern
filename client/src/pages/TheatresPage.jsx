import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorText } from "../api";
import { toast } from "react-toastify";

export default function TheatresPage() {
  const [theatres, setTheatres] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTheatres = async () => {
    try {
      const { data } = await api.get("/theatres", {
        params: {
          location: selectedLocation !== "All" ? selectedLocation : undefined,
          search: search || undefined,
        },
      });
      setTheatres(data.theatres || []);
      if (data.locations) {
        setLocations(["All", ...data.locations]);
      }
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, [selectedLocation]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTheatres();
  };

  return (
    <div className="container theatres-page py-5">
      <div className="catalog-header">
        <div>
          <span className="section-eyebrow">PREMIUM VENUES</span>
          <h1 className="section-title">Cinemas & Multiplexes</h1>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search theatre by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary search-btn">
            Search
          </button>
        </form>
      </div>

      {/* Location Filter Pills */}
      <div className="filters-bar my-4">
        <div className="genre-filters">
          {locations.map((loc) => (
            <button
              key={loc}
              className={`filter-pill ${selectedLocation === loc ? "active" : ""}`}
              onClick={() => setSelectedLocation(loc)}
            >
              📍 {loc}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="page-loading">
          <div className="spinner"></div>
          <p>Loading cinema locations...</p>
        </div>
      ) : theatres.length > 0 ? (
        <div className="theatres-grid">
          {theatres.map((t) => (
            <article key={t._id} className="theatre-box-card">
              <div className="theatre-card-top">
                <span className="theatre-screen-pill">{t.screenType || "Dolby Atmos"}</span>
                <span className="theatre-seats-count">💺 {t.totalSeats || 48} Seats</span>
              </div>
              <h3 className="theatre-card-title">{t.name}</h3>
              <p className="theatre-card-city">📍 {t.location}</p>
              <p className="theatre-card-address">{t.address || "Main Boulevard"}</p>
              <div className="theatre-card-actions">
                <Link to="/" className="btn btn-outline-light btn-sm w-100">
                  Browse Movies Playing Here
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-catalog-state">
          <div className="empty-icon">🏛️</div>
          <h3>No cinemas found</h3>
          <p>Try clearing your search or city filter.</p>
        </div>
      )}
    </div>
  );
}
