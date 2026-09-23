-- AVEN database schema
-- Run this once against a fresh database:
--   mysql -u root -p aven < database/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre VARCHAR(80) NOT NULL,
  description TEXT,
  cover VARCHAR(500),
  pages INT NOT NULL,
  publication_year INT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  status ENUM('TBR', 'READING', 'COMPLETED') NOT NULL DEFAULT 'TBR',
  pages_read INT NOT NULL DEFAULT 0,
  rating INT NULL,
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_completed TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ub_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  CONSTRAINT uq_user_book UNIQUE (user_id, book_id),
  CONSTRAINT chk_rating CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
);

CREATE INDEX idx_userbooks_user_status ON user_books(user_id, status);
