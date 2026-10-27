import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { api, errorText } from "../api";
import { useAuth } from "../context/AuthContext";
import TicketModal from "../components/TicketModal";
import { toast } from "react-toastify";

export default function SeatSelectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("mock_upi");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const fetchShow = async () => {
    try {
      const { data } = await api.get(`/shows/${id}`);
      setShow(data.show);
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShow();

    // Socket.IO real-time connection for seat concurrency
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });

    socket.emit("join-show", id);

    socket.on("seats-updated", (payload) => {
      if (payload.showId === id) {
        toast.info("Seat availability updated in real-time.");
        fetchShow();
        // Remove any seats from current selection that were booked by someone else
        const bookedSeatIds = new Set(
          payload.seats.filter((s) => s.status === "booked").map((s) => s.seatId)
        );
        setSelectedSeats((prev) => prev.filter((seatId) => !bookedSeatIds.has(seatId)));
      }
    });

    return () => {
      socket.emit("leave-show", id);
      socket.disconnect();
    };
  }, [id]);

  const toggleSeat = (seat) => {
    if (seat.status === "booked") return;
    const seatId = seat.seatId;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 8) {
        toast.warning("Maximum 8 seats allowed per transaction.");
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // Group seats by Row (A, B, C, D, etc.)
  const seatsByRow = {};
  if (show && show.seats) {
    show.seats.forEach((seat) => {
      const rowKey = seat.row || seat.seatId.charAt(0);
      if (!seatsByRow[rowKey]) {
        seatsByRow[rowKey] = [];
      }
      seatsByRow[rowKey].push(seat);
    });
  }

  // Calculate pricing breakdown
  const seatMap = new Map();
  if (show && show.seats) {
    show.seats.forEach((s) => seatMap.set(s.seatId, s));
  }

  let subtotal = 0;
  selectedSeats.forEach((seatId) => {
    const s = seatMap.get(seatId);
    const multiplier = s?.priceMultiplier || 1.0;
    subtotal += Math.round(show.price * multiplier);
  });
  const convenienceFee = selectedSeats.length > 0 ? 30 : 0;
  const grandTotal = subtotal + convenienceFee;

  const handleBooking = async () => {
    if (!user) {
      toast.warning("Please sign in to confirm your booking.");
      navigate(`/login?redirect=/shows/${id}`);
      return;
    }

    if (selectedSeats.length === 0) {
      toast.warning("Please choose at least one seat.");
      return;
    }

    setBookingLoading(true);
    try {
      const { data } = await api.post("/bookings", {
        showId: id,
        seats: selectedSeats,
        paymentMethod,
      });

      toast.success(data.message || "Booking successfully confirmed!");
      setConfirmedBooking(data.booking);
    } catch (err) {
      toast.error(errorText(err));
      // Refresh current seats
      fetchShow();
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading || !show) {
    return (
      <div className="container page-loading">
        <div className="spinner"></div>
        <p>Loading interactive theatre seating plan...</p>
      </div>
    );
  }

  return (
    <div className="seat-selection-page">
      <div className="container">
        {/* Top Info Bar */}
        <div className="show-info-bar">
          <div>
            <h1 className="show-movie-title">{show.movie?.title}</h1>
            <p className="show-subtext">
              {show.theatre?.name} • {show.theatre?.location} •{" "}
              {new Date(show.startsAt).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="show-screen-tag">
            <span>SCREEN:</span> {show.screenType || "Dolby Atmos 3D"}
          </div>
        </div>

        <div className="seat-booking-layout">
          {/* Main Seating Cinema Area */}
          <section className="cinema-hall">
            {/* Curved Screen Visualization */}
            <div className="screen-container">
              <div className="curved-screen"></div>
              <div className="screen-glow"></div>
              <p className="screen-text">ALL EYES THIS WAY • CINEMA SCREEN</p>
            </div>

            {/* Seat Matrix Grid */}
            <div className="seats-matrix">
              {Object.keys(seatsByRow)
                .sort()
                .map((rowKey) => {
                  const rowSeats = seatsByRow[rowKey].sort((a, b) => a.col - b.col);
                  const firstSeat = rowSeats[0];
                  const tier = firstSeat?.tier || "Standard";

                  return (
                    <div key={rowKey} className="seat-row">
                      <div className="row-label">{rowKey}</div>
                      <div className="row-seats-group">
                        {rowSeats.map((seat) => {
                          const isSelected = selectedSeats.includes(seat.seatId);
                          const isBooked = seat.status === "booked";

                          return (
                            <button
                              key={seat.seatId}
                              disabled={isBooked}
                              className={`seat-btn tier-${seat.tier?.toLowerCase() || "standard"} ${
                                isBooked ? "booked" : ""
                              } ${isSelected ? "selected" : ""}`}
                              onClick={() => toggleSeat(seat)}
                              title={`${seat.seatId} (${seat.tier}) - ₹${Math.round(
                                show.price * (seat.priceMultiplier || 1.0)
                              )}`}
                            >
                              {seat.col}
                            </button>
                          );
                        })}
                      </div>
                      <div className="tier-label-inline">{tier}</div>
                    </div>
                  );
                })}
            </div>

            {/* Seat Legend */}
            <div className="seat-legend">
              <div className="legend-item">
                <span className="legend-box available"></span>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <span className="legend-box selected"></span>
                <span>Selected</span>
              </div>
              <div className="legend-item">
                <span className="legend-box booked"></span>
                <span>Sold Out</span>
              </div>
              <div className="legend-item">
                <span className="legend-badge vip">VIP Recliner (₹{Math.round(show.price * 1.5)})</span>
              </div>
              <div className="legend-item">
                <span className="legend-badge premium">Premium (₹{Math.round(show.price * 1.25)})</span>
              </div>
              <div className="legend-item">
                <span className="legend-badge standard">Standard (₹{show.price})</span>
              </div>
            </div>
          </section>

          {/* Checkout & Summary Sidebar */}
          <aside className="booking-summary-sidebar">
            <div className="summary-card">
              <h3>Booking Summary</h3>
              <hr className="divider" />

              <div className="summary-movie-info">
                <h4>{show.movie?.title}</h4>
                <p className="text-muted">{show.theatre?.name}</p>
                <small>
                  {new Date(show.startsAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>

              <div className="selected-seats-chip-area">
                <span className="summary-label">Selected Seats:</span>
                {selectedSeats.length > 0 ? (
                  <div className="selected-chips">
                    {selectedSeats.map((s) => (
                      <span key={s} className="seat-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="no-seats-text">No seats selected yet</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Tickets Subtotal ({selectedSeats.length})</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="price-row">
                  <span>Convenience & Tax</span>
                  <span>₹{convenienceFee}</span>
                </div>
                <div className="price-row total-row">
                  <span>Grand Total</span>
                  <span className="grand-price">₹{grandTotal}</span>
                </div>
              </div>

              {/* Mock Payment Selector */}
              <div className="payment-options">
                <span className="summary-label">Payment Method:</span>
                <label className="payment-radio">
                  <input
                    type="radio"
                    name="payment"
                    value="mock_upi"
                    checked={paymentMethod === "mock_upi"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>UPI / QR (Instant Mock Pay)</span>
                </label>
                <label className="payment-radio">
                  <input
                    type="radio"
                    name="payment"
                    value="mock_card"
                    checked={paymentMethod === "mock_card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Credit / Debit Card (Mock)</span>
                </label>
                <label className="payment-radio">
                  <input
                    type="radio"
                    name="payment"
                    value="mock_netbanking"
                    checked={paymentMethod === "mock_netbanking"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Net Banking (Mock)</span>
                </label>
              </div>

              <button
                className="btn btn-primary w-100 confirm-booking-btn"
                disabled={selectedSeats.length === 0 || bookingLoading}
                onClick={handleBooking}
              >
                {bookingLoading ? (
                  "Processing Reservation..."
                ) : (
                  `Pay ₹${grandTotal} & Confirm`
                )}
              </button>

              <small className="mock-note">
                🔒 Safe Demo Mode: No actual bank charges will occur.
              </small>
            </div>
          </aside>
        </div>
      </div>

      {/* Ticket Modal popup upon successful booking */}
      {confirmedBooking && (
        <TicketModal
          booking={confirmedBooking}
          onClose={() => {
            setConfirmedBooking(null);
            navigate("/bookings");
          }}
        />
      )}
    </div>
  );
}
