const express = require('express');
const pool = require('../config/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET /api/recommendations?genre=Fantasy
router.get('/', requireAuth, async (req, res) => {
  try {
    const { genre } = req.query;
    if (!genre) return res.status(400).json({ error: 'Please choose a genre.' });

    const [rows] = await pool.query(
      `SELECT b.*, ub.status AS user_status
       FROM books b
       LEFT JOIN user_books ub ON ub.book_id = b.id AND ub.user_id = ?
       WHERE b.genre = ?
       ORDER BY b.title ASC`,
      [req.userId, genre]
    );

    res.json({ books: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not build recommendations.' });
  }
});

module.exports = router;
