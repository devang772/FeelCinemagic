import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    // Admin protection removed - allow all authenticated users
    next();
  } catch (error) {
    return res.json({ success: false, message: "not authorized" });
  }
}