import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import theatreRoutes from "./routes/theatreRoutes.js";
import showRoutes from "./routes/showRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://localhost:3000")
  .split(",")
  .map(o => o.trim());

// Middlewares
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    message: { message: "Too many requests from this IP, please try again later." },
  })
);

// Create HTTP Server & Socket.IO
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join-show", (showId) => {
    if (typeof showId === "string" && showId.length < 100) {
      socket.join("show:" + showId);
    }
  });

  socket.on("leave-show", (showId) => {
    socket.leave("show:" + showId);
  });
});

app.set("io", io);

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "IMovies Full-Stack Cinema Reservation Engine",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theatres", theatreRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/stats", statsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message || "An unexpected internal server error occurred.",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Initialize database & start server
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(port, () => {
      console.log(`===============================================`);
      console.log(`🎬 IMovies Server running at: http://localhost:${port}`);
      console.log(`📡 Socket.IO Real-Time Engine Active`);
      console.log(`⚡ Allowed Client Origins: ${allowedOrigins.join(", ")}`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.warn("Starting HTTP server in offline/pending database mode...");
    httpServer.listen(port, () => {
      console.log(`⚠️ IMovies Server running on port ${port} (Waiting for MongoDB connection)`);
    });
  }
};

startServer();

export { app, io };
