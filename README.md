# AVEN — a personal reading management website

A full-stack reading tracker: discover books, keep a Want to Read list, track
progress on what you're currently reading, log completed books with ratings,
get simple genre-based recommendations, roll the dice with Surprise Me, and
see reading insights — all backed by your own MySQL database, with each
user's data kept completely separate.

## Stack

- **Backend:** Node.js + Express, MySQL (via `mysql2`), JWT auth, bcrypt password hashing
- **Frontend:** Plain HTML/CSS/JS (no build step) — served as static files by Express
- **Book covers:** fetched live from the Google Books API by title + author, so they stay accurate without hand-picking image URLs. If a cover can't be found, a styled placeholder with the title is shown instead.

## 1. Prerequisites

- Node.js 18+
- A running MySQL server (local install, or MySQL in Docker)

## 2. Set up the database

```bash
mysql -u root -p -e "CREATE DATABASE aven"
mysql -u root -p aven < database/schema.sql
mysql -u root -p aven < database/seed.sql
```

This creates the `users`, `books`, and `user_books` tables and loads a
starter catalog of ~40 books across nine genres.

## 3. Configure the app

```bash
cp .env.example .env
```

Open `.env` and fill in your MySQL credentials and a random `JWT_SECRET`.

## 4. Install & run

```bash
npm install
npm start
```

Visit **http://localhost:3000**. Register a new account, and you're in.

## How the pieces map to the spec

- **Auth:** `server/routes/auth.js` — register/login/logout (JWT, bcrypt-hashed passwords). Every table that stores reading data is scoped by `user_id`, so each account's TBR, currently reading, completed list, and insights are completely separate.
- **Catalog:** `database/seed.sql` — 40 books across Fantasy, Mystery, Romance, Science Fiction, Literary Fiction, Non-fiction, Horror, Historical Fiction, and Young Adult.
- **TBR / Currently Reading / Completed:** `server/routes/userBooks.js`, backed by the `user_books` table's `status` column (`TBR` / `READING` / `COMPLETED`), with `pages_read`, `rating`, `date_added`, and `date_completed` tracked per user, per book.
- **Dashboard & Insights:** both computed live with SQL aggregate queries against `user_books` — nothing is hardcoded. Reading streak is derived from the distinct calendar days on which a user updated any book's status or progress.
- **Recommendations:** simple genre filter against the catalog (`server/routes/recommendations.js`).
- **Surprise Me:** `GET /api/books/random`, using `ORDER BY RAND() LIMIT 1`.
- **Book details modal:** `public/js/cards.js` — fetches a single book and offers Add to TBR / Start Reading / Mark Completed, each of which writes to the database.

## Project structure

```
aven-app/
├── database/
│   ├── schema.sql       # users, books, user_books tables
│   └── seed.sql         # ~40 sample books
├── server/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── routes/auth.js
│   ├── routes/books.js
│   ├── routes/userBooks.js
│   ├── routes/recommendations.js
│   └── index.js
├── public/
│   ├── css/style.css
│   ├── js/{api,covers,nav,cards}.js
│   └── *.html           # one file per page
├── package.json
└── .env.example
```
