import mongoose from "mongoose";

const seatItemSchema = new mongoose.Schema(
  {
    seatId: { type: String, required: true }, // e.g., "A1", "B4"
    row: { type: String, default: "A" },
    col: { type: Number, default: 1 },
    tier: { type: String, enum: ["Standard", "Premium", "VIP"], default: "Standard" },
    priceMultiplier: { type: Number, default: 1.0 },
    status: { type: String, enum: ["available", "booked"], default: "available" },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { _id: false }
);

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie reference is required"],
      index: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: [true, "Theatre reference is required"],
      index: true,
    },
    startsAt: {
      type: Date,
      required: [true, "Showtime start date and time is required"],
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Base ticket price is required"],
      min: 0,
    },
    screenType: {
      type: String,
      default: "Dolby Atmos Premium",
    },
    seats: [seatItemSchema],
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

showSchema.index({ movie: 1, startsAt: 1 });
showSchema.index({ theatre: 1, startsAt: 1 });

// Helper to generate a realistic cinema seating layout
export const generateSeatGrid = (rows = ["A", "B", "C", "D", "E", "F"], cols = 8) => {
  const seats = [];
  rows.forEach((rowLetter, rIndex) => {
    let tier = "Standard";
    let mult = 1.0;
    if (rIndex >= 2 && rIndex <= 3) {
      tier = "Premium";
      mult = 1.25;
    } else if (rIndex >= 4) {
      tier = "VIP";
      mult = 1.5;
    }

    for (let c = 1; c <= cols; c++) {
      seats.push({
        seatId: `${rowLetter}${c}`,
        row: rowLetter,
        col: c,
        tier,
        priceMultiplier: mult,
        status: "available",
        bookedBy: null,
      });
    }
  });
  return seats;
};

export const Show = mongoose.model("Show", showSchema);
