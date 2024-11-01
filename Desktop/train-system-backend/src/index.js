const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/trainSystem", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Define User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  userId: { type: String, required: true, unique: true }
});

const User = mongoose.model("User", userSchema);

// Define Train Schema
const trainSchema = new mongoose.Schema({
  driverName: String,
  trainName: String,
  trainNumber: String,
  destination: String,
  departureTime: String,
  arrivalTime: String,
  status: String,
});

const Train = mongoose.model("Train", trainSchema);

// Define Booking Schema
const bookingSchema = new mongoose.Schema({
  userId: String,
  name: String,
  phone: String,
  email: String,
  trainBooked: String,
  destination: String,
  departureTime: String,
  arrivalTime: String,
  paymentStatus: String,
});

const Booking = mongoose.model("Booking", bookingSchema);

// Predefined users
const predefinedUsers = [
  { email: "Admin@gmail.com", password: "1234567", role: "admin", userId: "1" },
  { email: "customer@gmail.com", password: "1234567", role: "customer", userId: "2" }
];

// Hash the password before saving
const hashPassword = async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  return user;
};

// Save predefined users to the database
const savePredefinedUsers = async () => {
  for (const user of predefinedUsers) {
    const existingUser = await User.findOne({ email: user.email });
    if (!existingUser) {
      const newUser = await hashPassword(new User(user));
      await newUser.save();
    }
  }
};

// Initialize the predefined users in the database
savePredefinedUsers().catch(console.error);

// Secret key for JWT
const JWT_SECRET = "your_jwt_secret_key"; 

// Routes

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user.userId, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  const dashboardUrl = user.role === 'admin' ? '/admin-dashboard' : '/customer-dashboard';

  console.log(`User ${user.email} logged in successfully.`);
  res.status(200).json({ message: "Login successful", token, dashboardUrl });
});

// Get all trains
app.get("/trains", async (req, res) => {
  try {
    const trains = await Train.find();
    res.json(trains);
  } catch (error) {
    console.error("Error fetching trains:", error);
    res.status(500).json({ message: "Error fetching trains" });
  }
});

// Add a new train
app.post("/trains", async (req, res) => {
  try {
    const newTrain = new Train(req.body);
    await newTrain.save();
    res.json(newTrain);
  } catch (error) {
    console.error("Error adding new train:", error);
    res.status(500).json({ message: "Error adding new train" });
  }
});

// Get bookings, filtered by userId if provided
app.get("/bookings", async (req, res) => {
  const { userId } = req.query; // Get userId from query parameters
  try {
    const query = userId ? { userId } : {}; // Filter by userId if provided
    const bookings = await Booking.find(query);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// Create a new booking
app.post("/bookings", async (req, res) => {
  const booking = new Booking(req.body);
  try {
    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Error creating booking" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
