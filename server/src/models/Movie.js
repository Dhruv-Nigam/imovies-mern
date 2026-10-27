import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    genre: {
      type: [String],
      default: ["Drama"],
    },
    language: {
      type: String,
      default: "English",
    },
    durationMins: {
      type: Number,
      default: 120,
      min: 1,
    },
    posterUrl: {
      type: String,
      default: "",
    },
    bannerUrl: {
      type: String,
      default: "",
    },
    trailerUrl: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 8.5,
      min: 0,
      max: 10,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    director: {
      type: String,
      default: "",
    },
    cast: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

movieSchema.index({ title: "text", description: "text", director: "text" });

export const Movie = mongoose.model("Movie", movieSchema);
