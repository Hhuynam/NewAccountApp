const sqlite3 = require('sqlite3').verbose();

// Kết nối tới file database.db (tự tạo nếu chưa có)
const db = new sqlite3.Database('./database.db');

// Tạo bảng accounts nếu chưa tồn tại
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      plan TEXT,
      amount INTEGER,
      status TEXT,
      order_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;