const db = require('../config/db');

/**
 * Allows a user to react to a post.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.reactToPost = async (req, res) => {
  try {
    const { postId, reactionType } = req.body;
    const userId = req.user.id;

    // Remove any existing reaction from this user
    await db.execute(
      `DELETE FROM post_reactions 
       WHERE userID = ? AND postID = ?`,
      [userId, postId]
    );

    // If reactionType is provided, add new reaction
    if (reactionType) {
      await db.execute(
        `INSERT INTO post_reactions 
         (postID, userID, reactionTypeID, createdAt)
         VALUES (?, ?, (
           SELECT reactionTypeID FROM reaction_types WHERE name = ?
         ), NOW())`,
        [postId, userId, reactionType]
      );
    }

    // Get updated reaction counts
    const [reactions] = await db.execute(`
      SELECT rt.name, COUNT(pr.reactionID) as count
      FROM reaction_types rt
      LEFT JOIN post_reactions pr ON rt.reactionTypeID = pr.reactionTypeID AND pr.postID = ?
      GROUP BY rt.name
    `, [postId]);

    res.json({
      success: true,
      reactions: reactions.reduce((acc, curr) => {
        acc[curr.name] = curr.count;
        return acc;
      }, {})
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Retrieves the reactions for a specific post.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getPostReactions = async (req, res) => {
  try {
    const { postId } = req.params;

    const [reactions] = await db.execute(`
      SELECT rt.name, COUNT(pr.reactionID) as count
      FROM reaction_types rt
      LEFT JOIN post_reactions pr ON rt.reactionTypeID = pr.reactionTypeID AND pr.postID = ?
      GROUP BY rt.name
    `, [postId]);

    // Get user's reaction if authenticated
    let userReaction = null;
    if (req.user) {
      const [userReactions] = await db.execute(`
        SELECT rt.name 
        FROM post_reactions pr
        JOIN reaction_types rt ON pr.reactionTypeID = rt.reactionTypeID
        WHERE pr.userID = ? AND pr.postID = ?
      `, [req.user.id, postId]);
      userReaction = userReactions[0]?.name || null;
    }

    res.json({
      success: true,
      reactions: reactions.reduce((acc, curr) => {
        acc[curr.name] = curr.count;
        return acc;
      }, {}),
      userReaction
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
