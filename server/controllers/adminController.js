import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import User from '../models/User.js';
import { clerkClient } from '@clerk/express';

export const isAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    if (!userId) return res.json({ success: true, isAdmin: false });

    const user = await clerkClient.users.getUser(userId);
    const userEmail = user.emailAddresses?.[0]?.emailAddress;

    const isAdmin = userEmail === process.env.ADMIN_EMAIL;
    res.json({ success: true, isAdmin });
  } catch (error) {
    console.error('isAdmin check failed:', error);
    res.json({ success: true, isAdmin: false });
  }
}

export const getDashboardData = async (req, res) => {
  try {
    const bookings = await Booking.find({ isPaid: true });
    const activeShows = await Show.find({ showDateTime: { $gte: new Date() } }).populate('movie');

    const totalUser = await User.countDocuments();

    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
      activeShows,
      totalUser
    }
    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.json({ success: false, message: "Error fetching dashboard data" });
  }
}

// API to get all shows
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } }).populate
      ('movie').sort({ showDateTime: 1 })
    res.json({ success: true, shows });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message })
  }
}

// API to get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('user').populate({
      path: "show",
      populate: { path: "movie" }
    }).sort({ createdAt: -1 })
    res.json({ success: true, bookings })
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message })
  }
}