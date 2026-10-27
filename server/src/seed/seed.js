import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Movie } from "../models/Movie.js";
import { Theatre } from "../models/Theatre.js";
import { Show, generateSeatGrid } from "../models/Show.js";
import { Booking } from "../models/Booking.js";
import { sanitizeMongoUri } from "../config/db.js";

const rawUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/imovies";
const MONGO_URI = sanitizeMongoUri(rawUri);

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully! Clearing existing data...");

    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Show.deleteMany({}),
      Booking.deleteMany({}),
    ]);

    console.log("Creating default users (Admin & Demo User)...");
    const adminPasswordHash = await bcrypt.hash("admin12345", 10);
    const userPasswordHash = await bcrypt.hash("user12345", 10);

    const adminUser = await User.create({
      name: "Super Admin",
      email: "admin@imovies.com",
      passwordHash: adminPasswordHash,
      role: "admin",
      phone: "+91 9876543210",
    });

    const demoUser = await User.create({
      name: "Alex Johnson",
      email: "user@imovies.com",
      passwordHash: userPasswordHash,
      role: "user",
      phone: "+91 9123456789",
    });

    console.log("Seeding blockbusters & top-rated movies...");
    const movies = await Movie.create([
      {
        title: "Dune: Part Two",
        description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.",
        genre: ["Sci-Fi", "Adventure", "Action"],
        language: "English",
        durationMins: 166,
        posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
        rating: 8.8,
        director: "Denis Villeneuve",
        cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem"],
        releaseDate: new Date("2024-03-01"),
        active: true,
      },
      {
        title: "Oppenheimer",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
        genre: ["Biography", "Drama", "History"],
        language: "English",
        durationMins: 180,
        posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
        rating: 8.9,
        director: "Christopher Nolan",
        cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
        releaseDate: new Date("2023-07-21"),
        active: true,
      },
      {
        title: "Interstellar",
        description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
        genre: ["Sci-Fi", "Adventure", "Drama"],
        language: "English",
        durationMins: 169,
        posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
        rating: 8.7,
        director: "Christopher Nolan",
        cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
        releaseDate: new Date("2014-11-07"),
        active: true,
      },
      {
        title: "Spider-Man: Across the Spider-Verse",
        description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
        genre: ["Animation", "Action", "Adventure"],
        language: "English",
        durationMins: 140,
        posterUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=cqGjhVJWtEg",
        rating: 8.7,
        director: "Joaquim Dos Santos",
        cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
        releaseDate: new Date("2023-06-02"),
        active: true,
      },
      {
        title: "Inception",
        description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        genre: ["Action", "Sci-Fi", "Thriller"],
        language: "English",
        durationMins: 148,
        posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
        rating: 8.8,
        director: "Christopher Nolan",
        cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
        releaseDate: new Date("2010-07-16"),
        active: true,
      },
      {
        title: "Avatar: The Way of Water",
        description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race.",
        genre: ["Action", "Adventure", "Fantasy"],
        language: "English",
        durationMins: 192,
        posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
        rating: 7.6,
        director: "James Cameron",
        cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"],
        releaseDate: new Date("2022-12-16"),
        active: true,
      },
    ]);

    console.log("Seeding premium theatres & multiplexes...");
    const theatres = await Theatre.create([
      {
        name: "IMovies Grand IMAX - Central Mall",
        location: "Mumbai",
        address: "Level 4, Phoenix Palladium, Lower Parel",
        screenType: "IMAX 3D",
        totalSeats: 48,
        active: true,
      },
      {
        name: "IMovies Cinepolis - Cyber City",
        location: "Delhi NCR",
        address: "DLF Cyber Hub, Sector 24, Gurugram",
        screenType: "4DX",
        totalSeats: 48,
        active: true,
      },
      {
        name: "IMovies PVR Icon - Orion Megaplex",
        location: "Bengaluru",
        address: "Brigade Gateway, Rajajinagar",
        screenType: "Dolby Atmos Premium",
        totalSeats: 48,
        active: true,
      },
    ]);

    console.log("Scheduling shows with interactive seat matrices...");
    const now = new Date();
    const showsToInsert = [];

    // Schedule shows across theatres and movies for today and tomorrow
    theatres.forEach((theatre, tIdx) => {
      movies.slice(0, 4).forEach((movie, mIdx) => {
        // Today show
        const showToday = new Date(now);
        showToday.setHours(14 + (tIdx + mIdx) * 2, 30, 0, 0);

        // Tomorrow show
        const showTomorrow = new Date(now);
        showTomorrow.setDate(showTomorrow.getDate() + 1);
        showTomorrow.setHours(18 + tIdx, 0, 0, 0);

        [showToday, showTomorrow].forEach((showDate) => {
          const seats = generateSeatGrid(["A", "B", "C", "D", "E", "F"], 8);
          // Pre-book a couple of seats for realistic feel
          seats[2].status = "booked";
          seats[2].bookedBy = demoUser._id;
          seats[3].status = "booked";
          seats[3].bookedBy = demoUser._id;

          showsToInsert.push({
            movie: movie._id,
            theatre: theatre._id,
            startsAt: showDate,
            price: 250 + tIdx * 50,
            screenType: theatre.screenType,
            seats,
            active: true,
          });
        });
      });
    });

    const createdShows = await Show.insertMany(showsToInsert);
    console.log(`Created ${createdShows.length} upcoming shows.`);

    console.log("Creating sample user booking...");
    const firstShow = createdShows[0];
    await Booking.create({
      user: demoUser._id,
      show: firstShow._id,
      seats: ["A3", "A4"],
      seatDetails: [
        { seatId: "A3", tier: "Standard", price: firstShow.price },
        { seatId: "A4", tier: "Standard", price: firstShow.price },
      ],
      totalAmount: firstShow.price * 2 + 30,
      convenienceFee: 30,
      status: "confirmed",
      paymentStatus: "mock-paid",
      paymentMethod: "mock_upi",
      bookingCode: `IMV-${Date.now().toString().slice(-4)}-DEMO1`,
    });

    console.log("==================================================");
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("==================================================");
    console.log("Default Admin Account:");
    console.log("  Email:    admin@imovies.com");
    console.log("  Password: admin12345");
    console.log("");
    console.log("Default Demo User:");
    console.log("  Email:    user@imovies.com");
    console.log("  Password: user12345");
    console.log("==================================================");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed with error:", error);
    process.exit(1);
  }
};

seedDatabase();
