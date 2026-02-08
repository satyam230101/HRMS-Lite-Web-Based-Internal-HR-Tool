const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "hrms.sqlite");
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        department TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )`
    );
  });
};

module.exports = { db, initDb };
