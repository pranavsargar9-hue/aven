const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// GET /api/books?genre=Fantasy&search=dune
router.get('/', async (req, res) => {
  try {
    const { genre, search } = req.query;
    let sql = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (genre) {
      sql += ' AND genre = ?';
      params.push(genre);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR author LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY title ASC';

    const [rows] = await pool.query(sql, params);
    res.json({ books: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load the catalog.' });
  }
});

// GET /api/books/genres  -> distinct genre list, used to populate dropdowns
router.get('/genres', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT genre FROM books ORDER BY genre ASC');
    res.json({ genres: rows.map(r => r.genre) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load genres.' });
  }
});

// GET /api/books/random  -> for the Surprise Me feature
router.get('/random', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books ORDER BY RAND() LIMIT 1');
    if (rows.length === 0) return res.status(404).json({ error: 'The catalog is empty.' });
    res.json({ book: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not pick a book.' });
  }
});

// GET /api/books/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Book not found.' });
    res.json({ book: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load this book.' });
  }
});

module.exports = router;
