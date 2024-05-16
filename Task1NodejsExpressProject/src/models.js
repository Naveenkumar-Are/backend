// src/models.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const models = {
    User: prisma.user,
    Attendance: prisma.attendance,
};

module.exports = models;
