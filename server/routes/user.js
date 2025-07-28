// server/routes/user.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { wiz } = require('../utils');
const yup = require("yup");
const { sign } = require('jsonwebtoken');
const { validateToken } = require('../middlewares/auth');
require('dotenv').config();

const mapYupErrors = (err) =>
    err.errors ? err.errors.join(' ') : 'Validation failed.';
// outputs a readable error message string

router.post("/register", async (req, res) => {
    let data = req.body;
    // Validate request body
    let validationSchema = yup.object({
        name: yup.string().trim().min(3).max(50).required().matches(/^[a-zA-Z '-,.]+$/,
            "Name only allow letters, spaces and characters: ' - , ."),
        email: yup.string().trim().lowercase().email().max(50).required(),
        password: yup.string().trim().min(8).max(50).required().matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/,
            "Password at least 1 letter and 1 number")
    });
    try {
        data = await validationSchema.validate(data,
            { abortEarly: false });
        // Process valid data
        // Check email
        let user = await User.findOne({ where: { email: data.email } });
        if (user) {
            return res.status(400).json({ message: "Email already exists." });
        }
        // Hash password
        data.password = await bcrypt.hash(data.password, 10);
        // Create user
        let result = await User.create(data);
        let userInfo = { id: result.id, email: result.email, name: result.name };
        let accessToken = sign(userInfo, process.env.APP_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN });
        res.json({ accessToken, user: userInfo, message: 'Registration successful!' });
    }
    catch (err) {
        wiz(err,"Error while registering:\n")
        return res.status(400).json({ message: mapYupErrors(err) });
    }
});

router.post("/login", async (req, res) => {
    let data = req.body;
    let validationSchema = yup.object({
        email: yup.string().trim().lowercase().email().max(50).required(),
        password: yup.string().trim().min(8).max(50).required().matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/,
            "Password must have at least 1 letter and 1 number")
    });
    try {
        data = await validationSchema.validate(data, { abortEarly: false });
        // Process valid data
        // Check email and password
        let user = await User.findOne({ where: { email: data.email } });
        if (!user) {
            return res.status(400).json({ message: "Email or password is not correct." });
        }
        let match = await bcrypt.compare(data.password, user.password);
        if (!match) {
            return res.status(400).json({ message: "Email or password is not correct." });
        }
        // Fun fact:Displaying specific error messages like "Email is not correct" and "Password is not correct"
        // leads to privacy issues and security risks.
        // Return user info
        let userInfo = {
            id: user.id,
            email: user.email,
            name: user.name
        };
        let accessToken = sign(userInfo, process.env.APP_SECRET, // DEFINED IN .ENV
            { expiresIn: process.env.TOKEN_EXPIRES_IN }); // DEFINED IN .ENV
        res.json({
            accessToken: accessToken,
            user: userInfo
        });
    }
    catch (err) {
        wiz(err,"Error while logging in:\n")
        res.status(400).json({ errors: err.errors });
    }
});

module.exports = router;

router.get("/", (req, res) => {
    res.send("Can GET /user/");
});

router.get("/auth", validateToken, (req, res) => {
    let userInfo = {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name
    };
    res.json({
        user: userInfo
    });
});