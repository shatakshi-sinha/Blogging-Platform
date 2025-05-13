const crypto = require('crypto');
const db = require('../config/db');

/**
 * Retrieves a public profile of a user by user ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getPublicProfile = async (req, res) => {
  try {
    const [user] = await db.execute(
      `SELECT userID, username, name, intro, profile
       FROM user
       WHERE userID = ?`,
      [req.params.userId]
    );

    if (!user.length) {
      return res.status(404).json({ message: "User  not found" });
    }

    res.json(user[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/**
 * Retrieves the account details of the authenticated user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getUserAccount = async (req, res) => {
  try {
    const [user] = await db.execute(
      `SELECT userID, username, email, name, createdAt
       FROM user
       WHERE userID = ?`,
      [req.user.id] // Using authenticated user from middleware
    );

    if (!user.length) {
      return res.status(404).json({ message: "User  not found" });
    }

    res.json(user[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch account details" });
  }
};

/**
 * Updates the user's profile information.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.updateProfile = async (req, res) => {
  try {
    const { username, name, email, intro } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!username || !name || !email) {
      return res.status(400).json({ message: "Username, name, and email are required" });
    }

    // Check if username or email already exists (excluding current user)
    const [userCheck] = await db.execute(
      `SELECT userID FROM user
       WHERE (username = ? OR email = ?) AND userID != ?`,
      [username, email, userId]
    );

    if (userCheck.length > 0) {
      return res.status(400).json({ message: "Username or email already in use" });
    }

    await db.execute(
      `UPDATE user
       SET username = ?, name = ?, email = ?, intro = ?
       WHERE userID = ?`,
      [username, name, email, intro || null, userId]
    );

    const [updatedUser ] = await db.execute(
      `SELECT userID, username, name, email, intro
       FROM user WHERE userID = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser [0]
    });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }  
};

/**
 * Changes the user's password.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current password hash
    const [user] = await db.execute(
      `SELECT password FROM user WHERE userID = ?`,
      [userId]
    );

    if (!user.length) {
      return res.status(404).json({ message: "User  not found" });
    }

    // Verify current password
    const bcrypt = require('bcrypt');
    const match = await bcrypt.compare(currentPassword, user[0].password);
    if (!match) return res.status(401).json({ message: "Current password is incorrect" });

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute(
      `UPDATE user SET password = ? WHERE userID = ?`,
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json ({ message: "Failed to change password" });
  }
};

/**
 * Updates the 'about' section of the user's profile.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.updateAbout = async (req, res) => {
  try {
    const { about } = req.body; // Expects { about: "New text here" }
    const userId = req.user.id;

    await db.execute(
      `UPDATE user SET profile = ? WHERE userID = ?`,
      [about, userId]
    );

    res.json({ 
      success: true, 
      message: "About section updated successfully" 
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update about section" });
  }
};