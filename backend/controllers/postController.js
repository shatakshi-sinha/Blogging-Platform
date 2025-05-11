const db = require("../config/db");


exports.getAllPosts = async (req, res) => {
  try {
    // First get all published posts
    const [posts] = await db.execute(`
      SELECT p.*, p.description, u.username, u.name
      FROM post p
      JOIN user u ON p.userID = u.userID
      WHERE p.status = 'published'
      ORDER BY p.createdAt DESC
    `);


    // Get categories for each post
    const postsWithCategories = await Promise.all(
      posts.map(async (post) => {
        const [categories] = await db.execute(
          `
        SELECT c.catID, c.title, c.slug
        FROM post_category pc
        JOIN category c ON pc.categoryId = c.catID
        WHERE pc.postId = ?
      `,
          [post.postID]
        );


        return {
          ...post,
          categories,
        };
      })
    );


    res.json(postsWithCategories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// backend/controllers/postController.js
// In postController.js - update getPostById
// Update getPostById to include nested comments
exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;


    // 1. Get the post
    const [posts] = await db.execute(
      `
      SELECT p.*, p.description, u.username, u.name
      FROM post p
      JOIN user u ON p.userID = u.userID
      WHERE p.postID = ? AND p.status = 'published'
    `,
      [postId]
    );


    if (posts.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }


    // 2. Get categories
    const [categories] = await db.execute(
      `
      SELECT c.catID, c.title, c.slug
      FROM post_category pc
      JOIN category c ON pc.categoryId = c.catID
      WHERE pc.postId = ?
    `,
      [postId]
    );


    // 3. Get comments with replies (nested)
    const [comments] = await db.execute(
      `
      SELECT
        pc.*,
        u.username,
        u.name,
        u.userID
      FROM post_comment pc
      JOIN user u ON pc.userID = u.userID
      WHERE pc.postID = ?
      ORDER BY pc.createdAt ASC
    `,
      [postId]
    );


    // Build comment tree
    const buildCommentTree = (comments, parentId = null) => {
      return comments
        .filter((comment) => {
          if (parentId === null) {
            return comment.parentCommentID === null;
          }
          return comment.parentCommentID === parentId;
        })
        .map((comment) => ({
          ...comment,
          replies: buildCommentTree(comments, comment.commentID),
        }));
    };


    const nestedComments = buildCommentTree(comments);


    res.json({
      ...posts[0],
      categories,
      comments: nestedComments,
    });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ message: "Server error while fetching post" });
  }
};


/*exports.createPost = async (req, res) => {
  try {
    const { title, slug, content, categoryIds = [] } = req.body;
   
    if (!title || !slug || !content) {
      return res.status(400).json({ message: 'Title, slug and content are required' });
    }
   
    // Insert post
    const [result] = await db.execute(
      'INSERT INTO post (userID, title, slug, content, createdAt) VALUES (?, ?, ?, ?, NOW())',
      [req.user.id, title, slug, content]
    );
   
    const postId = result.insertId;
   
    // Add categories if provided
    if (categoryIds.length > 0) {
      const values = categoryIds.map(catId => [postId, catId]);
      await db.query(
        'INSERT INTO post_category (postId, categoryId) VALUES ?',
        [values]
      );
    }
   
    res.status(201).json({
      id: postId,
      title,
      slug,
      content
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};*/


