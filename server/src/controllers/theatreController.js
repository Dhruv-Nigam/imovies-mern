import { Theatre } from "../models/Theatre.js";
import { Show } from "../models/Show.js";

export const getTheatres = async (req, res) => {
  try {
    const { location, search } = req.query;
    const filter = { active: true };

    if (location && location !== "All") {
      filter.location = new RegExp(location.trim(), "i");
    }

    if (search && search.trim()) {
      filter.$or = [
        { name: new RegExp(search.trim(), "i") },
        { location: new RegExp(search.trim(), "i") },
        { address: new RegExp(search.trim(), "i") },
      ];
    }

    const theatres = await Theatre.find(filter).sort({ name: 1 });
    const locations = await Theatre.distinct("location", { active: true });

    res.json({ theatres, locations: locations.filter(Boolean) });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch theatres." });
  }
};

export const getTheatreById = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({ message: "Theatre not found." });
    }
    res.json({ theatre });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to retrieve theatre." });
  }
};

export const createTheatre = async (req, res) => {
  try {
    const { name, location, address, screenType, totalSeats } = req.body;
    if (!name?.trim() || !location?.trim()) {
      return res.status(400).json({ message: "Theatre name and location/city are required." });
    }

    const theatre = await Theatre.create({
      name: name.trim(),
      location: location.trim(),
      address: address?.trim() || "",
      screenType: screenType || "Dolby Atmos Premium",
      totalSeats: Number(totalSeats) || 48,
      active: true,
    });

    res.status(201).json({ theatre, message: "Theatre created successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create theatre." });
  }
};

export const updateTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!theatre) {
      return res.status(404).json({ message: "Theatre not found." });
    }
    res.json({ theatre, message: "Theatre updated successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update theatre." });
  }
};

export const deleteTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);
    if (!theatre) {
      return res.status(404).json({ message: "Theatre not found." });
    }
    // Also deactivate future shows for this theatre
    await Show.updateMany({ theatre: req.params.id }, { active: false });
    res.json({ message: "Theatre and associated shows removed." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete theatre." });
  }
};
