import 'dotenv/config';
import connectDB from '../configs/db.js';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';

await connectDB();

// Remove phantom bookings where user is null/undefined/string 'undefined'
const deleted = await Booking.deleteMany({ user: { $in: [null, 'undefined', ''] } });
console.log('Deleted phantom bookings:', deleted.deletedCount);

// Clear occupiedSeats on all shows — reset to clean state
const reset = await Show.updateMany({}, { $set: { occupiedSeats: {} } });
console.log('Reset occupiedSeats on', reset.modifiedCount, 'shows');

console.log('Cleanup complete!');
process.exit(0);
