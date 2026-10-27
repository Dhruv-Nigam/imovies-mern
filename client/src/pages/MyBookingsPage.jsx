import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorText } from "../api";
import TicketModal from "../components/TicketModal";
import { toast } from "react-toastify";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get("/bookings/my");
      setBookings(data.bookings || []);
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation? The seats will be released immediately.")) {
      return;
    }

    try {
      const { data } = await api.post(`/bookings/${bookingId}/cancel`);
      toast.success(data.message || "Booking cancelled and refund processed.");
      fetchBookings();
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  if (loading) {
    return (
      <div className="container page-loading">
        <div className="spinner"></div>
        <p>Loading your tickets...</p>
      </div>
    );
  }

  return (
    <div className="container my-bookings-page">
      <div className="bookings-header">
        <div>
          <span className="section-eyebrow">USER PORTAL</span>
          <h1 className="section-title">My Tickets & Bookings</h1>
        </div>
        <Link to="/" className="btn btn-outline-light">
          + Book Another Movie
        </Link>
      </div>

      {bookings.length > 0 ? (
        <div className="bookings-list">
          {bookings.map((b) => {
            const show = b.show || {};
            const movie = show.movie || {};
            const theatre = show.theatre || {};
            const isConfirmed = b.status === "confirmed";

            return (
              <article key={b._id} className={`booking-history-card ${b.status}`}>
                <div className="card-poster-stub">
                  <img
                    src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80"}
                    alt={movie.title}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80";
                    }}
                  />
                </div>

                <div className="card-booking-body">
                  <div className="card-top-row">
                    <div>
                      <h3 className="booking-movie-title">{movie.title || "Cinema Movie"}</h3>
                      <p className="theatre-sub">
                        {theatre.name} • {theatre.location}
                      </p>
                    </div>
                    <span className={`status-pill ${b.status}`}>
                      {b.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="booking-details-grid">
                    <div>
                      <span className="detail-label">SHOWTIME:</span>
                      <p className="detail-value">
                        {show.startsAt
                          ? new Date(show.startsAt).toLocaleString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <span className="detail-label">SEATS:</span>
                      <p className="detail-value highlight-seats">
                        {b.seats?.join(", ") || "None"}
                      </p>
                    </div>

                    <div>
                      <span className="detail-label">TOTAL AMOUNT:</span>
                      <p className="detail-value">₹{b.totalAmount}</p>
                    </div>

                    <div>
                      <span className="detail-label">BOOKING ID:</span>
                      <p className="detail-value code-font">{b.bookingCode}</p>
                    </div>
                  </div>

                  <div className="card-actions-row">
                    <button
                      className="btn btn-outline-light btn-sm"
                      onClick={() => setSelectedTicket(b)}
                    >
                      🎫 View Digital Ticket
                    </button>

                    {isConfirmed && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleCancelBooking(b._id)}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-bookings-box">
          <div className="empty-icon">🎟️</div>
          <h3>No bookings found yet</h3>
          <p>
            You haven't reserved any cinema tickets yet. Explore our latest blockbuster releases and choose your seats!
          </p>
          <Link to="/" className="btn btn-primary mt-3">
            Browse Movies Now
          </Link>
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
