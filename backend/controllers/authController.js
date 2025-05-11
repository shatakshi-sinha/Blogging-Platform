const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    // Validate input
    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const [existing] = await db.execute(
      'SELECT * FROM user WHERE email = ? OR username = ?',
      [email, username]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const [result] = await db.execute(
      'INSERT INTO user (username, name, email, password) VALUES (?, ?, ?, ?)',
      [username, name, email, hashedPassword]
    );
    
    // Generate token
    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      id: result.insertId,
      username,
      name,
      email,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const [users] = await db.execute(
      'SELECT * FROM user WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT
    const token = jwt.sign(
      { id: user.userID, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ 
      id: user.userID,
      username: user.username,
      name: user.name,
      email: user.email,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const [user] = await db.execute(
      'SELECT userID, username, name, email, intro, profile FROM user WHERE userID = ?',
      [req.user.id]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add to authController.js
exports.checkAuth = async (req, res) => {
    try {
      if (!req.user) {
        return res.json({ isAuthenticated: false });
      }
      
      const [user] = await db.execute(
        'SELECT userID, username, name, email FROM user WHERE userID = ?',
        [req.user.id]
      );
      
      if (user.length === 0) {
        return res.json({ isAuthenticated: false });
      }
      
      res.json({ 
        isAuthenticated: true,
        user: user[0]
      });
    } catch (err) {
      console.error(err);
      res.json({ isAuthenticated: false });
    }
  };

  exports.deleteUser = async (req, res) => {
    try {
      const [result] = await db.execute(
        'DELETE FROM user WHERE userID = ?',
        [req.user.id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found or already deleted' });
      }
  
      res.status(200).json({ message: 'User account deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error during deletion' });
    }
  };
  