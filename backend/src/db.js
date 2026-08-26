const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbFile = process.env.DB_FILE || path.join(__dirname, '..', 'data.sqlite');
const db = new Database(dbFile);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
              email TEXT UNIQUE NOT NULL,
                  password_hash TEXT NOT NULL,
                      role TEXT NOT NULL DEFAULT 'tecnico',
                          created_at TEXT DEFAULT CURRENT_TIMESTAMP
                            );

                              CREATE TABLE IF NOT EXISTS clients (
                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                      name TEXT NOT NULL,
                                          phone TEXT,
                                              email TEXT,
                                                  address TEXT,
                                                      created_at TEXT DEFAULT CURRENT_TIMESTAMP
                                                        );

                                                          CREATE TABLE IF NOT EXISTS service_orders (
                                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                  title TEXT NOT NULL,
                                                                      description TEXT,
                                                                          client_id INTEGER NOT NULL,
                                                                              assigned_to INTEGER,
                                                                                  status TEXT NOT NULL DEFAULT 'aberta',
                                                                                      priority TEXT NOT NULL DEFAULT 'normal',
                                                                                          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                                                                                              updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                                                                                                  FOREIGN KEY (client_id) REFERENCES clients (id),
                                                                                                      FOREIGN KEY (assigned_to) REFERENCES users (id)
                                                                                                        );
                                                                                                        `);

module.exports = db;
