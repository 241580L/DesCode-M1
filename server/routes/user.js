// server/routes/user.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { wiz, log } = require('../utils');
const yup = require('yup');
const { sign } = require('jsonwebtoken');
const { validateToken } = require('../middlewares/auth');
require('dotenv').config();

const mapYupErrors = (err) =>
    err.errors ? err.errors.join(' ') : 'Validation failed.';
// outputs a readable error message string

// Middleware to allow only admins
function adminOnly(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.sendStatus(403);
  }
  next();
}

router.post("/register", async (req, res) => {
    let data = req.body;
    // Validate request body
    let validationSchema = yup.object({
        name: yup.string().trim().min(3).max(50).required().matches(/^[a-zA-Z '\-,.]+$/,
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
        let userInfo = { id: result.id, email: result.email, name: result.name, isAdmin: result.isAdmin };
        let accessToken = sign(userInfo, process.env.APP_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN });
        res.json({ accessToken, user: userInfo, message: 'Registration successful!' });
    }
    catch (err) {
        wiz(err, "Error while registering:\n")
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
        let user = await User.findOne({ where: { email: data.email, deleted: false } });
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
            name: user.name,
            isAdmin: user.isAdmin
        };
        let accessToken = sign(userInfo, process.env.APP_SECRET, // DEFINED IN .ENV
            { expiresIn: process.env.TOKEN_EXPIRES_IN }); // DEFINED IN .ENV
        res.json({
            accessToken: accessToken,
            user: userInfo
        });
    }
    catch (err) {
        wiz(err, "Error while logging in:\n")
        res.status(400).json({ errors: err.errors });
    }
});

// Get authenticated user's info (for auth status)
router.get("/auth", validateToken, (req, res) => {
  let userInfo = {
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    isAdmin: req.user.isAdmin,
  };
  res.json({ user: userInfo });
});

// Edit user's profile
router.put('/profile', validateToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.user.email, deleted: false } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const { name, email, originalEmail, currentPassword, newPassword } = req.body;
    log(name, email, originalEmail, currentPassword, newPassword )

    // Validate original email matches current user's email to avoid mismatches
    if (email && originalEmail !== user.email) {
      return res.status(400).json({ message: 'Original email does not match.' });
    }

    // For password change, verify currentPassword matches stored password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password.' });
      }
      const bcrypt = require('bcrypt');
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Update name and email if provided and valid
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    wiz(err, 'Error while updating user profile:\n');
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});



// Delete current user's profile (soft delete)
router.delete('/profile', validateToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.user.email, deleted: false } });
    if (!user) return res.status(404).json({ message: "User not found." });
    user.deleted = true;
    await user.save();
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    wiz(err, "Error while deleting user:\n");
    res.status(500).json({ message: "Failed to delete user." });
  }
});

// --- ADMIN ONLY ROUTES BELOW ---

// GET /user: List users (admin only)
router.get("/", validateToken, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      where: { deleted: false },
      attributes: ['id', 'name', 'email', 'isAdmin', 'createdAt', 'updatedAt']
    });
    res.json(users);
  } catch (err) {
    wiz(err, "Error fetching users:\n");
    res.status(500).json({ message: "Failed to fetch users." });
  }
});


router.get("/:id", validateToken, adminOnly, async (req, res) => {
  try {
    const users = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'isAdmin', 'createdAt', 'updatedAt']
    });
    res.json(users);
  } catch (err) {
    wiz(err, "Error fetching user:\n");
    res.status(500).json({ message: "Failed to fetch user." });
  }
});

// PUT /user/:id - Update user by ID (admin only)
router.put('/:id', validateToken, adminOnly, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);

    if (!user || user.deleted) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Allowed fields to update
    const { name, email, isAdmin } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;

    await user.save();

    res.json({ user });
  } catch (err) {
    wiz(err, `Error updating user #${id}:\n`);
    res.status(500).json({ message: 'Failed to update user.' });
  }
});

// DELETE /user/:id - Soft delete user by ID (admin only)
router.delete('/:id', validateToken, adminOnly, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);

    if (!user || user.deleted) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.deleted = true;
    await user.save();

    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    wiz(err, `Error deleting user #${id}:\n`);
    res.status(500).json({ message: 'Failed to delete user.' });
  }
});

module.exports = router;