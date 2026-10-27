import React from "react";

export default function TicketModal({ booking, onClose }) {
  if (!booking) return null;

  const show = booking.show || {};
  const movie = show.movie || {};
  const theatre = show.theatre || {};

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = show.startsAt
    ? new Date(show.startsAt).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const formattedTime = show.startsAt
    ? new Date(show.startsAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="ticket-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="ticket-pass printable-ticket">
          {/* Ticket Header */}
          <div className="ticket-header">
            <div className="ticket-brand">
              <span>🎬</span> IMOVIES PASS
            </div>
            <div className="ticket-status-pill confirmed">
              {booking.status?.toUpperCase() || "CONFIRMED"}
            </div>
          </div>

          {/* Ticket Main Details */}
          <div className="ticket-body">
            <div className="ticket-movie-details">
              <h2 className="ticket-movie-title">{movie.title || "Cinema Experience"}</h2>
              <p className="ticket-theatre">
                <strong>{theatre.name || "IMovies Cinema"}</strong>
                <br />
                <span className="text-muted">{theatre.location || "Indore"} • {show.screenType || "Dolby Atmos"}</span>
              </p>
            </div>

            <div className="ticket-meta-grid">
              <div className="meta-box">
                <span className="meta-label">DATE</span>
                <span className="meta-value">{formattedDate}</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">TIME</span>
                <span className="meta-value">{formattedTime}</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">SEATS</span>
                <span className="meta-value highlight-seats">
                  {booking.seats?.join(", ") || "None"}
                </span>
              </div>
              <div className="meta-box">
                <span className="meta-label">TOTAL PAID</span>
                <span className="meta-value">₹{booking.totalAmount}</span>
              </div>
            </div>

            <div className="ticket-perforated-line">
              <div className="cut-circle left"></div>
              <div className="dashed-line"></div>
              <div className="cut-circle right"></div>
            </div>

            {/* Ticket Stub / Barcode */}
            <div className="ticket-stub">
              <div className="stub-info">
                <span className="meta-label">BOOKING ID</span>
                <span className="booking-code">{booking.bookingCode}</span>
                <small className="payment-note">Payment: {booking.paymentStatus} (Simulated)</small>
              </div>

              {/* Simulated QR Code / Barcode visualization */}
              <div className="qr-sim">
                <div className="qr-square">
                  <div className="qr-inner">
                    <span className="qr-icon">🎫</span>
                  </div>
                </div>
                <div className="barcode-bars">
                  <div className="bar thin"></div>
                  <div className="bar thick"></div>
                  <div className="bar med"></div>
                  <div className="bar thick"></div>
                  <div className="bar thin"></div>
                  <div className="bar med"></div>
                  <div className="bar thick"></div>
                  <div className="bar thin"></div>
                  <div className="bar med"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Footer Action */}
          <div className="ticket-actions no-print">
            <button className="btn btn-outline-light" onClick={handlePrint}>
              🖨️ Print Ticket
            </button>
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
