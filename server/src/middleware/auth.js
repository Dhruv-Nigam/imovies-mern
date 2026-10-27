import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token = "";
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Authentication required. Please log in." });
    }

    const secret = process.env.JWT_SECRET || "imovies_super_secure_secret_key_2026";
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ message: "Session expired or invalid token. Please log in again." });
    }

    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ message: "Account associated with this token no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access forbidden. Administrator privileges required." });
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = "";
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
      const secret = process.env.JWT_SECRET || "imovies_super_secure_secret_key_2026";
      const decoded = jwt.verify(token, secret);
      req.user = await User.findById(decoded.id).select("-passwordHash");
    }
  } catch (err) {
    // Optional, ignore invalid token
  }
  next();
};
