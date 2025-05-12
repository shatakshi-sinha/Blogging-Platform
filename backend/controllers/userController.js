exports.getPublicProfile = async (req, res) => {
  try {
    const [user] = await db.execute(
      `SELECT userID, username, name, intro, profile
         FROM user
         WHERE userID = ?`,
      [req.params.userId]
    );

    if (!user.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

exports.getUserAccount = async (req, res) => {
  try {
    const [user] = await db.execute(
      `SELECT userID, username, email, name, createdAt
       FROM user
       WHERE userID = ?`,
      [req.user.id] // Using authenticated user from middleware
    );




    if (!user.length) {
      return res.status(404).json({ message: "User not found" });
    }




    res.json(user[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch account details" });
  }
};




const crypto = require('crypto');
const db = require('../config/db');




exports.updateProfile = async (req, res) => {
  try {
    const { username, name, email, intro } = req.body;
    const userId = req.user.id;




    // Validate required fields
    if (!username || !name || !email) {
      return res.status(400).json({ message: "Username, name and email are required" });
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




    const [updatedUser] = await db.execute(
      `SELECT userID, username, name, email, intro
       FROM user WHERE userID = ?`,
      [userId]
    );




    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser[0]
    });
  } catch (err) {
    console.error("Update profile error:", err.message);  // ✅ Add this line
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }  
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 1. Get current password hash
    const [user] = await db.execute(
      `SELECT password FROM user WHERE userID = ?`,
      [userId]
    );

    if (!user.length) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Verify current password (MD5)
    const bcrypt = require('bcrypt');
// During comparison
const match = await bcrypt.compare(currentPassword, user[0].password);
if (!match) return res.status(401).json({ message: "Current password is incorrect" });

// During update
const hashedPassword = await bcrypt.hash(newPassword, 10);
await db.execute(
  `UPDATE user SET password = ? WHERE userID = ?`,
  [hashedPassword, userId]
);

    // 4. Update password
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
    res.status(500).json({ message: "Failed to change password" });
  }
};
