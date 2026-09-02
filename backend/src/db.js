const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbFile = process.env.DB_FILE || path.join(__dirname, '..', 'data.sqlite');
const db = new Database(dbFile);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'tecnico', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT, email TEXT, address TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS service_orders (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, client_id INTEGER NOT NULL, assigned_to INTEGER, status TEXT NOT NULL DEFAULT 'aberta', priority TEXT NOT NULL DEFAULT 'normal', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (client_id) REFERENCES clients (id), FOREIGN KEY (assigned_to) REFERENCES users (id));
CREATE TABLE IF NOT EXISTS client_interactions (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER NOT NULL, type TEXT NOT NULL DEFAULT 'nota', note TEXT NOT NULL, created_by INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (client_id) REFERENCES clients (id), FOREIGN KEY (created_by) REFERENCES users (id));
`);

// Migracao leve: adiciona a coluna "status" em bancos criados antes do CRM
// (clients ja existentes continuam funcionando, so ganham o pipeline).
const clientColumns = db.prepare("PRAGMA table_info(clients)").all();
const hasStatus = clientColumns.some((col) => col.name === 'status');
if (!hasStatus) {
  db.exec("ALTER TABLE clients ADD COLUMN status TEXT NOT NULL DEFAULT 'lead'");
}

module.exports = db;