exports.createPost = async (req, res) => {
  try {
    const { title, slug, content, description, categoryIds } = req.body;
    const userId = req.user.id; // From auth middleware


    // Validate required fields
    if (!title || !slug) {
      return res.status(400).json({ message: "Title and slug are required" });
    }


    // Create post
    const [result] = await db.execute(
      `INSERT INTO post
      (userID, title, slug, createdAt, content, description, status)
      VALUES (?, ?, ?, NOW(), ?, ?, 'published')`,
      [userId, title, slug, content, description] // Add description
    );


    // Handle categories if provided
    if (categoryIds && categoryIds.length > 0) {
      for (const categoryId of categoryIds) {
        await db.execute(
          "INSERT INTO post_category (postId, categoryId) VALUES (?, ?)",
          [result.insertId, categoryId]
        );
      }
    }


    // Return the created post with author info
    const [newPost] = await db.execute(
      `SELECT p.*, u.username, u.name as authorName
       FROM post p
       JOIN user u ON p.userID = u.userID
       WHERE p.postID = ?`,
      [result.insertId]
    );


    res.status(201).json(newPost[0]);
  } catch (err) {
    console.error(err);


    // Handle duplicate slug error
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Slug must be unique" });
    }


    res.status(500).json({ message: "Server error" });
  }
};


exports.updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const postId = req.params.id;


    // Validate required fields
    if (title === undefined || content === undefined) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
        received: { title, content },
      });
    }


    // Convert empty strings to null
    const cleanTitle = title.trim() === "" ? null : title;
    const cleanContent = content.trim() === "" ? null : content;


    // Debug log the values
    console.log("Updating post with:", {
      postId,
      title: cleanTitle,
      content: cleanContent,
    });


    const [result] = await db.execute(
    `UPDATE post
      SET title = ?, content = ?, description = ?, updatedAt = NOW()
      WHERE postID = ?`,
    [cleanTitle, cleanContent, req.body.description, postId] // Add description
    );


    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "No post found with that ID",
      });
    }


    res.json({
      success: true,
      message: "Post updated successfully",
      postId,
    });
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update post",
      error:
        process.env.NODE_ENV === "development"
          ? {
              message: err.message,
              stack: err.stack,
            }
          : undefined,
    });
  }
};


exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;


    // Verify post exists and belongs to user
    const [posts] = await db.execute(
      "SELECT * FROM post WHERE postID = ? AND userID = ?",
      [postId, req.user.id]
    );


    if (posts.length === 0) {
      return res
        .status(404)
        .json({ message: "Post not found or not authorized" });
    }


    // Delete post (CASCADE will handle related records in post_category and post_comment)
    await db.execute("DELETE FROM post WHERE postID = ?", [postId]);


    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Add this right before module.exports
exports.getPostsByUser = async (req, res) => {
  try {
    const [posts] = await db.execute(
      `SELECT p.* FROM post p
       WHERE p.userID = ?
       ORDER BY p.createdAt DESC`,
      [req.user.id]
    );
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getPostsByCurrentUser = async (req, res) => {
  try {
    const [posts] = await db.execute(
      `SELECT p.*,
       (SELECT COUNT(*) FROM post_comment WHERE postID = p.postID) as commentCount
       FROM post p
       WHERE p.userID = ?
       ORDER BY p.createdAt DESC`,
      [req.user.id]
    );
    res.json(posts);
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({
      message: "Failed to fetch your posts",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};


// Keep your existing methods but remove ownership checks from them
// since that's now handled by the middleware
exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;


    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }


    const [result] = await db.execute(
      `INSERT INTO post_comment (postID, userID, content, createdAt)
       VALUES (?, ?, ?, NOW())`,
      [postId, req.user.id, content.trim()]
    );


    // Get comment with author details
    const [comment] = await db.execute(
      `SELECT
        pc.*,
        u.username,
        u.name
       FROM post_comment pc
       JOIN user u ON pc.userID = u.userID
       WHERE pc.commentID = ?`,
      [result.insertId]
    );


    res.status(201).json(comment[0]);
  } catch (err) {
    console.error("Comment creation error:", err);
    res.status(500).json({
      message: "Failed to add comment",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};


exports.getComments = async (req, res) => {
  try {
    const [comments] = await db.execute(
      `SELECT
        pc.*,
        u.username,
        u.name
       FROM post_comment pc
       JOIN user u ON pc.userID = u.userID
       WHERE pc.postID = ?
       ORDER BY pc.createdAt DESC`,
      [req.params.id]
    );
    res.json(comments);
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ message: "Failed to load comments" });
  }
};
