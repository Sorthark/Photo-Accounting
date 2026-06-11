import { DatabaseSync } from 'node:sqlite'
import bcrypt from 'bcryptjs'
import { mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', 'data')
mkdirSync(dataDir, { recursive: true })

export const db = new DatabaseSync(join(dataDir, 'photo-accounting.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    studio_name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    default_price INTEGER NOT NULL DEFAULT 0,
    default_post_processing_qty INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    serial_no TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    client TEXT NOT NULL,
    cn TEXT NOT NULL DEFAULT '',
    project_id TEXT NOT NULL,
    price INTEGER NOT NULL,
    location TEXT NOT NULL DEFAULT '',
    post_processing_qty INTEGER NOT NULL DEFAULT 0,
    remarks TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE INDEX IF NOT EXISTS idx_records_user_date ON records(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
`)

export interface DbUser {
  id: string
  username: string
  password_hash: string
  studio_name: string
}

export interface DbProject {
  id: string
  user_id: string
  name: string
  color: string
  type: 'income' | 'expense'
  default_price: number
  default_post_processing_qty: number
}

export interface DbRecord {
  id: string
  user_id: string
  serial_no: string
  date: string
  time: string
  client: string
  cn: string
  project_id: string
  price: number
  location: string
  post_processing_qty: number
  remarks: string
}

const DEFAULT_PROJECTS = [
  { name: '写真', color: '#4A7CF7', type: 'income', default_price: 800, default_post_processing_qty: 10 },
  { name: '古风', color: '#6BA06B', type: 'income', default_price: 1200, default_post_processing_qty: 15 },
  { name: '情侣', color: '#E6A144', type: 'income', default_price: 700, default_post_processing_qty: 8 },
  { name: '汉服', color: '#A68AD4', type: 'income', default_price: 500, default_post_processing_qty: 5 },
  { name: '商拍', color: '#C8B28A', type: 'income', default_price: 150, default_post_processing_qty: 2 },
  { name: '道具采购', color: '#E57373', type: 'expense', default_price: 200, default_post_processing_qty: 0 },
] as const

export function seedDefaultProjects(userId: string) {
  const insert = db.prepare(`
    INSERT INTO projects (id, user_id, name, color, type, default_price, default_post_processing_qty)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  db.exec('BEGIN')
  try {
    for (const p of DEFAULT_PROJECTS) {
      insert.run(
        randomUUID(),
        userId,
        p.name,
        p.color,
        p.type,
        p.default_price,
        p.default_post_processing_qty,
      )
    }
    db.exec('COMMIT')
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
}

export function reindexRecords(userId: string) {
  const rows = db
    .prepare(`SELECT id FROM records WHERE user_id = ? ORDER BY date ASC, time ASC`)
    .all(userId) as { id: string }[]

  const update = db.prepare(`UPDATE records SET serial_no = ? WHERE id = ? AND user_id = ?`)
  db.exec('BEGIN')
  try {
    rows.forEach((row, index) => {
      update.run(String(index + 1).padStart(3, '0'), row.id, userId)
    })
    db.exec('COMMIT')
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
}

export function ensureAdminUser() {
  const existing = db.prepare(`SELECT id FROM users WHERE username = ?`).get('admin') as
    | { id: string }
    | undefined
  if (existing) return

  const id = randomUUID()
  const passwordHash = bcrypt.hashSync('123456', 10)
  db.prepare(
    `INSERT INTO users (id, username, password_hash, studio_name, created_at) VALUES (?, ?, ?, ?, ?)`,
  ).run(id, 'admin', passwordHash, 'Photo Studio', Date.now())
  seedDefaultProjects(id)
}

ensureAdminUser()
