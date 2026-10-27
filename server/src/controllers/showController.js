import { Show, generateSeatGrid } from "../models/Show.js";
import { Movie } from "../models/Movie.js";
import { Theatre } from "../models/Theatre.js";

export { generateSeatGrid };

export const getShows = async (req, res) => {
  try {
    const { movieId, theatreId, date } = req.query;
    const filter = { active: true };

    if (movieId) {
      filter.movie = movieId;
    }

    if (theatreId) {
      filter.theatre = theatreId;
    }

    if (date) {
      // Date in format YYYY-MM-DD
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

      filter.startsAt = { $gte: startOfDay, $lt: endOfDay };
    } else {
      // By default show current and future shows
      const now = new Date();
      now.setMinutes(now.getMinutes() - 30); // allow shows that started in last 30 mins
      filter.startsAt = { $gte: now };
    }

    const shows = await Show.find(filter)
      .populate("movie", "title posterUrl durationMins language genre rating")
      .populate("theatre", "name location address screenType")
      .sort({ startsAt: 1 });

    res.json({ shows });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch shows." });
  }
};

export const getAllShowsAdmin = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate("movie", "title posterUrl")
      .populate("theatre", "name location")
      .sort({ startsAt: -1 })
      .limit(100);
    res.json({ shows });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch shows." });
  }
};

export const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate("movie")
      .populate("theatre");

    if (!show || !show.active) {
      return res.status(404).json({ message: "Show not found or unavailable." });
    }

    res.json({ show });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to retrieve show." });
  }
};

export const createShow = async (req, res) => {
  try {
    const { movie, theatre, startsAt, price, screenType, customSeats, rows, cols } = req.body;

    if (!movie || !theatre || !startsAt || !price) {
      return res.status(400).json({ message: "Movie, Theatre, Start Time, and Base Price are required." });
    }

    const movieExists = await Movie.findById(movie);
    if (!movieExists) return res.status(400).json({ message: "Selected Movie ID does not exist." });

    const theatreExists = await Theatre.findById(theatre);
    if (!theatreExists) return res.status(400).json({ message: "Selected Theatre ID does not exist." });

    let seats = [];
    if (Array.isArray(customSeats) && customSeats.length) {
      seats = customSeats.map(s => (typeof s === "string" ? { seatId: s, status: "available" } : s));
    } else {
      const rowList = Array.isArray(rows) && rows.length ? rows : ["A", "B", "C", "D", "E", "F"];
      const colCount = Number(cols) || 8;
      seats = generateSeatGrid(rowList, colCount);
    }

    const show = await Show.create({
      movie,
      theatre,
      startsAt: new Date(startsAt),
      price: Number(price),
      screenType: screenType || theatreExists.screenType || "Dolby Atmos Premium",
      seats,
      active: true,
    });

    const populated = await Show.findById(show._id).populate("movie").populate("theatre");
    res.status(201).json({ show: populated, message: "Show scheduled successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create show." });
  }
};

export const updateShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("movie")
      .populate("theatre");
    if (!show) {
      return res.status(404).json({ message: "Show not found." });
    }
    res.json({ show, message: "Show updated successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update show." });
  }
};

export const deleteShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!show) {
      return res.status(404).json({ message: "Show not found." });
    }
    res.json({ message: "Show cancelled and hidden." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to cancel show." });
  }
};
