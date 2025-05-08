const db = require('../config/db');

exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.execute(
      'SELECT * FROM category ORDER BY title'
    );
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { title, slug, content } = req.body;
    
    if (!title || !slug) {
      return res.status(400).json({ message: 'Title and slug are required' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO category (title, slug, content) VALUES (?, ?, ?)',
      [title, slug, content]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      title,
      slug,
      content
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
