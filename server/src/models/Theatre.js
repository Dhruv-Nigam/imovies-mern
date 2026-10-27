import mongoose from "mongoose";

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Theatre name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location/City is required"],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      default: "",
    },
    screenType: {
      type: String,
      enum: ["Standard", "IMAX 3D", "4DX", "Dolby Atmos Premium"],
      default: "Dolby Atmos Premium",
    },
    totalSeats: {
      type: Number,
      default: 48,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Theatre = mongoose.model("Theatre", theatreSchema);
