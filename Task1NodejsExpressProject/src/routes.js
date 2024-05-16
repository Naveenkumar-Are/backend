

const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const models = require("./models");

const router = express.Router();

// Signup route handler
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password, firstname, lastname, dateOfBirth, country } = req.body;
        console.log("Signup request body:", req.body);
        console.log("Extracted fields:", { username, email, password, firstname, lastname, dateOfBirth, country }); // Log extracted fields

        const dateOfBirthDate = new Date(dateOfBirth);

        // Hash password
        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Password hashed successfully:", hashedPassword); // Log hashed password
        // Save user to database
        const newUser = await models.User.create({
            data: {
                username,
                email,
                password: hashedPassword,
                firstname,
                lastname,
                dateOfBirth: dateOfBirthDate,
                country,
            },
        });
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error signing up:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Signin route
router.post("/signin", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await models.User.findUnique({
            where: {
                username,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid password" });
        }
        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error("Error signing in:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/attendance", async (req, res) => {
    try {
        const { userId } = req.body;
        // Save attendance record to database
        await models.Attendance.create({
            data: {
                userId,
                present: false,
                date: new Date(),
            },
        });
        res.status(201).json({ message: "Attendance marked successfully" });
    } catch (error) {
        console.error("Error marking attendance:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
