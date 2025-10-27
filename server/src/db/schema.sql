PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS bikes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS maintenance (
  id TEXT PRIMARY KEY,
  bike_id TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  mileage INTEGER NOT NULL DEFAULT 0,
  cost REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fuel (
  id TEXT PRIMARY KEY,
  bike_id TEXT NOT NULL,
  date TEXT NOT NULL,
  liters REAL NOT NULL DEFAULT 0,
  cost REAL NOT NULL DEFAULT 0,
  distance REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS parts (
  id TEXT PRIMARY KEY,
  bike_id TEXT NOT NULL,
  name TEXT NOT NULL,
  manufacturer TEXT,
  installed_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tours (
  id TEXT PRIMARY KEY,
  bike_id TEXT NOT NULL,
  name TEXT NOT NULL,
  start TEXT,
  "end" TEXT,
  distance REAL NOT NULL DEFAULT 0,
  gpx TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_maintenance_bike ON maintenance(bike_id);
CREATE INDEX IF NOT EXISTS idx_fuel_bike ON fuel(bike_id);
CREATE INDEX IF NOT EXISTS idx_parts_bike ON parts(bike_id);
CREATE INDEX IF NOT EXISTS idx_tours_bike ON tours(bike_id);

