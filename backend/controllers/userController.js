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

exports.updateProfileInfo = async (req, res) => {
  try {
    const { name, intro, profile } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    await db.execute(
      `UPDATE user
         SET name = ?, intro = ?, profile = ?
         WHERE userID = ?`,
      [name, intro || null, profile || null, userId]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: { name, intro, profile },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
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
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
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
    const currentMD5 = crypto.createHash('md5').update(currentPassword).digest('hex');
    if (currentMD5 !== user[0].password) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }




    // 3. Hash new password (MD5)
    const newMD5 = crypto.createHash('md5').update(newPassword).digest('hex');




    // 4. Update password
    await db.execute(
      `UPDATE user SET password = ? WHERE userID = ?`,
      [newMD5, userId]
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
