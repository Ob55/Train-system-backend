// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  trainBooked: { type: String, required: true },
  destination: { type: String, required: true },
  paymentStatus: { type: String, default: "Pending" },
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
