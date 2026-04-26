const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function resolveDbPath() {
  if (!process.env.DATABASE_URL) {
    return path.join(__dirname, '..', 'database.sqlite');
  }
  if (process.env.DATABASE_URL === ':memory:') {
    return ':memory:';
  }
  return path.resolve(process.cwd(), process.env.DATABASE_URL);
}

const dbPath = resolveDbPath();

const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function init() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await run(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      input_prompt TEXT NOT NULL,
      response_json TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  await ensureHistoryTitleColumn();
  await ensureUserProfileColumns();
}

async function ensureHistoryTitleColumn() {
  const columns = await all(`PRAGMA table_info(history)`);
  const names = new Set(columns.map((c) => c.name));
  if (!names.has('title')) {
    await run(`ALTER TABLE history ADD COLUMN title TEXT`);
  }
}

async function ensureUserProfileColumns() {
  const columns = await all(`PRAGMA table_info(users)`);
  const names = new Set(columns.map((c) => c.name));
  const additions = [
    ['display_name', 'TEXT'],
    ['headline', 'TEXT'],
    ['bio', 'TEXT'],
    ['location', 'TEXT'],
    ['website', 'TEXT'],
    ['avatar_url', 'TEXT'],
    ['github_url', 'TEXT'],
    ['linkedin_url', 'TEXT'],
    ['twitter_url', 'TEXT'],
  ];
  for (const [name, type] of additions) {
    if (!names.has(name)) {
      await run(`ALTER TABLE users ADD COLUMN ${name} ${type}`);
    }
  }
}

module.exports = {
  db,
  run,
  get,
  all,
  init,
};
