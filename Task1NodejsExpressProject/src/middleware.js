// src/middleware.js

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));

module.exports = app;
