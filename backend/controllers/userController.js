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
