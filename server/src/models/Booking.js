import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
      index: true,
    },
    seats: {
      type: [String],
      required: true,
      validate: [val => val.length > 0, "At least one seat must be selected"],
    },
    seatDetails: [
      {
        _id: false,
        seatId: String,
        tier: String,
        price: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    convenienceFee: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["mock-paid", "refunded"],
      default: "mock-paid",
    },
    paymentMethod: {
      type: String,
      enum: ["mock_card", "mock_upi", "mock_netbanking"],
      default: "mock_upi",
    },
    bookingCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);
