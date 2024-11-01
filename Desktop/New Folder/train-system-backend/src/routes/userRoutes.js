const express = require('express');
const User = require('../models/User'); // Adjust the path as necessary
const jwt = require('jsonwebtoken');
const router = express.Router();

// POST route for user registration (example)
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

// POST route for user login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Use the comparePassword method to validate the password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create a token
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
