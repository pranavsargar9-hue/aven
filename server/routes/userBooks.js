const express = require('express');
const pool = require('../config/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const VALID_STATUSES = ['TBR', 'READING', 'COMPLETED'];

function validateStatus(status) {
  return status === undefined || VALID_STATUSES.includes(status);
}
function validateRating(rating) {
  return rating === undefined || rating === null || (Number.isInteger(rating) && rating >= 1 && rating <= 5);
}
function validatePagesRead(pages_read) {
  return pages_read === undefined || (Number.isInteger(pages_read) && pages_read >= 0);
}

// GET /api/user-books?status=TBR|READING|COMPLETED  -> the user's books, joined with catalog info
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT ub.id, ub.status, ub.pages_read, ub.rating, ub.date_added, ub.date_completed,
             b.id AS book_id, b.title, b.author, b.genre, b.description, b.cover, b.pages, b.publication_year
      FROM user_books ub
      JOIN books b ON b.id = ub.book_id
      WHERE ub.user_id = ?
    `;
    const params = [req.userId];
    if (status) {
      sql += ' AND ub.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY ub.updated_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json({ books: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load your books.' });
  }
});

// POST /api/user-books  { book_id, status }  -> add a book to a shelf (defaults to TBR)
router.post('/', async (req, res) => {
  try {
    const { book_id, status } = req.body;
    if (!book_id) return res.status(400).json({ error: 'book_id is required.' });
    if (!validateStatus(status)) return res.status(400).json({ error: 'Invalid status.' });

    const [[book]] = await pool.query('SELECT pages FROM books WHERE id = ?', [book_id]);
    if (!book) return res.status(404).json({ error: 'That book does not exist.' });

    const finalStatus = status || 'TBR';
    const isCompleted = finalStatus === 'COMPLETED';
    const totalPages = isCompleted ? book.pages : 0;

    await pool.query(
      `INSERT INTO user_books (user_id, book_id, status, date_completed, pages_read)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status),
         date_completed = IF(VALUES(status) = 'COMPLETED', COALESCE(date_completed, NOW()), date_completed),
         pages_read = IF(VALUES(status) = 'COMPLETED', VALUES(pages_read), pages_read)`,
      [req.userId, book_id, finalStatus, isCompleted ? new Date() : null, isCompleted ? totalPages : 0]
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add this book.' });
  }
});

// PATCH /api/user-books/:bookId  { status?, pages_read?, rating? }
router.patch('/:bookId', async (req, res) => {
  try {
    const { status, pages_read, rating } = req.body;

    if (!validateStatus(status)) return res.status(400).json({ error: 'Invalid status.' });
    if (!validateRating(rating)) return res.status(400).json({ error: 'Rating must be a whole number from 1 to 5.' });
    if (!validatePagesRead(pages_read)) return res.status(400).json({ error: 'Pages read must be a non-negative whole number.' });

    const [existing] = await pool.query(
      `SELECT ub.*, b.pages AS total_pages FROM user_books ub
       JOIN books b ON b.id = ub.book_id
       WHERE ub.user_id = ? AND ub.book_id = ?`,
      [req.userId, req.params.bookId]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'This book is not on your shelf yet.' });

    const totalPages = existing[0].total_pages;
    const clampedPagesRead = pages_read !== undefined ? Math.min(pages_read, totalPages) : undefined;

    const fields = [];
    const params = [];

    if (status) {
      fields.push('status = ?');
      params.push(status);
      if (status === 'COMPLETED') {
        fields.push('date_completed = COALESCE(date_completed, NOW())');
        fields.push('pages_read = ?');
        params.push(totalPages);
      }
    }
    if (clampedPagesRead !== undefined && status !== 'COMPLETED') {
      fields.push('pages_read = ?');
      params.push(clampedPagesRead);
    }
    if (rating !== undefined) {
      fields.push('rating = ?');
      params.push(rating);
    }

    if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update.' });

    params.push(req.userId, req.params.bookId);
    await pool.query(
      `UPDATE user_books SET ${fields.join(', ')} WHERE user_id = ? AND book_id = ?`,
      params
    );

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update this book.' });
  }
});

// DELETE /api/user-books/:bookId
router.delete('/:bookId', async (req, res) => {
  try {
    await pool.query('DELETE FROM user_books WHERE user_id = ? AND book_id = ?', [req.userId, req.params.bookId]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not remove this book.' });
  }
});

async function calcStreak(userId) {
  const [rows] = await pool.query(
    'SELECT DISTINCT DATE(updated_at) AS d FROM user_books WHERE user_id = ? ORDER BY d DESC',
    [userId]
  );
  if (rows.length === 0) return 0;

  const toKey = (d) => new Date(d).toISOString().slice(0, 10);
  const dateSet = new Set(rows.map(r => toKey(r.d)));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mostRecent = new Date(rows[0].d);
  mostRecent.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today - mostRecent) / 86400000);
  if (diffDays > 1) return 0; // most recent activity was more than a day ago: streak is over

  let streak = 0;
  const cursor = new Date(mostRecent);
  while (dateSet.has(toKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// GET /api/user-books/stats/dashboard
router.get('/stats/dashboard', async (req, res) => {
  try {
    const userId = req.userId;

    const [[counts]] = await pool.query(
      `SELECT
        SUM(status = 'COMPLETED') AS booksRead,
        SUM(status = 'READING') AS currentlyReading,
        SUM(status = 'TBR') AS tbr
      FROM user_books WHERE user_id = ?`,
      [userId]
    );

    const [currentlyReading] = await pool.query(
      `SELECT b.id, b.title, b.author, b.genre, b.cover, b.pages, ub.pages_read
       FROM user_books ub JOIN books b ON b.id = ub.book_id
       WHERE ub.user_id = ? AND ub.status = 'READING'
       ORDER BY ub.updated_at DESC LIMIT 4`,
      [userId]
    );

    const [recentlyCompleted] = await pool.query(
      `SELECT b.id, b.title, b.author, b.genre, b.cover, b.pages, b.publication_year, ub.rating, ub.date_completed
       FROM user_books ub JOIN books b ON b.id = ub.book_id
       WHERE ub.user_id = ? AND ub.status = 'COMPLETED'
       ORDER BY ub.date_completed DESC LIMIT 4`,
      [userId]
    );

    const streak = await calcStreak(userId);

    res.json({
      booksRead: counts.booksRead || 0,
      currentlyReading: counts.currentlyReading || 0,
      tbr: counts.tbr || 0,
      streak,
      currentlyReadingBooks: currentlyReading,
      recentlyCompleted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load your dashboard.' });
  }
});

// GET /api/user-books/stats/insights
router.get('/stats/insights', async (req, res) => {
  try {
    const userId = req.userId;

    const [[counts]] = await pool.query(
      `SELECT
        SUM(status = 'COMPLETED') AS booksRead,
        SUM(status = 'READING') AS currentlyReading,
        SUM(status = 'TBR') AS tbr
      FROM user_books WHERE user_id = ?`,
      [userId]
    );

    const [[pagesRow]] = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN ub.status = 'COMPLETED' THEN b.pages ELSE ub.pages_read END), 0) AS pagesRead
       FROM user_books ub JOIN books b ON b.id = ub.book_id
       WHERE ub.user_id = ? AND ub.status IN ('COMPLETED', 'READING')`,
      [userId]
    );

    const [genreRows] = await pool.query(
      `SELECT b.genre, COUNT(*) AS cnt
       FROM user_books ub JOIN books b ON b.id = ub.book_id
       WHERE ub.user_id = ? AND ub.status = 'COMPLETED'
       GROUP BY b.genre ORDER BY cnt DESC LIMIT 1`,
      [userId]
    );

    const [[ratingRow]] = await pool.query(
      `SELECT AVG(rating) AS avgRating FROM user_books WHERE user_id = ? AND rating IS NOT NULL`,
      [userId]
    );

    const [genreBreakdown] = await pool.query(
      `SELECT b.genre, COUNT(*) AS cnt
       FROM user_books ub JOIN books b ON b.id = ub.book_id
       WHERE ub.user_id = ? AND ub.status = 'COMPLETED'
       GROUP BY b.genre ORDER BY cnt DESC`,
      [userId]
    );

    res.json({
      booksRead: counts.booksRead || 0,
      currentlyReading: counts.currentlyReading || 0,
      tbr: counts.tbr || 0,
      pagesRead: pagesRow.pagesRead || 0,
      favoriteGenre: genreRows.length ? genreRows[0].genre : null,
      averageRating: ratingRow.avgRating ? Math.round(ratingRow.avgRating * 10) / 10 : null,
      genreBreakdown
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load your insights.' });
  }
});

module.exports = router;
