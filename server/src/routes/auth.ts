import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { db, seedDefaultProjects } from '../db.js'
import { authMiddleware, signToken } from '../middleware/auth.js'

const router = Router()

router.post('/register', (req, res) => {
  const { username, password, studioName } = req.body as {
    username?: string
    password?: string
    studioName?: string
  }

  if (!username?.trim() || !password || password.length < 6) {
    res.status(400).json({ message: '用户名不能为空，密码至少 6 位' })
    return
  }

  const exists = db
    .prepare(`SELECT id FROM users WHERE username = ? COLLATE NOCASE`)
    .get(username.trim())
  if (exists) {
    res.status(409).json({ message: '用户名已存在' })
    return
  }

  const id = randomUUID()
  const passwordHash = bcrypt.hashSync(password, 10)
  db.prepare(
    `INSERT INTO users (id, username, password_hash, studio_name, created_at) VALUES (?, ?, ?, ?, ?)`,
  ).run(id, username.trim(), passwordHash, studioName?.trim() || 'Photo Studio', Date.now())

  seedDefaultProjects(id)

  const token = signToken({ userId: id, username: username.trim() })
  res.status(201).json({
    token,
    user: { username: username.trim(), studioName: studioName?.trim() || 'Photo Studio' },
  })
})

router.post('/login', (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string }
  if (!username?.trim() || !password) {
    res.status(400).json({ message: '请输入用户名和密码' })
    return
  }

  const user = db
    .prepare(`SELECT id, username, password_hash, studio_name FROM users WHERE username = ? COLLATE NOCASE`)
    .get(username.trim()) as
    | { id: string; username: string; password_hash: string; studio_name: string }
    | undefined

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ message: '用户名或密码错误' })
    return
  }

  const token = signToken({ userId: user.id, username: user.username })
  res.json({
    token,
    user: { username: user.username, studioName: user.studio_name },
  })
})

router.get('/me', authMiddleware, (req, res) => {
  const user = db
    .prepare(`SELECT username, studio_name FROM users WHERE id = ?`)
    .get(req.auth!.userId) as { username: string; studio_name: string } | undefined
  if (!user) {
    res.status(404).json({ message: '用户不存在' })
    return
  }
  res.json({ username: user.username, studioName: user.studio_name })
})

router.patch('/profile', authMiddleware, (req, res) => {
  const { studioName } = req.body as { studioName?: string }
  if (!studioName?.trim()) {
    res.status(400).json({ message: '工作室名称不能为空' })
    return
  }
  db.prepare(`UPDATE users SET studio_name = ? WHERE id = ?`).run(
    studioName.trim(),
    req.auth!.userId,
  )
  res.json({ studioName: studioName.trim() })
})

export default router
