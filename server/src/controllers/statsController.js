import { Movie } from "../models/Movie.js";
import { Theatre } from "../models/Theatre.js";
import { Show } from "../models/Show.js";
import { Booking } from "../models/Booking.js";
import { User } from "../models/User.js";

export const getAdminStats = async (req, res) => {
  try {
    const [
      totalMovies,
      totalTheatres,
      totalShows,
      totalUsers,
      confirmedBookings,
      allBookings,
      recentBookings,
    ] = await Promise.all([
      Movie.countDocuments(),
      Theatre.countDocuments(),
      Show.countDocuments({ active: true }),
      User.countDocuments({ role: "user" }),
      Booking.find({ status: "confirmed" }),
      Booking.countDocuments(),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("user", "name email")
        .populate({
          path: "show",
          populate: [{ path: "movie", select: "title" }, { path: "theatre", select: "name" }],
        }),
    ]);

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalSeatsBooked = confirmedBookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0);

    res.json({
      stats: {
        totalMovies,
        totalTheatres,
        totalShows,
        totalUsers,
        totalBookings: allBookings,
        confirmedBookingsCount: confirmedBookings.length,
        totalRevenue,
        totalSeatsBooked,
      },
      recentBookings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load dashboard metrics." });
  }
};
