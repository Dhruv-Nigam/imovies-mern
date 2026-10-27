import { Booking } from "../models/Booking.js";
import { Show } from "../models/Show.js";

export const createBooking = async (req, res) => {
  try {
    const { showId, seats, paymentMethod = "mock_upi" } = req.body;

    if (!showId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "Please select at least one seat to book." });
    }

    const uniqueWanted = [...new Set(seats.map(s => String(s).trim()))];
    if (uniqueWanted.length !== seats.length) {
      return res.status(400).json({ message: "Duplicate seats detected in selection." });
    }

    const show = await Show.findOne({ _id: showId, active: true });
    if (!show) {
      return res.status(404).json({ message: "Show not found or inactive." });
    }

    if (new Date(show.startsAt) < new Date()) {
      return res.status(400).json({ message: "Cannot book seats for a past showtime." });
    }

    // Verify requested seats exist in show
    const existingSeatMap = new Map();
    show.seats.forEach(s => existingSeatMap.set(s.seatId, s));

    const seatDetails = [];
    let seatsTotal = 0;

    for (const seatId of uniqueWanted) {
      const seatObj = existingSeatMap.get(seatId);
      if (!seatObj) {
        return res.status(400).json({ message: `Seat ${seatId} does not exist in this theatre layout.` });
      }
      if (seatObj.status === "booked") {
        return res.status(409).json({ message: `Seat ${seatId} is already booked. Please choose another seat.` });
      }
      const seatPrice = Math.round(show.price * (seatObj.priceMultiplier || 1.0));
      seatDetails.push({
        seatId,
        tier: seatObj.tier || "Standard",
        price: seatPrice,
      });
      seatsTotal += seatPrice;
    }

    const convenienceFee = 30; // standard fee
    const totalAmount = seatsTotal + convenienceFee;

    // Concurrency protection: Atomic conditional update
    const clauses = uniqueWanted.map(seatId => ({
      seats: { $elemMatch: { seatId, status: "available" } },
    }));

    const updateSet = {};
    uniqueWanted.forEach(id => {
      const index = show.seats.findIndex(s => s.seatId === id);
      if (index !== -1) {
        updateSet[`seats.${index}.status`] = "booked";
        updateSet[`seats.${index}.bookedBy`] = req.user._id;
      }
    });

    const claimedShow = await Show.findOneAndUpdate(
      { _id: showId, $and: clauses },
      { $set: updateSet },
      { new: true }
    );

    if (!claimedShow) {
      return res.status(409).json({ message: "One or more seats were just booked by another user. Please reselect." });
    }

    try {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const bookingCode = `IMV-${Date.now().toString().slice(-4)}-${randomSuffix}`;

      const booking = await Booking.create({
        user: req.user._id,
        show: showId,
        seats: uniqueWanted,
        seatDetails,
        totalAmount,
        convenienceFee,
        status: "confirmed",
        paymentStatus: "mock-paid",
        paymentMethod,
        bookingCode,
      });

      // Socket.IO real-time broadcast
      const io = req.app.get("io");
      if (io) {
        io.to("show:" + showId).emit("seats-updated", {
          showId,
          seats: claimedShow.seats.map(s => ({ seatId: s.seatId, status: s.status })),
        });
      }

      const populatedBooking = await Booking.findById(booking._id).populate({
        path: "show",
        populate: [
          { path: "movie", select: "title posterUrl durationMins language genre" },
          { path: "theatre", select: "name location address screenType" },
        ],
      });

      res.status(201).json({
        booking: populatedBooking,
        message: "Booking confirmed! A simulated digital ticket has been issued.",
      });
    } catch (bookingError) {
      // Rollback claimed seats if booking document creation failed
      const undoSet = {};
      uniqueWanted.forEach(id => {
        const index = show.seats.findIndex(s => s.seatId === id);
        if (index !== -1) {
          undoSet[`seats.${index}.status`] = "available";
          undoSet[`seats.${index}.bookedBy`] = null;
        }
      });
      await Show.updateOne({ _id: showId }, { $set: undoSet });
      throw bookingError;
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to complete booking." });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: "show",
        populate: [
          { path: "movie", select: "title posterUrl durationMins language genre" },
          { path: "theatre", select: "name location address screenType" },
        ],
      })
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch bookings." });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email phone")
      .populate({
        path: "show",
        populate: [
          { path: "movie", select: "title posterUrl" },
          { path: "theatre", select: "name location" },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch all bookings." });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      ...(req.user.role !== "admin" ? { user: req.user._id } : {}),
    }).populate({
      path: "show",
      populate: [
        { path: "movie" },
        { path: "theatre" },
      ],
    }).populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json({ message: "Booking ticket not found." });
    }

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch ticket." });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      ...(req.user.role !== "admin" ? { user: req.user._id } : {}),
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "This booking is already cancelled." });
    }

    const show = await Show.findById(booking.show);
    if (!show) {
      return res.status(404).json({ message: "Associated show not found." });
    }

    // Release seats
    show.seats.forEach(seat => {
      if (booking.seats.includes(seat.seatId)) {
        seat.status = "available";
        seat.bookedBy = null;
      }
    });

    await show.save();

    booking.status = "cancelled";
    booking.paymentStatus = "refunded";
    await booking.save();

    // Broadcast updated seats
    const io = req.app.get("io");
    if (io) {
      io.to("show:" + show._id).emit("seats-updated", {
        showId: String(show._id),
        seats: show.seats.map(s => ({ seatId: s.seatId, status: s.status })),
      });
    }

    res.json({
      booking,
      message: "Booking successfully cancelled. Mock refund processed to original payment method.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to cancel booking." });
  }
};
