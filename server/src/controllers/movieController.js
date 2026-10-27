import { Movie } from "../models/Movie.js";

export const getMovies = async (req, res) => {
  try {
    const { search, genre, language, sort = "latest", page = 1, limit = 20 } = req.query;
    const filter = { active: true };

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { genre: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (genre && genre !== "All") {
      filter.genre = genre;
    }

    if (language && language !== "All") {
      filter.language = language;
    }

    const sortOptions = {};
    if (sort === "rating") {
      sortOptions.rating = -1;
    } else if (sort === "releaseDate") {
      sortOptions.releaseDate = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

    const [movies, total] = await Promise.all([
      Movie.find(filter)
        .sort(sortOptions)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Movie.countDocuments(filter),
    ]);

    // Also get distinct genres and languages for frontend filter pills
    const [allGenres, allLanguages] = await Promise.all([
      Movie.distinct("genre", { active: true }),
      Movie.distinct("language", { active: true }),
    ]);

    res.json({
      movies,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      genres: allGenres.filter(Boolean),
      languages: allLanguages.filter(Boolean),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch movies." });
  }
};

export const getAllMoviesAdmin = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json({ movies });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch movies." });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findOne({ _id: req.params.id, active: true });
    if (!movie) {
      return res.status(404).json({ message: "Movie not found or inactive." });
    }
    res.json({ movie });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to retrieve movie details." });
  }
};

export const createMovie = async (req, res) => {
  try {
    const { title, description, genre, language, durationMins, posterUrl, bannerUrl, trailerUrl, rating, releaseDate, director, cast } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Movie title is required." });
    }

    const movie = await Movie.create({
      title: title.trim(),
      description: description || "",
      genre: Array.isArray(genre) ? genre : (genre || "Drama").split(",").map(s => s.trim()).filter(Boolean),
      language: language || "English",
      durationMins: Number(durationMins) || 120,
      posterUrl: posterUrl || "",
      bannerUrl: bannerUrl || "",
      trailerUrl: trailerUrl || "",
      rating: Number(rating) || 8.0,
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      director: director || "",
      cast: Array.isArray(cast) ? cast : (cast || "").split(",").map(s => s.trim()).filter(Boolean),
      active: true,
    });

    res.status(201).json({ movie, message: "Movie created successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create movie." });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.genre && typeof data.genre === "string") {
      data.genre = data.genre.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (data.cast && typeof data.cast === "string") {
      data.cast = data.cast.split(",").map(s => s.trim()).filter(Boolean);
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }
    res.json({ movie, message: "Movie updated successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update movie." });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }
    // Toggle active status
    movie.active = !movie.active;
    await movie.save();

    res.json({
      message: movie.active ? "Movie restored and now visible." : "Movie archived and hidden.",
      active: movie.active,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update movie status." });
  }
};
