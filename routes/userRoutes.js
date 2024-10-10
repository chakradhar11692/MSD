const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For hashing passwords
const User = require('../models/User'); // Assuming you have a User model

// Route to render the registration page
router.get('/register', (req, res) => {
    res.render('register');
});

// Route to handle user registration
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
        return res.status(400).send('User already exists');
    }

    // Create new user
    user = new User({
        username,
        email,
        password: await bcrypt.hash(password, 10) // Hash the password before saving
    });

    // Save the user to the database
    await user.save();
    res.redirect('/login');
});

// Route to render the login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Route to handle user login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send('User not found');
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).send('Invalid credentials');
    }

    // Set user session or token
    req.session.user = user; // Assuming you're using express-session

    res.redirect('/dashboard');
});

// Route to render the user dashboard
router.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('dashboard', { user: req.session.user });
});

// Route to handle logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/login');
    });
});

module.exports = router;
