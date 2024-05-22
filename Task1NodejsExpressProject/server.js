require('dotenv').config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const routes = require("./routes");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const models = require("./models");
const app = express();
const router = express.Router();
// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: "http://localhost:4200",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));


// Signup route handler
app.post("/signup", async (req, res) => {
    try {



        const { username, password, firstname, lastname, dateOfBirth, country,gender } = req.body;
        console.log("Signup request body:", req.body);
        console.log("Extracted fields:", { username, password, firstname, lastname, dateOfBirth, country ,gender}); // Log extracted fields

        const dateOfBirthDate = new Date(dateOfBirth);

        // Hash password
        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Password hashed successfully:", hashedPassword); // Log hashed password
        // Save user to database
        const newUser = await models.User.create({
            data: {
                username,
                password: hashedPassword,
                firstname,
                lastname,
                dateOfBirth: dateOfBirthDate,
                country,
                gender
            },
        });
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error signing up:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/signin", async (req, res) => {
    try {
        console.log("Request body:", req.body);
        const { username, password } = req.body;
        console.log("Received username:", username);
        console.log("Received password:", password);

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required'});
        }

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

app.post("/attendance", async (req, res) => {
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

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

