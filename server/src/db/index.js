const { readFileSync } = require('fs');
const { join } = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const DATABASE_PATH = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'moto-dash.db');

async function createDatabase() {
  const db = await open({
    filename: DATABASE_PATH,
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA journal_mode = WAL;');
  await db.exec('PRAGMA foreign_keys = ON;');

  const schemaPath = join(process.cwd(), 'src', 'db', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  await db.exec(schema);

  return db;
}

module.exports = { createDatabase };
